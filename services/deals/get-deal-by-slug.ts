import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal } from '@/services/deals/get-deals';
import { getDeals } from '@/services/deals/get-deals';
import { hasAdminSupabaseEnv } from '@/lib/validators/env';
import { getVisaTypeForCountry } from '@/services/visa/visa-rules';

type DealRow = {
  id: string;
  title: string;
  slug: string;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  price_mad: number;
  airline: string | null;
  airline_id: string | null;
  fare_id: string | null;
  airlines: {
    id: string;
    name: string;
    code: string;
    logo_url: string | null;
  } | null;
  airline_fares: {
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
  } | null;
  departure_date: string | null;
  return_date: string | null;
  booking_url: string;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  is_test: boolean | null;
  score: number | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapDeal(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    fromAirport: row.from_airport,
    toAirport: row.to_airport,
    fromCity: row.from_city,
    toCity: row.to_city,
    countryCode: row.country_code,
    visaType: getVisaTypeForCountry(row.country_code, null),
    priceMad: row.price_mad,
    airline: row.airline,
    airlineId: row.airline_id,
    fareId: row.fare_id,
    airlineDetails: row.airlines
      ? {
          id: row.airlines.id,
          name: row.airlines.name,
          code: row.airlines.code,
          logoUrl: row.airlines.logo_url,
        }
      : null,
    fare: row.airline_fares
      ? {
          id: row.airline_fares.id,
          airlineId: row.airline_fares.airline_id,
          fareName: row.airline_fares.fare_name,
          personalItem: row.airline_fares.personal_item,
          personalItemDimensions: row.airline_fares.personal_item_dimensions,
          cabinAllowed: row.airline_fares.cabin_allowed,
          cabinWeightKg: row.airline_fares.cabin_weight_kg,
          cabinDimensions: row.airline_fares.cabin_dimensions,
          checkedAllowed: row.airline_fares.checked_allowed,
          checkedWeightKg: row.airline_fares.checked_weight_kg,
          checkedCount: row.airline_fares.checked_count,
        }
      : null,
    departureDate: row.departure_date,
    returnDate: row.return_date,
    bookingUrl: row.booking_url,
    tags: row.tags ?? [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isTest: row.is_test ?? false,
    score: row.score ?? 0,
    lastCheckedAt: row.last_checked_at ?? row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  if (!hasAdminSupabaseEnv()) {
    const deals = await getDeals();

    return deals.find((deal) => deal.slug === slug) ?? null;
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('deals')
    .select(
      'id, title, slug, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, airline_id, fare_id, airlines(id, name, code, logo_url), airline_fares(id, airline_id, fare_name, personal_item, personal_item_dimensions, cabin_allowed, cabin_weight_kg, cabin_dimensions, checked_allowed, checked_weight_kg, checked_count), departure_date, return_date, booking_url, tags, is_active, is_featured, is_test, score, last_checked_at, created_at, updated_at',
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
    .returns<DealRow | null>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapDeal(data) : null;
}
