import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getVisaTypeFromMetadata,
  getVisaTypeForCountry,
  stripVisaTypeMetadata,
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

const countryNameFixes: Record<string, string> = {
  AE: 'Émirats arabes unis',
  AM: 'Arménie',
  AZ: 'Azerbaïdjan',
  BA: 'Bosnie-Herzégovine',
  BE: 'Belgique',
  BF: 'Burkina Faso',
  BH: 'Bahreïn',
  BJ: 'Bénin',
  BN: 'Brunei',
  BO: 'Bolivie',
  BR: 'Brésil',
  BY: 'Biélorussie',
  CD: 'République démocratique du Congo',
  CG: 'République du Congo',
  CI: 'Côte d’Ivoire',
  CK: 'Îles Cook',
  CM: 'Cameroun',
  CN: 'Chine',
  CV: 'Cap-Vert',
  DO: 'République dominicaine',
  DZ: 'Algérie',
  EC: 'Équateur',
  EG: 'Égypte',
  ER: 'Érythrée',
  ES: 'Espagne',
  FI: 'Finlande',
  FM: 'Micronésie',
  ET: 'Éthiopie',
  FJ: 'Fidji',
  GE: 'Géorgie',
  GM: 'Gambie',
  GN: 'Guinée',
  GW: 'Guinée-Bissau',
  GQ: 'Guinée équatoriale',
  GR: 'Grèce',
  HT: 'Haïti',
  ID: 'Indonésie',
  IE: 'Irlande',
  IL: 'Israël',
  JO: 'Jordanie',
  JP: 'Japon',
  KG: 'Kirghizistan',
  KH: 'Cambodge',
  KM: 'Comores',
  KN: 'Saint-Christophe-et-Niévès',
  KR: 'Corée du Sud',
  LA: 'Laos',
  LC: 'Sainte-Lucie',
  LK: 'Sri Lanka',
  LR: 'Libéria',
  LS: 'Lesotho',
  LT: 'Lituanie',
  LU: 'Luxembourg',
  LV: 'Lettonie',
  ME: 'Monténégro',
  MG: 'Madagascar',
  MH: 'Îles Marshall',
  MK: 'Macédoine du Nord',
  ML: 'Mali',
  MM: 'Birmanie',
  MN: 'Mongolie',
  MU: 'Maurice',
  MZ: 'Mozambique',
  NA: 'Namibie',
  NE: 'Niger',
  NG: 'Nigéria',
  NP: 'Népal',
  NZ: 'Nouvelle-Zélande',
  PA: 'Panama',
  PE: 'Pérou',
  PG: 'Papouasie-Nouvelle-Guinée',
  PH: 'Philippines',
  PL: 'Pologne',
  RO: 'Roumanie',
  RS: 'Serbie',
  RW: 'Rwanda',
  SA: 'Arabie saoudite',
  SC: 'Seychelles',
  SG: 'Singapour',
  SI: 'Slovénie',
  SK: 'Slovaquie',
  SN: 'Sénégal',
  SO: 'Somalie',
  ST: 'São Tomé-et-Príncipe',
  SV: 'Salvador',
  SY: 'Syrie',
  TJ: 'Tadjikistan',
  TH: 'Thaïlande',
  TL: 'Timor oriental',
  TM: 'Turkménistan',
  TN: 'Tunisie',
  TR: 'Turquie',
  TW: 'Taïwan',
  TZ: 'Tanzanie',
  US: 'États-Unis',
  UZ: 'Ouzbékistan',
  VC: 'Saint-Vincent-et-les-Grenadines',
  VN: 'Vietnam',
};

