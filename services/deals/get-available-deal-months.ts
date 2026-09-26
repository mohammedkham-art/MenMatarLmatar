import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { hasAdminSupabaseEnv } from '@/lib/validators/env';

type MonthRow = {
  departure_date: string | null;
  return_date: string | null;
};

export async function getAvailableDealMonths(): Promise<string[]> {
  if (!hasAdminSupabaseEnv()) {
    return [];
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('deals')
    .select('departure_date, return_date')
    .eq('is_active', true)
    .returns<MonthRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const months = new Set<string>();

  for (const row of data) {
    if (row.departure_date) months.add(row.departure_date.slice(0, 7));
    if (row.return_date) months.add(row.return_date.slice(0, 7));
  }

  return Array.from(months).sort();
}
