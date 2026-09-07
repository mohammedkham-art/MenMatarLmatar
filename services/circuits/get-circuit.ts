import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { mapCircuitRow } from '@/services/circuits/get-circuits';
import type { Circuit } from '@/services/circuits/types';

export async function getCircuitBySlug(slug: string): Promise<Circuit | null> {
  const supabase = createAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('circuits')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .or(`departure_date.gte.${today},departure_date.is.null`)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapCircuitRow(data as any);
}
