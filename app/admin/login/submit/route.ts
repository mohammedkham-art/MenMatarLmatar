import { NextResponse } from 'next/server';

import {
  adminSessionCookieName,
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
} from '@/lib/auth/admin-session';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.redirect(
      new URL('/admin/login?error=missing-config', request.url),
      303,
    );
  }

  if (typeof password !== 'string' || password !== adminPassword) {
    return NextResponse.redirect(
      new URL('/admin/login?error=invalid-password', request.url),
      303,
    );
  }

  const token = await createAdminSessionToken(adminPassword);
  const response = NextResponse.redirect(new URL('/admin', request.url), 303);

  response.cookies.set(adminSessionCookieName, token, {
    httpOnly: true,
    maxAge: adminSessionMaxAgeSeconds,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
