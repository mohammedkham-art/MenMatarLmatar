import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal } from '@/services/deals/get-deals';
import {
  resolveCheapThreshold,
  type CheapDealThresholds,
} from '@/services/notifications/region-map';
import {
  sendExpoPushNotifications,
  type ExpoPushMessage,
} from '@/services/notifications/expo-push';

// Business logic: decides whether a deal warrants a push notification,
// picks the audience, sends, and logs. No retry on the Expo send (a
// documented limitation of sendExpoPushNotifications).

export type DispatchResult =
  | {
      category: 'flash' | 'cheap';
      eligible_tokens: number;
      sent: number;
      failed: number;
      removed_tokens: number;
    }
  | { sent: 0; skipped: 0; reason: 'not_eligible' | 'error' };

type NotificationCategory = 'flash' | 'cheap';

type CandidateToken = {
  id: string;
  expo_push_token: string;
};

type RecentLogRow = {
  token_id: string;
  deal_id: string | null;
  sent_at: string;
};

const DORMANT_TOKEN_DAYS = 60;
const DEFAULT_COOLDOWN_HOURS = 8;
const DEFAULT_MAX_PER_DAY = 1;
// Wide enough to cover any same-day (Casablanca) log plus the cooldown
// window; precise filtering is then done in JS.
const LOG_LOOKBACK_HOURS = 48;

function casablancaDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

export function buildDealPushMessage(
  deal: Deal,
  category: NotificationCategory,
  expoPushToken: string,
): ExpoPushMessage {
  const origin = deal.fromCity.trim() || deal.fromAirport;
  const destination = deal.toCity.trim() || deal.toAirport;
  const route =
    origin && destination ? `${origin} → ${destination}` : deal.title;
  const price = deal.priceMad.toLocaleString('fr-MA');

  return {
    to: expoPushToken,
    sound: 'default',
    priority: 'high',
    title: category === 'flash' ? '⚡ Deal éclair' : '✈️ Bon plan voyage',
    body: `${route} à ${price} MAD`,
    data: { dealId: deal.id, slug: deal.slug, category },
  };
}

