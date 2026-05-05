import { NextResponse } from 'next/server';

import { adminSessionCookieName } from '@/lib/auth/admin-session';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));

  response.cookies.set(adminSessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/admin',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  response.cookies.set(adminSessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
