import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Airline, AirlineFare } from '@/services/airlines/types';
import {
  getVisaTypeForCountry,
  type VisaType,
} from '@/services/visa/visa-rules';
import { buildDealSlug } from '@/services/deals/slug';

export type DealVisaType = VisaType;

export type Deal = {
  id: string;
  title: string;
  slug: string;
  fromAirport: string;
  toAirport: string;
  fromCity: string;
  toCity: string;
  countryCode: string;
  visaType: DealVisaType | null;
  priceMad: number;
  airline: string | null;
  airlineId: string | null;
  fareId: string | null;
  airlineDetails: Omit<Airline, 'fares'> | null;
  fare: AirlineFare | null;
  departureDate: string | null;
  returnDate: string | null;
  bookingUrl: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isTest: boolean;
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
  slug?: string | null;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  country_code: string;
  countries?: DealCountryRow | DealCountryRow[] | null;
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

const dealSelectWithBaggage =
  'id, title, slug, from_airport, to_airport, from_city, to_city, country_code, countries(visa_type), price_mad, airline, airline_id, fare_id, airlines(id, name, code, logo_url), airline_fares(id, airline_id, fare_name, personal_item, personal_item_dimensions, cabin_allowed, cabin_weight_kg, cabin_dimensions, checked_allowed, checked_weight_kg, checked_count), departure_date, return_date, booking_url, tags, is_active, is_featured, is_test, score, last_checked_at, created_at, updated_at';

const dealSelectWithVisa =
  'id, title, slug, from_airport, to_airport, from_city, to_city, country_code, countries(visa_type), price_mad, airline, airline_id, fare_id, departure_date, return_date, booking_url, tags, is_active, is_featured, is_test, score, last_checked_at, created_at, updated_at';

const legacyDealSelect =
  'id, title, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, last_checked_at, created_at, updated_at';

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
  const airlineDetails = deal.airlines
    ? {
        id: deal.airlines.id,
        name: deal.airlines.name,
        code: deal.airlines.code,
        logoUrl: deal.airlines.logo_url,
      }
    : null;
  const fare = deal.airline_fares
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
    : null;

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
    airlineDetails,
    fare,
    departureDate: deal.departure_date,
    returnDate: deal.return_date,
    bookingUrl: deal.booking_url,
    tags: deal.tags ?? [],
    isActive: deal.is_active,
    isFeatured: deal.is_featured,
    isTest: deal.is_test ?? false,
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

  return new Map(data.map((country) => [country.code, country.visa_type]));
}

export async function getDeals(): Promise<Deal[]> {
  const supabase = createAdminSupabaseClient();
  const publicDepartureCutoffDate = getPublicDepartureCutoffDate();

  const primaryResult = await supabase
    .from('deals')
    .select(dealSelectWithBaggage)
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
    .select(dealSelectWithVisa)
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
    .select(legacyDealSelect)
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
