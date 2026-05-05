import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal, DealVisaType } from '@/services/deals/get-deals';

type DealCountryRow = {
  visa_type: DealVisaType | null;
};

type AdminDealRow = {
  id: string;
  title: string;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  countries?: DealCountryRow | DealCountryRow[] | null;
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

const dealVisaTypeFixes: Partial<Record<string, DealVisaType>> = {
  DK: 'visa_required',
  ES: 'visa_required',
  FR: 'visa_required',
  GB: 'visa_required',
  IT: 'visa_required',
  NL: 'visa_required',
  PT: 'visa_required',
};

function getDealVisaType(countryCode: string, visaType: DealVisaType | null) {
  return dealVisaTypeFixes[countryCode] ?? visaType;
}

function getRelatedVisaType(
  countryCode: string,
  country: AdminDealRow['countries'],
) {
  if (!country) {
    return getDealVisaType(countryCode, null);
  }

  if (Array.isArray(country)) {
    return getDealVisaType(countryCode, country[0]?.visa_type ?? null);
  }

  return getDealVisaType(countryCode, country.visa_type);
}

function mapAdminDealRow(
  deal: AdminDealRow,
  visaType: DealVisaType | null,
): Deal {
  return {
    id: deal.id,
    title: deal.title,
    fromAirport: deal.from_airport,
    toAirport: deal.to_airport,
    fromCity: deal.from_city,
    toCity: deal.to_city,
    countryCode: deal.country_code,
    visaType,
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
    'id, title, from_airport, to_airport, from_city, to_city, country_code, countries(visa_type), price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at';

  const relationResult = await supabase
    .from('deals')
    .select(selectFields)
    .eq('id', dealId)
    .maybeSingle()
    .returns<AdminDealRow | null>();

  if (!relationResult.error && relationResult.data) {
    return mapAdminDealRow(
      relationResult.data,
      getRelatedVisaType(
        relationResult.data.country_code,
        relationResult.data.countries,
      ),
    );
  }

  const fallbackResult = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at',
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