const countryRegionFixes: Record<string, string> = {
  AG: 'Caraïbes',
  AR: 'Amérique du Sud',
  AU: 'Océanie',
  BB: 'Caraïbes',
  BF: 'Afrique de l’Ouest',
  BI: 'Afrique de l’Est',
  BJ: 'Afrique de l’Ouest',
  BO: 'Amérique du Sud',
  BR: 'Amérique du Sud',
  BS: 'Caraïbes',
  BZ: 'Amérique centrale',
  CI: 'Afrique de l’Ouest',
  CK: 'Océanie',
  CL: 'Amérique du Sud',
  CO: 'Amérique du Sud',
  CU: 'Caraïbes',
  CV: 'Afrique de l’Ouest',
  DJ: 'Afrique de l’Est',
  DM: 'Caraïbes',
  DO: 'Caraïbes',
  EC: 'Amérique du Sud',
  ER: 'Afrique de l’Est',
  ET: 'Afrique de l’Est',
  FJ: 'Océanie',
  FM: 'Océanie',
  GD: 'Caraïbes',
  GH: 'Afrique de l’Ouest',
  GM: 'Afrique de l’Ouest',
  GN: 'Afrique de l’Ouest',
  GW: 'Afrique de l’Ouest',
  GY: 'Amérique du Sud',
  HK: 'Asie de l’Est',
  HT: 'Caraïbes',
  JP: 'Asie de l’Est',
  JM: 'Caraïbes',
  KE: 'Afrique de l’Est',
  KI: 'Océanie',
  KM: 'Afrique de l’Est',
  KN: 'Caraïbes',
  KR: 'Asie de l’Est',
  LC: 'Caraïbes',
  LR: 'Afrique de l’Ouest',
  MG: 'Afrique de l’Est',
  ME: 'Europe',
  MH: 'Océanie',
  MK: 'Europe',
  ML: 'Afrique de l’Ouest',
  MM: 'Asie du Sud-Est',
  MN: 'Asie de l’Est',
  MR: 'Afrique de l’Ouest',
  MU: 'Afrique de l’Est',
  MW: 'Afrique de l’Est',
  MZ: 'Afrique de l’Est',
  NE: 'Afrique de l’Ouest',
  NG: 'Afrique de l’Ouest',
  NP: 'Asie du Sud',
  NR: 'Océanie',
  NU: 'Océanie',
  NZ: 'Océanie',
  PE: 'Amérique du Sud',
  PW: 'Océanie',
  PY: 'Amérique du Sud',
  RW: 'Afrique de l’Est',
  SB: 'Océanie',
  SC: 'Afrique de l’Est',
  SL: 'Afrique de l’Ouest',
  SN: 'Afrique de l’Ouest',
  SO: 'Afrique de l’Est',
  SR: 'Amérique du Sud',
  TG: 'Afrique de l’Ouest',
  TO: 'Océanie',
  TT: 'Caraïbes',
  TV: 'Océanie',
  TZ: 'Afrique de l’Est',
  UG: 'Afrique de l’Est',
  UY: 'Amérique du Sud',
  VC: 'Caraïbes',
  VE: 'Amérique du Sud',
  VU: 'Océanie',
  WS: 'Océanie',
  ZM: 'Afrique de l’Est',
  ZW: 'Afrique de l’Est',
};

const countryMaxStayDaysFixes: Partial<Record<string, number | null>> = {
  BA: null,
  DK: null,
  DZ: null,
  ES: null,
  FR: null,
  GB: null,
  IT: null,
  ME: null,
  MK: null,
  NL: null,
  PE: null,
  PT: null,
  RS: null,
  SA: null,
};

const countryNotesFixes: Record<string, string> = {
  BA: 'Visa requis ou exemption uniquement sous conditions particulières. À vérifier auprès des autorités de Bosnie-Herzégovine avant le départ.',
  DK: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  DZ: 'Visa obligatoire pour les voyageurs marocains. À vérifier auprès des autorités consulaires algériennes avant le départ.',
  ES: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  FR: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  GB: "eVisa obligatoire pour les voyageurs marocains depuis février 2026. Demande en ligne via le portail officiel UK Visas and Immigration. Durée de séjour variable selon le type de visa accordé.",
  IT: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  ME: 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.',
  MK: 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.',
  NL: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  PE: 'Visa requis selon les sources de référence consultées. À vérifier auprès des autorités consulaires péruviennes avant le départ.',
  PT: 'Visa Schengen requis pour les voyageurs marocains. À vérifier auprès des sources officielles avant réservation ou départ.',
  RS: 'Visa requis pour les passeports marocains ordinaires. À vérifier auprès des autorités serbes avant le départ.',
  SA: 'Visa requis pour les voyageurs marocains. À vérifier auprès des autorités saoudiennes ou de la plateforme officielle avant réservation ou départ.',
};

function hasBrokenFrenchEncoding(value: string) {
  return /[?\u00c3\u00c2\u00e2\ufffd]/.test(value);
}

function getCleanNotes(country: CountryRow, visaType: VisaType) {
  const notes = stripVisaTypeMetadata(country.notes);

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
    const visaType =
      getVisaTypeFromMetadata(country.notes) ??
      getVisaTypeForCountry(country.code, country.visa_type);

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
