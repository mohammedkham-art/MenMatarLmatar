import { createClient } from '@supabase/supabase-js';

import { getAdminSupabaseEnv } from '@/lib/validators/env';

export function createAdminSupabaseClient() {
  const serverEnv = getAdminSupabaseEnv();

  return createClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
