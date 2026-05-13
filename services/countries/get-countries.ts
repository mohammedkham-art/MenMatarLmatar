import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { hasAdminSupabaseEnv } from '@/lib/validators/env';
import {
  countryMaxStayDaysFixes,
  countryNameFixes,
  countryNotesFixes,
  countryRegionFixes,
} from '@/services/countries/country-overrides';
import {
  getVisaTypeForCountry,
  type VisaType as VisaRuleType,
  visaLabels,
} from '@/services/visa/visa-rules';

export type VisaType = VisaRuleType;

export type Country = {
  id: string;
  name: string;
  code: string;
  region: string;
  visaType: VisaType;
  maxStayDays: number | null;
  notes: string | null;
  officialSourceUrl: string | null;
  isFeatured: boolean;
};

type CountryRow = {
  id: string;
  name: string;
  code: string;
  region: string;
  visa_type: VisaType;
  max_stay_days: number | null;
  notes: string | null;
  official_source_url: string | null;
  is_featured: boolean;
};

const productionCountriesApiUrl =
  'https://menmatarlmatar.ma/api/mobile/countries';

async function getProductionCountriesFallback(): Promise<Country[]> {
  const response = await fetch(productionCountriesApiUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les pays de production.');
  }

  const payload = (await response.json()) as { countries?: Country[] };
  return payload.countries ?? [];
}

function hasBrokenFrenchEncoding(value: string) {
  return /[?\u00c3\u00c2\u00e2\ufffd]/.test(value);
}

function getCleanNotes(country: CountryRow, visaType: VisaType) {
  const notes = country.notes;

  if (notes && !hasBrokenFrenchEncoding(notes)) {
    return notes;
  }

  const visaLabel = visaLabels[visaType];

  if (country.max_stay_days === null) {
    return `${visaLabel} pour les voyageurs marocains selon conditions. Durée de séjour à vérifier avant le départ.`;
  }

  return `${visaLabel} pour les voyageurs marocains selon conditions. Séjour indicatif : ${country.max_stay_days} jours.`;
}

export async function getCountries(): Promise<Country[]> {
  if (!hasAdminSupabaseEnv()) {
    return getProductionCountriesFallback();
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('countries')
    .select(
      'id, name, code, region, visa_type, max_stay_days, notes, official_source_url, is_featured',
    )
    .order('name', { ascending: true })
    .returns<CountryRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map((country) => {
    const visaType = getVisaTypeForCountry(country.code, country.visa_type);

    return {
      id: country.id,
      name: countryNameFixes[country.code] ?? country.name,
      code: country.code,
      region: countryRegionFixes[country.code] ?? country.region,
      visaType,
      maxStayDays:
        country.code in countryMaxStayDaysFixes
          ? countryMaxStayDaysFixes[country.code]!
          : country.max_stay_days,
      notes: countryNotesFixes[country.code] ?? getCleanNotes(country, visaType),
      officialSourceUrl: country.official_source_url,
      isFeatured: country.is_featured,
    };
  });
}
