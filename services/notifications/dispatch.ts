import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal } from '@/services/deals/get-deals';
import {
  sendExpoPushNotifications,
  type ExpoPushMessage,
} from '@/services/notifications/expo-push';

export type DispatchResult =
  | {
      category: 'flash' | 'cheap' | 'new_deal' | 'update';
      eligible_tokens: number;
      sent: number;
      failed: number;
      removed_tokens: number;
    }
  | { sent: 0; skipped: 0; reason: 'not_eligible' | 'error' };

type NotificationCategory = 'flash' | 'cheap' | 'new_deal' | 'update';

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
const LOG_LOOKBACK_HOURS = 48;

function casablancaDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
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
  const destFlag = deal.countryCode ? countryCodeToFlag(deal.countryCode) : '';

  const title =
    category === 'flash'
      ? '⚡ Deal éclair'
      : category === 'new_deal'
        ? '🆕 Nouvelle offre !'
        : category === 'update'
          ? '💰 Prix mis à jour'
          : '✈️ Bon plan voyage';

  return {
    to: expoPushToken,
    sound: 'default',
    priority: 'high',
    title,
    body: `🇲🇦 ${route} ${destFlag} à ${price} MAD`,
    data: { dealId: deal.id, slug: deal.slug, category },
  };
}
export async function dispatchDealNotification(
  deal: Deal,
  trigger: 'create' | 'update' = 'update',
): Promise<DispatchResult> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: configRows } = await supabase
      .from('notification_config')
      .select('key, value')
      .in('key', ['cooldown_hours', 'max_per_day']);

    const configMap = new Map(
      (configRows ?? []).map((row) => [row.key as string, row.value]),
    );

    // Catégorie
    let category: NotificationCategory;

    if (deal.isFlash) {
      category = 'flash';
    } else if (trigger === 'create') {
      category = 'new_deal';
    } else {
      category = 'update';
    }

    const cooldownHoursRaw = configMap.get('cooldown_hours');
    const maxPerDayRaw = configMap.get('max_per_day');
    const cooldownHours =
      typeof cooldownHoursRaw === 'number'
        ? cooldownHoursRaw
        : DEFAULT_COOLDOWN_HOURS;
    const maxPerDay =
      typeof maxPerDayRaw === 'number' ? maxPerDayRaw : DEFAULT_MAX_PER_DAY;

    // Tokens éligibles — inclut aussi les tokens sans last_seen_at (nouveaux)
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
      .or(`last_seen_at.gt.${dormantCutoff},last_seen_at.is.null`);

    if (candidateError) {
      throw new Error(candidateError.message);
    }

    const candidates = (candidateRows ?? []) as CandidateToken[];

    if (candidates.length === 0) {
      return { category, eligible_tokens: 0, sent: 0, failed: 0, removed_tokens: 0 };
    }

    const candidateIds = candidates.map((token) => token.id);

    // Cooldown et max-par-jour uniquement (pas de filtre "déjà notifié pour ce deal")
    const lookbackCutoff = new Date(
      now.getTime() - LOG_LOOKBACK_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data: recentLogData, error: recentLogError } = await supabase
      .from('push_notification_log')
      .select('token_id, sent_at')
      .in('token_id', candidateIds)
      .gt('sent_at', lookbackCutoff);

    if (recentLogError) {
      throw new Error(recentLogError.message);
    }

    const cooldownThreshold = now.getTime() - cooldownHours * 60 * 60 * 1000;
    const todayCasablanca = casablancaDate(now);
    const cooldownHitTokenIds = new Set<string>();
    const todayCountByTokenId = new Map<string, number>();

    for (const row of (recentLogData ?? []) as RecentLogRow[]) {
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
      if (cooldownHitTokenIds.has(token.id)) return false;
      if ((todayCountByTokenId.get(token.id) ?? 0) >= maxPerDay) return false;
      return true;
    });

    if (eligibleTokens.length === 0) {
      return { category, eligible_tokens: 0, sent: 0, failed: 0, removed_tokens: 0 };
    }

    const messages = eligibleTokens.map((token) =>
      buildDealPushMessage(deal, category, token.expo_push_token),
    );

    const result = await sendExpoPushNotifications(messages);

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
        .upsert(logRows, { onConflict: 'token_id,deal_id', ignoreDuplicates: false });
    }

    console.log(
      `[dispatch] trigger=${trigger} category=${category} eligible=${eligibleTokens.length} sent=${result.sent} failed=${result.failed}`,
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