import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';
import { expoPushTokenSchema } from '@/lib/validators/push';
import { getAdminDeal } from '@/services/deals/get-admin-deal';
import { buildDealPushMessage } from '@/services/notifications/dispatch';
import { sendExpoPushNotifications } from '@/services/notifications/expo-push';

export const runtime = 'nodejs';

const testNotificationSchema = z.object({
  dealId: z.string().uuid(),
  expoPushToken: expoPushTokenSchema,
  category: z.enum(['flash', 'cheap']).optional(),
});

async function isAdminRequest(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(adminSessionCookieName)?.value,
    process.env.ADMIN_PASSWORD,
  );
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const parsed = testNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const { dealId, expoPushToken, category: requestedCategory } = parsed.data;

  try {
    const deal = await getAdminDeal(dealId);

    if (!deal) {
      return NextResponse.json({ error: 'deal_not_found' }, { status: 404 });
    }

    const category =
      requestedCategory ?? (deal.isFlash ? 'flash' : 'cheap');
    const message = buildDealPushMessage(deal, category, expoPushToken);
    const result = await sendExpoPushNotifications([message]);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
