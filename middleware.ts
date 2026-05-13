import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/auth/admin-session';
import { getOptionalClientEnv } from '@/lib/validators/env';

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

async function protectAdminRoute(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return null;
  }

  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    return null;
  }

  const isAllowed = await verifyAdminSessionToken(
    request.cookies.get(adminSessionCookieName)?.value,
    process.env.ADMIN_PASSWORD,
  );

  if (isAllowed) {
    return null;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';

  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const adminResponse = await protectAdminRoute(request);

  if (adminResponse) {
    return adminResponse;
  }

  let response = NextResponse.next({
    request,
  });

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store');
  }

  const clientEnv = getOptionalClientEnv();

  if (!clientEnv) {
    return response;
  }

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
