import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const isAllowed = await verifyAdminSessionToken(
    cookieStore.get(adminSessionCookieName)?.value,
    process.env.ADMIN_PASSWORD,
  );

  if (!isAllowed) {
    redirect('/admin/login');
  }
}
