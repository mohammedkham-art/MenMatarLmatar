import { NextResponse } from 'next/server';

import {
  adminSessionCookieName,
  legacyAdminSessionCookieNames,
} from '@/lib/auth/admin-session';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  const cookieNamesToClear = [
    adminSessionCookieName,
    ...legacyAdminSessionCookieNames,
  ];

  for (const cookieName of cookieNamesToClear) {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      maxAge: 0,
      path: '/admin',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  response.headers.set('Cache-Control', 'no-store');

  return response;
}
