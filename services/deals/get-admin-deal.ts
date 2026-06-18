import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal, DealVisaType } from '@/services/deals/get-deals';
import { buildDealSlug } from '@/services/deals/slug';
import { getVisaTypeForCountry } from '@/services/visa/visa-rules';

type AdminDealRow = {
  id: string;
  title: string;
  slug?: string | null;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  price_mad: number;
  airline: string | null;
  airline_id?: string | null;
  fare_id?: string | null;
  airlines?: {
    id: string;
    name: string;
    code: string;
    logo_url: string | null;
  } | null;
  airline_fares?: {
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
  is_flash?: boolean | null;
  is_test?: boolean | null;
  score: number | null;
  last_checked_at?: string | null;
  created_at: string;
  updated_at: string;
};

type CountryVisaRow = {
  code: string;
  visa_type: DealVisaType | null;
};

function getDealVisaType(countryCode: string, visaType: DealVisaType | null) {
  return getVisaTypeForCountry(countryCode, visaType);
}

function mapAdminDealRow(
  deal: AdminDealRow,
  visaType: DealVisaType | null,
): Deal {
  return {
    id: deal.id,
    title: deal.title,
    slug:
      deal.slug ??
      `${buildDealSlug(deal.title, 'deal')}-${deal.id.slice(0, 8)}`,
    fromAirport: deal.from_airport,
    toAirport: deal.to_airport,
    fromCity: deal.from_city,
    toCity: deal.to_city,
    countryCode: deal.country_code,
    visaType,
    priceMad: deal.price_mad,
    airline: deal.airline,
    airlineId: deal.airline_id ?? null,
    fareId: deal.fare_id ?? null,
    airlineDetails: deal.airlines
      ? {
          id: deal.airlines.id,
          name: deal.airlines.name,
          code: deal.airlines.code,
          logoUrl: deal.airlines.logo_url,
        }
      : null,
    fare: deal.airline_fares
      ? {
          id: deal.airline_fares.id,
          airlineId: deal.airline_fares.airline_id,
          fareName: deal.airline_fares.fare_name,
          personalItem: deal.airline_fares.personal_item,
          personalItemDimensions: deal.airline_fares.personal_item_dimensions,
          cabinAllowed: deal.airline_fares.cabin_allowed,
          cabinWeightKg: deal.airline_fares.cabin_weight_kg,
          cabinDimensions: deal.airline_fares.cabin_dimensions,
          checkedAllowed: deal.airline_fares.checked_allowed,
          checkedWeightKg: deal.airline_fares.checked_weight_kg,
          checkedCount: deal.airline_fares.checked_count,
        }
      : null,
    departureDate: deal.departure_date,
    returnDate: deal.return_date,
    bookingUrl: deal.booking_url,
    tags: deal.tags ?? [],
    isActive: deal.is_active,
    isFeatured: deal.is_featured,
    isFlash: deal.is_flash ?? false,
    isTest: deal.is_test ?? false,
    score: deal.score ?? 0,
    lastCheckedAt: deal.last_checked_at ?? deal.created_at,
    createdAt: deal.created_at,
    updatedAt: deal.updated_at,
  };
}

async function getVisaTypeByCountryCode(countryCode: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('countries')
    .select('code, visa_type')
    .eq('code', countryCode)
    .maybeSingle()
    .returns<CountryVisaRow | null>();

  if (error) {
    throw new Error(error.message);
  }

  return getDealVisaType(countryCode, data?.visa_type ?? null);
}

export async function getAdminDeal(dealId: string): Promise<Deal | null> {
  const supabase = createAdminSupabaseClient();
  const selectFields =
    'id, title, slug, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, airline_id, fare_id, airlines(id, name, code, logo_url), airline_fares(id, airline_id, fare_name, personal_item, personal_item_dimensions, cabin_allowed, cabin_weight_kg, cabin_dimensions, checked_allowed, checked_weight_kg, checked_count), departure_date, return_date, booking_url, tags, is_active, is_featured, is_flash, is_test, score, last_checked_at, created_at, updated_at';

  const relationResult = await supabase
    .from('deals')
    .select(selectFields)
    .eq('id', dealId)
    .maybeSingle()
    .returns<AdminDealRow | null>();

  if (!relationResult.error && relationResult.data) {
    return mapAdminDealRow(
      relationResult.data,
      await getVisaTypeByCountryCode(relationResult.data.country_code),
    );
  }

  const fallbackResult = await supabase
    .from('deals')
    .select(
      'id, title, slug, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, airline_id, fare_id, departure_date, return_date, booking_url, tags, is_active, is_featured, is_flash, is_test, score, last_checked_at, created_at, updated_at',
    )
    .eq('id', dealId)
    .maybeSingle()
    .returns<AdminDealRow | null>();

  if (fallbackResult.error) {
    throw new Error(fallbackResult.error.message);
  }

  if (!fallbackResult.data) {
    return null;
  }

  return mapAdminDealRow(
    fallbackResult.data,
    await getVisaTypeByCountryCode(fallbackResult.data.country_code),
  );
}
