import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// Low-level Expo Push primitive. Sends what it is given — no business
// logic (audience, cooldown, etc. belong to the caller). No built-in
// retry: the caller is responsible for re-sending failed batches.

export type ExpoPushMessage = {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
};

export type ExpoPushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
    [key: string]: unknown;
  };
};

export type ExpoPushResult = {
  sent: number;
  failed: number;
  removed_tokens: string[];
  tickets: ExpoPushTicket[];
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_BATCH_SIZE = 100;
const BATCH_TIMEOUT_MS = 10_000;

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  };

  const accessToken = process.env.EXPO_ACCESS_TOKEN;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

// Returns the tickets for the batch, or null if the whole batch failed
// (HTTP 4xx/5xx, network error or timeout).
async function sendBatch(
  batch: ExpoPushMessage[],
  batchIndex: number,
): Promise<ExpoPushTicket[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BATCH_TIMEOUT_MS);

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(batch),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        `[expo-push] batch ${batchIndex} failed: HTTP ${response.status} (${batch.length} messages)`,
      );

      return null;
    }

    const payload = (await response.json()) as { data?: ExpoPushTicket[] };

    return payload.data ?? [];
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'unknown';
    console.error(
      `[expo-push] batch ${batchIndex} request error: ${reason} (${batch.length} messages)`,
    );

    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Best-effort cleanup of tokens Expo reported as DeviceNotRegistered.
async function removeUnregisteredTokens(tokens: string[]): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from('push_tokens').delete().in('expo_push_token', tokens);
  } catch {
    // Cleanup is non-critical: never let it fail the send result.
  }
}

export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushResult> {
  const tickets: ExpoPushTicket[] = [];
  const removedTokens = new Set<string>();
  let sent = 0;
  let failed = 0;

  const batches = chunk(messages, EXPO_BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex];
    const batchTickets = await sendBatch(batch, batchIndex);

    if (!batchTickets) {
      failed += batch.length;

      for (let index = 0; index < batch.length; index += 1) {
        tickets.push({ status: 'error', message: 'batch_request_failed' });
      }

      continue;
    }

    for (let index = 0; index < batchTickets.length; index += 1) {
      const ticket = batchTickets[index];
      tickets.push(ticket);

      if (ticket.status === 'error') {
        failed += 1;

        const message = batch[index];

        if (ticket.details?.error === 'DeviceNotRegistered' && message) {
          removedTokens.add(message.to);
        }
      } else {
        sent += 1;
      }
    }

    // Expo should return one ticket per message; guard against a short
    // response by counting the unaccounted messages as failed.
    if (batchTickets.length < batch.length) {
      const missing = batch.length - batchTickets.length;
      failed += missing;

      for (let index = 0; index < missing; index += 1) {
        tickets.push({ status: 'error', message: 'missing_ticket' });
      }
    }
  }

  const removed_tokens = Array.from(removedTokens);

  if (removed_tokens.length > 0) {
    await removeUnregisteredTokens(removed_tokens);
  }

  return { sent, failed, removed_tokens, tickets };
}
