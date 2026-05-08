import type { Destination } from '@/services/destinations/get-destinations';
import { getVisaTypeForCountry } from '@/services/visa/visa-rules';

type ExtraDestination = {
  city: string;
  country: string;
  countryCode: string;
  region: string;
  visaType: 'visa_required' | 'evisa' | 'visa_free' | 'on_arrival';
};

const extraSimulatorDestinations: ExtraDestination[] = [
  // ── Europe (visa_required) ────────────────────────────────────────
  { city: 'Paris', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Marseille', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Lyon', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Nice', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Bordeaux', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Toulouse', country: 'France', countryCode: 'FR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Barcelone', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Madrid', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Malaga', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Valence', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Séville', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Alicante', country: 'Espagne', countryCode: 'ES', region: 'Europe', visaType: 'visa_required' },
  { city: 'Lisbonne', country: 'Portugal', countryCode: 'PT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Porto', country: 'Portugal', countryCode: 'PT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Faro', country: 'Portugal', countryCode: 'PT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Londres', country: 'Royaume-Uni', countryCode: 'GB', region: 'Europe', visaType: 'visa_required' },
  { city: 'Manchester', country: 'Royaume-Uni', countryCode: 'GB', region: 'Europe', visaType: 'visa_required' },
  { city: 'Édimbourg', country: 'Royaume-Uni', countryCode: 'GB', region: 'Europe', visaType: 'visa_required' },
  { city: 'Birmingham', country: 'Royaume-Uni', countryCode: 'GB', region: 'Europe', visaType: 'visa_required' },
  { city: 'Rome', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Milan', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Bergame', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Venise', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Bologne', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Naples', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Pise', country: 'Italie', countryCode: 'IT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Amsterdam', country: 'Pays-Bas', countryCode: 'NL', region: 'Europe', visaType: 'visa_required' },
  { city: 'Eindhoven', country: 'Pays-Bas', countryCode: 'NL', region: 'Europe', visaType: 'visa_required' },
  { city: 'Rotterdam', country: 'Pays-Bas', countryCode: 'NL', region: 'Europe', visaType: 'visa_required' },
  { city: 'Copenhague', country: 'Danemark', countryCode: 'DK', region: 'Europe', visaType: 'visa_required' },
  { city: 'Billund', country: 'Danemark', countryCode: 'DK', region: 'Europe', visaType: 'visa_required' },
  { city: 'Bruxelles', country: 'Belgique', countryCode: 'BE', region: 'Europe', visaType: 'visa_required' },
  { city: 'Francfort', country: 'Allemagne', countryCode: 'DE', region: 'Europe', visaType: 'visa_required' },
  { city: 'Berlin', country: 'Allemagne', countryCode: 'DE', region: 'Europe', visaType: 'visa_required' },
  { city: 'Munich', country: 'Allemagne', countryCode: 'DE', region: 'Europe', visaType: 'visa_required' },
  { city: 'Vienne', country: 'Autriche', countryCode: 'AT', region: 'Europe', visaType: 'visa_required' },
  { city: 'Zurich', country: 'Suisse', countryCode: 'CH', region: 'Europe', visaType: 'visa_required' },
  { city: 'Genève', country: 'Suisse', countryCode: 'CH', region: 'Europe', visaType: 'visa_required' },
  { city: 'Stockholm', country: 'Suède', countryCode: 'SE', region: 'Europe', visaType: 'visa_required' },
  { city: 'Oslo', country: 'Norvège', countryCode: 'NO', region: 'Europe', visaType: 'visa_required' },
  { city: 'Helsinki', country: 'Finlande', countryCode: 'FI', region: 'Europe', visaType: 'visa_required' },
  { city: 'Prague', country: 'Tchéquie', countryCode: 'CZ', region: 'Europe', visaType: 'visa_required' },
  { city: 'Varsovie', country: 'Pologne', countryCode: 'PL', region: 'Europe', visaType: 'visa_required' },
  { city: 'Budapest', country: 'Hongrie', countryCode: 'HU', region: 'Europe', visaType: 'visa_required' },
  { city: 'Athènes', country: 'Grèce', countryCode: 'GR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Thessalonique', country: 'Grèce', countryCode: 'GR', region: 'Europe', visaType: 'visa_required' },
  { city: 'Bucarest', country: 'Roumanie', countryCode: 'RO', region: 'Europe', visaType: 'visa_required' },
  { city: 'Sofia', country: 'Bulgarie', countryCode: 'BG', region: 'Europe', visaType: 'visa_required' },

  // ── Asie centrale (eVisa) ──────────────────────────────────────────
  { city: 'Tachkent', country: 'Ouzbékistan', countryCode: 'UZ', region: 'Asie', visaType: 'evisa' },
  { city: 'Samarcande', country: 'Ouzbékistan', countryCode: 'UZ', region: 'Asie', visaType: 'evisa' },
  { city: 'Boukhara', country: 'Ouzbékistan', countryCode: 'UZ', region: 'Asie', visaType: 'evisa' },
  { city: 'Bichkek', country: 'Kirghizistan', countryCode: 'KG', region: 'Asie', visaType: 'evisa' },
  { city: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', region: 'Asie', visaType: 'evisa' },
  { city: 'Astana', country: 'Kazakhstan', countryCode: 'KZ', region: 'Asie', visaType: 'evisa' },
  { city: 'Achgabat', country: 'Turkménistan', countryCode: 'TM', region: 'Asie', visaType: 'visa_required' },
  { city: 'Douchanbé', country: 'Tadjikistan', countryCode: 'TJ', region: 'Asie', visaType: 'evisa' },

  // ── Moyen-Orient (eVisa / visa à l'arrivée) ───────────────────────
  { city: 'Riyad', country: 'Arabie Saoudite', countryCode: 'SA', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Djeddah', country: 'Arabie Saoudite', countryCode: 'SA', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'La Mecque', country: 'Arabie Saoudite', countryCode: 'SA', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Médine', country: 'Arabie Saoudite', countryCode: 'SA', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Koweït', country: 'Koweït', countryCode: 'KW', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Mascate', country: 'Oman', countryCode: 'OM', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Bahreïn', country: 'Bahreïn', countryCode: 'BH', region: 'Moyen-Orient', visaType: 'evisa' },
  { city: 'Amman', country: 'Jordanie', countryCode: 'JO', region: 'Moyen-Orient', visaType: 'on_arrival' },
  { city: 'Beyrouth', country: 'Liban', countryCode: 'LB', region: 'Moyen-Orient', visaType: 'on_arrival' },

  // ── Asie du Sud-Est (visa_free / on_arrival) ──────────────────────
  { city: 'Kuala Lumpur', country: 'Malaisie', countryCode: 'MY', region: 'Asie', visaType: 'visa_free' },
  { city: 'Singapour', country: 'Singapour', countryCode: 'SG', region: 'Asie', visaType: 'visa_free' },
  { city: 'Bangkok', country: 'Thaïlande', countryCode: 'TH', region: 'Asie', visaType: 'visa_free' },
  { city: 'Phuket', country: 'Thaïlande', countryCode: 'TH', region: 'Asie', visaType: 'visa_free' },
  { city: 'Bali', country: 'Indonésie', countryCode: 'ID', region: 'Asie', visaType: 'on_arrival' },
  { city: 'Jakarta', country: 'Indonésie', countryCode: 'ID', region: 'Asie', visaType: 'on_arrival' },
  { city: 'Ho Chi Minh-Ville', country: 'Viêt Nam', countryCode: 'VN', region: 'Asie', visaType: 'evisa' },
  { city: 'Hanoï', country: 'Viêt Nam', countryCode: 'VN', region: 'Asie', visaType: 'evisa' },
  { city: 'Manille', country: 'Philippines', countryCode: 'PH', region: 'Asie', visaType: 'visa_free' },

  // ── Asie du Sud ───────────────────────────────────────────────────
  { city: 'New Delhi', country: 'Inde', countryCode: 'IN', region: 'Asie', visaType: 'evisa' },
  { city: 'Mumbai', country: 'Inde', countryCode: 'IN', region: 'Asie', visaType: 'evisa' },
  { city: 'Goa', country: 'Inde', countryCode: 'IN', region: 'Asie', visaType: 'evisa' },
  { city: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', region: 'Asie', visaType: 'evisa' },
  { city: 'Katmandou', country: 'Népal', countryCode: 'NP', region: 'Asie', visaType: 'on_arrival' },
  { city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', region: 'Asie', visaType: 'on_arrival' },

  // ── Asie de l'Est ─────────────────────────────────────────────────
  { city: 'Tokyo', country: 'Japon', countryCode: 'JP', region: 'Asie', visaType: 'visa_free' },
  { city: 'Osaka', country: 'Japon', countryCode: 'JP', region: 'Asie', visaType: 'visa_free' },
  { city: 'Séoul', country: 'Corée du Sud', countryCode: 'KR', region: 'Asie', visaType: 'evisa' },
  { city: 'Pékin', country: 'Chine', countryCode: 'CN', region: 'Asie', visaType: 'visa_required' },
  { city: 'Shanghai', country: 'Chine', countryCode: 'CN', region: 'Asie', visaType: 'visa_required' },

  // ── Afrique (visa_free / on_arrival) ──────────────────────────────
  { city: 'Le Caire', country: 'Égypte', countryCode: 'EG', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Charm el-Cheikh', country: 'Égypte', countryCode: 'EG', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Louxor', country: 'Égypte', countryCode: 'EG', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Tunis', country: 'Tunisie', countryCode: 'TN', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Djerba', country: 'Tunisie', countryCode: 'TN', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Hammamet', country: 'Tunisie', countryCode: 'TN', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Alger', country: 'Algérie', countryCode: 'DZ', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Oran', country: 'Algérie', countryCode: 'DZ', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Dakar', country: 'Sénégal', countryCode: 'SN', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Abidjan', country: "Côte d'Ivoire", countryCode: 'CI', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Accra', country: 'Ghana', countryCode: 'GH', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Lagos', country: 'Nigéria', countryCode: 'NG', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Nairobi', country: 'Kenya', countryCode: 'KE', region: 'Afrique', visaType: 'evisa' },
  { city: 'Zanzibar', country: 'Tanzanie', countryCode: 'TZ', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Johannesburg', country: 'Afrique du Sud', countryCode: 'ZA', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Le Cap', country: 'Afrique du Sud', countryCode: 'ZA', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Addis-Abeba', country: 'Éthiopie', countryCode: 'ET', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Kigali', country: 'Rwanda', countryCode: 'RW', region: 'Afrique', visaType: 'visa_free' },
  { city: 'Kampala', country: 'Ouganda', countryCode: 'UG', region: 'Afrique', visaType: 'on_arrival' },
  { city: 'Tripoli', country: 'Libye', countryCode: 'LY', region: 'Afrique', visaType: 'visa_required' },
  { city: 'Nouakchott', country: 'Mauritanie', countryCode: 'MR', region: 'Afrique', visaType: 'on_arrival' },

  // ── Amériques ─────────────────────────────────────────────────────
  { city: 'New York', country: 'États-Unis', countryCode: 'US', region: 'Amériques', visaType: 'visa_required' },
  { city: 'Miami', country: 'États-Unis', countryCode: 'US', region: 'Amériques', visaType: 'visa_required' },
  { city: 'Los Angeles', country: 'États-Unis', countryCode: 'US', region: 'Amériques', visaType: 'visa_required' },
  { city: 'Montréal', country: 'Canada', countryCode: 'CA', region: 'Amériques', visaType: 'visa_required' },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Amériques', visaType: 'visa_required' },
  { city: 'Vancouver', country: 'Canada', countryCode: 'CA', region: 'Amériques', visaType: 'visa_required' },
  { city: 'São Paulo', country: 'Brésil', countryCode: 'BR', region: 'Amériques', visaType: 'visa_free' },
  { city: 'Rio de Janeiro', country: 'Brésil', countryCode: 'BR', region: 'Amériques', visaType: 'visa_free' },
  { city: 'Buenos Aires', country: 'Argentine', countryCode: 'AR', region: 'Amériques', visaType: 'visa_free' },
  { city: 'Mexico', country: 'Mexique', countryCode: 'MX', region: 'Amériques', visaType: 'visa_free' },
  { city: 'Cancún', country: 'Mexique', countryCode: 'MX', region: 'Amériques', visaType: 'visa_free' },
  { city: 'La Havane', country: 'Cuba', countryCode: 'CU', region: 'Amériques', visaType: 'on_arrival' },

  // ── Océanie ───────────────────────────────────────────────────────
  { city: 'Sydney', country: 'Australie', countryCode: 'AU', region: 'Océanie', visaType: 'evisa' },
  { city: 'Melbourne', country: 'Australie', countryCode: 'AU', region: 'Océanie', visaType: 'evisa' },
  { city: 'Auckland', country: 'Nouvelle-Zélande', countryCode: 'NZ', region: 'Océanie', visaType: 'evisa' },
];

function buildId(destination: ExtraDestination) {
  return `simulator-${destination.countryCode}-${destination.city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`;
}

const builtExtraDestinations: Destination[] = extraSimulatorDestinations.map(
  (destination) => ({
    ...destination,
    id: buildId(destination),
    isFeatured: false,
  }),
);

function getDestinationKey(destination: Destination) {
  return `${destination.countryCode ?? ''}:${destination.city}`.toLowerCase();
}

function normalizeDestination(destination: Destination): Destination {
  return {
    ...destination,
    visaType: getVisaTypeForCountry(destination.countryCode, destination.visaType),
  };
}

export function getSimulatorDestinations(destinations: Destination[]) {
  const mergedDestinations = new Map<string, Destination>();

  for (const destination of [
    ...builtExtraDestinations,
    ...destinations.map(normalizeDestination),
  ]) {
    mergedDestinations.set(getDestinationKey(destination), destination);
  }

  return Array.from(mergedDestinations.values()).sort((a, b) =>
    a.city.localeCompare(b.city, 'fr'),
  );
}
