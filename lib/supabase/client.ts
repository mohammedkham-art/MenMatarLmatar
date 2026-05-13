import { createBrowserClient } from '@supabase/ssr';

import { getClientEnv } from '@/lib/validators/env';

export function createBrowserSupabaseClient() {
  const clientEnv = getClientEnv();

  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
