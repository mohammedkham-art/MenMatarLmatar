import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getVisaTypeFromMetadata,
  getVisaTypeForCountry,
  type StoredVisaType,
} from '@/services/visa/visa-rules';

export type DestinationVisaType = StoredVisaType;

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

type CountryVisaRow = {
  code: string;
  visa_type: DestinationVisaType | null;
  notes: string | null;
};

async function getCountryVisaTypesByCode(
  countryCodes: Array<string | null>,
): Promise<Map<string, DestinationVisaType | null>> {
  const uniqueCountryCodes = Array.from(
    new Set(countryCodes.filter((code): code is string => Boolean(code))),
  );

  if (uniqueCountryCodes.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('countries')
    .select('code, visa_type, notes')
    .in('code', uniqueCountryCodes)
    .returns<CountryVisaRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    data.map((country) => [
      country.code,
      getVisaTypeFromMetadata(country.notes) ?? country.visa_type,
    ]),
  );
}

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

  const countryVisaTypesByCode = await getCountryVisaTypesByCode(
    data.map((destination) => destination.country_code),
  );

  return data.map((destination) => ({
    id: destination.id,
    city: destination.city,
    country: destination.country,
    countryCode: destination.country_code,
    region: destination.region,
    visaType: getVisaTypeForCountry(
      destination.country_code,
      destination.country_code
        ? countryVisaTypesByCode.get(destination.country_code) ??
            destination.visa_type
        : destination.visa_type,
    ),
    isFeatured: destination.is_featured ?? false,
  }));
}