export async function dispatchDealNotification(
  deal: Deal,
): Promise<DispatchResult> {
  try {
    const supabase = createAdminSupabaseClient();

    // ÉTAPE 2 (config) — chargée en amont car la catégorie 'cheap' en
    // a besoin pour le seuil.
    const { data: configRows } = await supabase
      .from('notification_config')
      .select('key, value')
      .in('key', ['cheap_deal_thresholds', 'cooldown_hours', 'max_per_day']);

    const configMap = new Map(
      (configRows ?? []).map((row) => [row.key as string, row.value]),
    );

    // ÉTAPE 1 — Catégorie
    let category: NotificationCategory;

    if (deal.isFlash) {
      category = 'flash';
    } else {
      const thresholds = configMap.get('cheap_deal_thresholds') as
        | CheapDealThresholds
        | undefined;

      if (!thresholds) {
        return { sent: 0, skipped: 0, reason: 'not_eligible' };
      }

      const threshold = resolveCheapThreshold(deal, thresholds);

      if (deal.priceMad <= threshold) {
        category = 'cheap';
      } else {
        return { sent: 0, skipped: 0, reason: 'not_eligible' };
      }
    }

    const cooldownHoursRaw = configMap.get('cooldown_hours');
    const maxPerDayRaw = configMap.get('max_per_day');
    const cooldownHours =
      typeof cooldownHoursRaw === 'number'
        ? cooldownHoursRaw
        : DEFAULT_COOLDOWN_HOURS;
    const maxPerDay =
      typeof maxPerDayRaw === 'number' ? maxPerDayRaw : DEFAULT_MAX_PER_DAY;

    // ÉTAPE 3 — Tokens éligibles
    const now = new Date();
    const dormantCutoff = new Date(
      now.getTime() - DORMANT_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const prefColumn =
      category === 'flash' ? 'notify_flash_deals' : 'notify_cheap_deals';

    const { data: candidateRows, error: candidateError } = await supabase
      .from('push_tokens')
      .select('id, expo_push_token')
      .eq(prefColumn, true)
      .gt('last_seen_at', dormantCutoff);

    if (candidateError) {
      throw new Error(candidateError.message);
    }

    const candidates = (candidateRows ?? []) as CandidateToken[];

    if (candidates.length === 0) {
      return {
        category,
        eligible_tokens: 0,
        sent: 0,
        failed: 0,
        removed_tokens: 0,
      };
    }

    const candidateIds = candidates.map((token) => token.id);

    // Exclusions : logs déjà présents pour ce deal + logs récents
    // (cooldown / max-par-jour). Deux requêtes simples puis filtrage
    // JS — plus maintenable qu'une fonction RPC (qui exigerait une
    // migration DB) et plus robuste qu'un .or() à composer.
    const lookbackCutoff = new Date(
      now.getTime() - LOG_LOOKBACK_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const [dealLogResult, recentLogResult] = await Promise.all([
      supabase
        .from('push_notification_log')
        .select('token_id, deal_id, sent_at')
        .in('token_id', candidateIds)
        .eq('deal_id', deal.id),
      supabase
        .from('push_notification_log')
        .select('token_id, deal_id, sent_at')
        .in('token_id', candidateIds)
        .gt('sent_at', lookbackCutoff),
    ]);

    if (dealLogResult.error) {
      throw new Error(dealLogResult.error.message);
    }

    if (recentLogResult.error) {
      throw new Error(recentLogResult.error.message);
    }

    const alreadyNotifiedTokenIds = new Set(
      (dealLogResult.data ?? []).map((row) => (row as RecentLogRow).token_id),
    );

    const cooldownThreshold = now.getTime() - cooldownHours * 60 * 60 * 1000;
    const todayCasablanca = casablancaDate(now);
    const cooldownHitTokenIds = new Set<string>();
    const todayCountByTokenId = new Map<string, number>();

    for (const row of (recentLogResult.data ?? []) as RecentLogRow[]) {
      const sentTime = new Date(row.sent_at).getTime();

      if (sentTime > cooldownThreshold) {
        cooldownHitTokenIds.add(row.token_id);
      }

      if (casablancaDate(row.sent_at) === todayCasablanca) {
        todayCountByTokenId.set(
          row.token_id,
          (todayCountByTokenId.get(row.token_id) ?? 0) + 1,
        );
      }
    }

    const eligibleTokens = candidates.filter((token) => {
      if (alreadyNotifiedTokenIds.has(token.id)) {
        return false;
      }

      if (cooldownHitTokenIds.has(token.id)) {
        return false;
      }

      if ((todayCountByTokenId.get(token.id) ?? 0) >= maxPerDay) {
        return false;
      }

      return true;
    });

    if (eligibleTokens.length === 0) {
      return {
        category,
        eligible_tokens: 0,
        sent: 0,
        failed: 0,
        removed_tokens: 0,
      };
    }

    // ÉTAPE 4 — Messages
    const messages = eligibleTokens.map((token) =>
      buildDealPushMessage(deal, category, token.expo_push_token),
    );

    // ÉTAPE 5 — Envoi
    const result = await sendExpoPushNotifications(messages);

    // ÉTAPE 6 — Log (batch). On saute les tokens supprimés par
    // expo-push (DeviceNotRegistered) : leur ligne push_tokens
    // n'existe plus, l'INSERT casserait la FK.
    const removedSet = new Set(result.removed_tokens);
    const sentAt = new Date().toISOString();
    const logRows = eligibleTokens
      .map((token, index) => {
        const ticket = result.tickets[index];

        return {
          token_id: token.id,
          deal_id: deal.id,
          category,
          sent_at: sentAt,
          expo_receipt_id: ticket?.id ?? null,
          status: ticket?.status === 'ok' ? 'ok' : 'error',
          expo_push_token: token.expo_push_token,
        };
      })
      .filter((row) => !removedSet.has(row.expo_push_token))
      .map(({ expo_push_token: _unused, ...row }) => row);

    if (logRows.length > 0) {
      await supabase
        .from('push_notification_log')
        .upsert(logRows, {
          onConflict: 'token_id,deal_id',
          ignoreDuplicates: true,
        });
    }

    // ÉTAPE 7 — Résultat
    console.log(
      `[dispatch] category=${category} eligible=${eligibleTokens.length} sent=${result.sent} failed=${result.failed}`,
    );

    return {
      category,
      eligible_tokens: eligibleTokens.length,
      sent: result.sent,
      failed: result.failed,
      removed_tokens: result.removed_tokens.length,
    };
  } catch (error) {
    console.error(
      `[dispatch] error: ${error instanceof Error ? error.message : 'unknown'}`,
    );

    return { sent: 0, skipped: 0, reason: 'error' };
  }
}
