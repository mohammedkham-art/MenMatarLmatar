import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  Circuit,
  CircuitDestination,
  CircuitExtraInfo,
  CircuitSegment,
} from '@/services/circuits/types';
import { visaLabels, type VisaType } from '@/services/visa/visa-rules';

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
  const rawDests = (row.destinations as CircuitDestination[]) ?? [];
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
    destinations: rawDests.map((d) => ({ ...d, visaLabel: d.visaLabel ?? '' })),
    extraInfo: (row.extra_info as CircuitExtraInfo) ?? {
      visasRequired: [],
      terrestrialLegs: [],
      tips: [],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getVisaLabelMap(
  countryCodes: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(countryCodes.filter((c): c is string => Boolean(c))),
  ];
  if (!unique.length) return new Map();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from('countries')
    .select('code, visa_type')
    .in('code', unique);
  return new Map(
    (data ?? []).map((row) => [
      row.code as string,
      visaLabels[(row.visa_type as VisaType) ?? ''] ?? '—',
    ]),
  );
}

export async function enrichCircuitsWithVisaLabels(circuits: Circuit[]): Promise<Circuit[]> {
  const codes = circuits.flatMap((c) => c.destinations.map((d) => d.countryCode));
  const visaMap = await getVisaLabelMap(codes);
  return circuits.map((c) => ({
    ...c,
    destinations: c.destinations.map((d) => ({
      ...d,
      visaLabel: d.countryCode ? (visaMap.get(d.countryCode) ?? '—') : '—',
    })),
  }));
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
  const circuits = (data ?? []).map(mapCircuitRow);
  return enrichCircuitsWithVisaLabels(circuits);
}
