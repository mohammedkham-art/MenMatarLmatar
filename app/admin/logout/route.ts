import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { adminSessionCookieName } from '@/lib/auth/admin-session';

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete(adminSessionCookieName);

  redirect('/admin/login');
}
