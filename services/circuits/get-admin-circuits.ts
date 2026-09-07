import { enrichCircuitsWithVisaLabels, mapCircuitRow } from '@/services/circuits/get-circuits';
import type { Circuit } from '@/services/circuits/types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function getAdminCircuits(): Promise<Circuit[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('circuits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circuits = (data ?? []).map((row: any) => mapCircuitRow(row));
  return enrichCircuitsWithVisaLabels(circuits);
}
