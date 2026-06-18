import { type NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { unregisterPushSchema } from '@/lib/validators/push';
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
    `push-unregister:${getClientIp(request)}`,
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

  const parsed = unregisterPushSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('expo_push_token', parsed.data.expoPushToken);

  if (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
