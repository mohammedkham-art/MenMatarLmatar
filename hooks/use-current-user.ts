'use client';

import { useQuery } from '@tanstack/react-query';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    },
  });
}
