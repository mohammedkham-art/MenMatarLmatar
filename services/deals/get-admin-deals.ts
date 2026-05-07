import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal, DealVisaType } from '@/services/deals/get-deals';
import { getVisaTypeForCountry } from '@/services/visa/visa-rules';

type AdminDealRow = {
  id: string;
  title: string;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  price_mad: number;
  airline: string | null;
  departure_date: string | null;
  return_date: string | null;
  booking_url: string;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  score: number | null;
  last_checked_at?: string | null;
  created_at: string;
  updated_at: string;
};

type CountryVisaRow = {
  code: string;
  visa_type: DealVisaType | null;
};

async function getVisaTypesByCountryCode(
  countryCodes: string[],
): Promise<Map<string, DealVisaType | null>> {
  if (countryCodes.length === 0) return new Map();

  const supabase = createAdminSupabaseClient();
  const unique = Array.from(new Set(countryCodes));

  const { data, error } = await supabase
    .from('countries')
    .select('code, visa_type')
    .in('code', unique)
    .returns<CountryVisaRow[]>();

  if (error) return new Map();

  return new Map(data.map((c) => [c.code, c.visa_type]));
}

export async function getAdminDeals(): Promise<Deal[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at',
    )
    .order('is_featured', { ascending: false })
    .order('score', { ascending: false })
    .order('last_checked_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<AdminDealRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const visaMap = await getVisaTypesByCountryCode(
    data.map((d) => d.country_code),
  );

  return data.map((deal) => ({
    id: deal.id,
    title: deal.title,
    fromAirport: deal.from_airport,
    toAirport: deal.to_airport,
    fromCity: deal.from_city,
    toCity: deal.to_city,
    countryCode: deal.country_code,
    visaType: getVisaTypeForCountry(
      deal.country_code,
      visaMap.get(deal.country_code) ?? null,
    ),
    priceMad: deal.price_mad,
    airline: deal.airline,
    departureDate: deal.departure_date,
    returnDate: deal.return_date,
    bookingUrl: deal.booking_url,
    tags: deal.tags ?? [],
    isActive: deal.is_active,
    isFeatured: deal.is_featured,
    score: deal.score ?? 0,
    lastCheckedAt: deal.last_checked_at ?? deal.created_at,
    createdAt: deal.created_at,
    updatedAt: deal.updated_at,
  }));
}
