import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { mapCircuitRow } from '@/services/circuits/get-circuits';
import type { Circuit } from '@/services/circuits/types';

export async function getAdminCircuit(id: string): Promise<Circuit | null> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('circuits')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapCircuitRow(data as any);
}
