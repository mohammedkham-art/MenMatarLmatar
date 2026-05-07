import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getVisaTypeForCountry,
  type VisaType,
} from '@/services/visa/visa-rules';

export type DealVisaType = VisaType;

export type Deal = {
  id: string;
  title: string;
  fromAirport: string;
  toAirport: string;
  fromCity: string;
  toCity: string;
  countryCode: string;
  visaType: DealVisaType | null;
  priceMad: number;
  airline: string | null;
  departureDate: string | null;
  returnDate: string | null;
  bookingUrl: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  score: number;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
};

type DealCountryRow = {
  visa_type: DealVisaType | null;
};

type DealRow = {
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

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMoroccoDateParts() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(new Date());

  return {
    day: Number(parts.find((part) => part.type === 'day')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    year: Number(parts.find((part) => part.type === 'year')?.value),
  };
}

function getPublicDepartureCutoffDate() {
  const { day, month, year } = getMoroccoDateParts();
  const cutoffDate = new Date(Date.UTC(year, month - 1, day));

  cutoffDate.setUTCDate(cutoffDate.getUTCDate() + 5);

  return formatDateOnly(cutoffDate);
}

function getDealVisaType(countryCode: string, visaType: DealVisaType | null) {
  return getVisaTypeForCountry(countryCode, visaType);
}

function getRelatedVisaType(
  countryCode: string,
  country: DealRow['countries'],
) {
  if (!country) {
    return getDealVisaType(countryCode, null);
  }

  if (Array.isArray(country)) {
    return getDealVisaType(countryCode, country[0]?.visa_type ?? null);
  }

  return getDealVisaType(countryCode, country.visa_type);
}

function mapDealRow(deal: DealRow, visaType: DealVisaType | null): Deal {
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

function shuffleDeals(deals: Deal[]) {
  const shuffledDeals = [...deals];

  for (let index = shuffledDeals.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledDeals[index], shuffledDeals[randomIndex]] = [
      shuffledDeals[randomIndex],
      shuffledDeals[index],
    ];
  }

  return shuffledDeals;
}

async function getVisaTypesByCountryCode(
  countryCodes: string[],
): Promise<Map<string, DealVisaType | null>> {
  if (countryCodes.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  const uniqueCountryCodes = Array.from(new Set(countryCodes));

  const { data, error } = await supabase
    .from('countries')
    .select('code, visa_type')
    .in('code', uniqueCountryCodes)
    .returns<CountryVisaRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    data.map((country) => [country.code, country.visa_type]),
  );
}

export async function getDeals(): Promise<Deal[]> {
  const supabase = createAdminSupabaseClient();
  const publicDepartureCutoffDate = getPublicDepartureCutoffDate();

  const primaryResult = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, countries(visa_type), price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at',
    )
    .eq('is_active', true)
    .gt('departure_date', publicDepartureCutoffDate)
    .order('is_featured', { ascending: false })
    .order('score', { ascending: false })
    .order('last_checked_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<DealRow[]>();

  if (!primaryResult.error) {
    return shuffleDeals(
      primaryResult.data.map((deal) =>
        mapDealRow(deal, getRelatedVisaType(deal.country_code, deal.countries)),
      ),
    );
  }

  const relationFallbackResult = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, countries(visa_type), price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at',
    )
    .eq('is_active', true)
    .gt('departure_date', publicDepartureCutoffDate)
    .order('is_featured', { ascending: false })
    .order('score', { ascending: false })
    .order('last_checked_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<DealRow[]>();

  if (!relationFallbackResult.error) {
    return shuffleDeals(
      relationFallbackResult.data.map((deal) =>
        mapDealRow(deal, getRelatedVisaType(deal.country_code, deal.countries)),
      ),
    );
  }

  const fallbackResult = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at',
    )
    .eq('is_active', true)
    .gt('departure_date', publicDepartureCutoffDate)
    .order('is_featured', { ascending: false })
    .order('score', { ascending: false })
    .order('last_checked_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<DealRow[]>();

  if (fallbackResult.error) {
    throw new Error(fallbackResult.error.message);
  }

  const visaTypesByCountryCode = await getVisaTypesByCountryCode(
    fallbackResult.data.map((deal) => deal.country_code),
  );

  return shuffleDeals(
    fallbackResult.data.map((deal) =>
      mapDealRow(
        deal,
        getDealVisaType(
          deal.country_code,
          visaTypesByCountryCode.get(deal.country_code) ?? null,
        ),
      ),
    ),
  );
}
