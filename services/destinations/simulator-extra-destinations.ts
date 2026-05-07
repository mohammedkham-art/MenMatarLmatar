import type { Destination } from '@/services/destinations/get-destinations';
import { getVisaTypeForCountry } from '@/services/visa/visa-rules';

const visaRequiredSimulatorDestinations: Destination[] = [
  { city: 'Paris', country: 'France', countryCode: 'FR', region: 'Europe' },
  { city: 'Marseille', country: 'France', countryCode: 'FR', region: 'Europe' },
  { city: 'Lyon', country: 'France', countryCode: 'FR', region: 'Europe' },
  { city: 'Nice', country: 'France', countryCode: 'FR', region: 'Europe' },
  { city: 'Bordeaux', country: 'France', countryCode: 'FR', region: 'Europe' },
  { city: 'Toulouse', country: 'France', countryCode: 'FR', region: 'Europe' },
  {
    city: 'Barcelone',
    country: 'Espagne',
    countryCode: 'ES',
    region: 'Europe',
  },
  { city: 'Madrid', country: 'Espagne', countryCode: 'ES', region: 'Europe' },
  { city: 'Malaga', country: 'Espagne', countryCode: 'ES', region: 'Europe' },
  { city: 'Valence', country: 'Espagne', countryCode: 'ES', region: 'Europe' },
  { city: 'Séville', country: 'Espagne', countryCode: 'ES', region: 'Europe' },
  { city: 'Alicante', country: 'Espagne', countryCode: 'ES', region: 'Europe' },
  {
    city: 'Lisbonne',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Europe',
  },
  { city: 'Porto', country: 'Portugal', countryCode: 'PT', region: 'Europe' },
  { city: 'Faro', country: 'Portugal', countryCode: 'PT', region: 'Europe' },
  {
    city: 'Londres',
    country: 'Royaume-Uni',
    countryCode: 'GB',
    region: 'Europe',
  },
  {
    city: 'Manchester',
    country: 'Royaume-Uni',
    countryCode: 'GB',
    region: 'Europe',
  },
  {
    city: 'Édimbourg',
    country: 'Royaume-Uni',
    countryCode: 'GB',
    region: 'Europe',
  },
  {
    city: 'Birmingham',
    country: 'Royaume-Uni',
    countryCode: 'GB',
    region: 'Europe',
  },
  { city: 'Rome', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Milan', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Bergame', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Venise', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Bologne', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Naples', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  { city: 'Pise', country: 'Italie', countryCode: 'IT', region: 'Europe' },
  {
    city: 'Amsterdam',
    country: 'Pays-Bas',
    countryCode: 'NL',
    region: 'Europe',
  },
  {
    city: 'Eindhoven',
    country: 'Pays-Bas',
    countryCode: 'NL',
    region: 'Europe',
  },
  {
    city: 'Rotterdam',
    country: 'Pays-Bas',
    countryCode: 'NL',
    region: 'Europe',
  },
  {
    city: 'Copenhague',
    country: 'Danemark',
    countryCode: 'DK',
    region: 'Europe',
  },
  { city: 'Billund', country: 'Danemark', countryCode: 'DK', region: 'Europe' },
].map((destination) => ({
  ...destination,
  id: `simulator-${destination.countryCode}-${destination.city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`,
  visaType: 'visa_required',
  isFeatured: false,
}));

function getDestinationKey(destination: Destination) {
  return `${destination.countryCode ?? ''}:${destination.city}`.toLowerCase();
}

function normalizeVisaRequiredDestination(
  destination: Destination,
): Destination {
  return {
    ...destination,
    visaType: getVisaTypeForCountry(destination.countryCode, destination.visaType),
  };
}

export function getSimulatorDestinations(destinations: Destination[]) {
  const mergedDestinations = new Map<string, Destination>();

  for (const destination of [
    ...destinations.map(normalizeVisaRequiredDestination),
    ...visaRequiredSimulatorDestinations,
  ]) {
    mergedDestinations.set(getDestinationKey(destination), destination);
  }

  return Array.from(mergedDestinations.values()).sort((a, b) =>
    a.city.localeCompare(b.city, 'fr'),
  );
}
