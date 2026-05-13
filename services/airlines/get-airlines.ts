import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Airline, AirlineFare } from '@/services/airlines/types';

type AirlineFareRow = {
  id: string;
  airline_id: string;
  fare_name: string;
  personal_item: boolean;
  personal_item_dimensions: string | null;
  cabin_allowed: boolean;
  cabin_weight_kg: number | null;
  cabin_dimensions: string | null;
  checked_allowed: boolean;
  checked_weight_kg: number | null;
  checked_count: number;
};

type AirlineRow = {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  airline_fares?: AirlineFareRow[] | null;
};

export function mapAirlineFareRow(row: AirlineFareRow): AirlineFare {
  return {
    id: row.id,
    airlineId: row.airline_id,
    fareName: row.fare_name,
    personalItem: row.personal_item,
    personalItemDimensions: row.personal_item_dimensions,
    cabinAllowed: row.cabin_allowed,
    cabinWeightKg: row.cabin_weight_kg,
    cabinDimensions: row.cabin_dimensions,
    checkedAllowed: row.checked_allowed,
    checkedWeightKg: row.checked_weight_kg,
    checkedCount: row.checked_count,
  };
}

export function mapAirlineRow(row: AirlineRow): Airline {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    logoUrl: row.logo_url,
    fares: (row.airline_fares ?? []).map(mapAirlineFareRow),
  };
}

export async function getAirlines(): Promise<Airline[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('airlines')
    .select(
      'id, name, code, logo_url, airline_fares(id, airline_id, fare_name, personal_item, personal_item_dimensions, cabin_allowed, cabin_weight_kg, cabin_dimensions, checked_allowed, checked_weight_kg, checked_count)',
    )
    .order('name', { ascending: true })
    .order('fare_name', {
      ascending: true,
      referencedTable: 'airline_fares',
    })
    .returns<AirlineRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapAirlineRow);
}
