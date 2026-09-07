import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  Circuit,
  CircuitDestination,
  CircuitExtraInfo,
  CircuitSegment,
} from '@/services/circuits/types';

type CircuitRow = {
  id: string;
  slug: string;
  title: string;
  price_mad: number;
  departure_date: string | null;
  return_date: string | null;
  is_active: boolean;
  is_featured: boolean;
  booking_url: string | null;
  story_url: string | null;
  segments: unknown;
  destinations: unknown;
  extra_info: unknown;
  created_at: string;
  updated_at: string;
};

export function mapCircuitRow(row: CircuitRow): Circuit {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    priceMad: row.price_mad,
    departureDate: row.departure_date,
    returnDate: row.return_date,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    bookingUrl: row.booking_url,
    storyUrl: row.story_url,
    segments: (row.segments as CircuitSegment[]) ?? [],
    destinations: (row.destinations as CircuitDestination[]) ?? [],
    extraInfo: (row.extra_info as CircuitExtraInfo) ?? {
      visasRequired: [],
      terrestrialLegs: [],
      tips: [],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCircuits(): Promise<Circuit[]> {
  const supabase = createAdminSupabaseClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('circuits')
    .select('*')
    .eq('is_active', true)
    .or(`departure_date.gte.${today},departure_date.is.null`)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<CircuitRow[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCircuitRow);
}
