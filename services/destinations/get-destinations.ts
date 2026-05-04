import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type DestinationVisaType =
  | 'visa_free'
  | 'evisa'
  | 'on_arrival'
  | 'visa_required';

export type Destination = {
  id: string;
  city: string;
  country: string;
  countryCode: string | null;
  region: string | null;
  visaType: DestinationVisaType | null;
  isFeatured: boolean;
};

type DestinationRow = {
  id: string;
  city: string;
  country: string;
  country_code: string | null;
  region: string | null;
  visa_type: DestinationVisaType | null;
  is_featured: boolean | null;
};

export async function getDestinations(): Promise<Destination[]> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('destinations')
    .select('id, city, country, country_code, region, visa_type, is_featured')
    .order('is_featured', { ascending: false })
    .order('city', { ascending: true })
    .returns<DestinationRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map((destination) => ({
    id: destination.id,
    city: destination.city,
    country: destination.country,
    countryCode: destination.country_code,
    region: destination.region,
    visaType: destination.visa_type,
    isFeatured: destination.is_featured ?? false,
  }));
}
