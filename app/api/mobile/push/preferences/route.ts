import { type NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { preferencesPushSchema } from '@/lib/validators/push';
import { checkRateLimit } from '@/services/security/rate-limit';

export const runtime = 'nodejs';

const pushRateLimit = {
  limit: 30,
  windowMs: 60 * 60 * 1000,
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(
    `push-preferences:${getClientIp(request)}`,
    pushRateLimit,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const parsed = preferencesPushSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const input = parsed.data;
  const payload: Record<string, unknown> = {
    last_seen_at: new Date().toISOString(),
  };

  if (input.notifyCheapDeals !== undefined) {
    payload.notify_cheap_deals = input.notifyCheapDeals;
  }

  if (input.notifyFlashDeals !== undefined) {
    payload.notify_flash_deals = input.notifyFlashDeals;
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('push_tokens')
    .update(payload)
    .eq('expo_push_token', input.expoPushToken)
    .select('id');

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'token_not_found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
