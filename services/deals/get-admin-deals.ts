import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Deal } from '@/services/deals/get-deals';

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
  created_at: string;
  updated_at: string;
};

export async function getAdminDeals(): Promise<Deal[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('deals')
    .select(
      'id, title, from_airport, to_airport, from_city, to_city, country_code, price_mad, airline, departure_date, return_date, booking_url, tags, is_active, is_featured, score, created_at, updated_at',
    )
    .order('is_featured', { ascending: false })
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<AdminDealRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map((deal) => ({
    id: deal.id,
    title: deal.title,
    fromAirport: deal.from_airport,
    toAirport: deal.to_airport,
    fromCity: deal.from_city,
    toCity: deal.to_city,
    countryCode: deal.country_code,
    visaType: null,
    priceMad: deal.price_mad,
    airline: deal.airline,
    departureDate: deal.departure_date,
    returnDate: deal.return_date,
    bookingUrl: deal.booking_url,
    tags: deal.tags ?? [],
    isActive: deal.is_active,
    isFeatured: deal.is_featured,
    score: deal.score ?? 0,
    lastCheckedAt: deal.created_at,
    createdAt: deal.created_at,
    updatedAt: deal.updated_at,
  }));
}
