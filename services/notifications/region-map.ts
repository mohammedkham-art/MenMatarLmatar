export type Region =
  | 'maghreb'
  | 'europe'
  | 'middle_east'
  | 'asia'
  | 'africa_sub'
  | 'americas'
  | 'oceania';

export type CheapDealThresholds = {
  default: number;
  regions: Partial<Record<Region, number>>;
  country_overrides: Record<string, number>;
};

const REGION_COUNTRIES: Record<Region, string[]> = {
  maghreb: ['MA', 'DZ', 'TN', 'LY', 'MR'],
  europe: [
    // EU 27
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    // Non-EU Western Europe
    'GB', 'CH', 'NO', 'IS',
    // Micro-states
    'AD', 'MC', 'SM', 'VA', 'LI',
    // Balkans non-EU
    'AL', 'BA', 'MK', 'ME', 'RS', 'XK',
    // Eastern Europe
    'RU', 'BY', 'UA', 'MD',
  ],
  middle_east: [
    'SA', 'AE', 'QA', 'KW', 'BH', 'OM',
    'SY', 'LB', 'JO', 'PS', 'IL',
    'EG', 'TR', 'IR', 'IQ', 'YE',
    // Caucasus (déplacé depuis europe — seuils europe irréalistes)
    'AM', 'GE', 'AZ',
  ],
  asia: [
    // Central Asia
    'KZ', 'KG', 'TJ', 'TM', 'UZ',
    // South Asia
    'IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV', 'AF',
    // Southeast Asia
    'TH', 'VN', 'LA', 'KH', 'MM', 'MY', 'SG', 'ID', 'PH', 'BN', 'TL',
    // East Asia
    'CN', 'JP', 'KP', 'KR', 'MN', 'TW', 'HK', 'MO',
  ],
  africa_sub: [
    'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM',
    'CG', 'CD', 'CI', 'DJ', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM',
    'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'MG', 'MW', 'ML', 'MU',
    'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO',
    'ZA', 'SS', 'SD', 'TZ', 'TG', 'UG', 'ZM', 'ZW',
  ],
  americas: [
    // North America
    'US', 'CA', 'MX',
    // Central America
    'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA',
    // South America
    'CO', 'VE', 'GY', 'SR', 'EC', 'PE', 'BR', 'BO', 'PY', 'CL',
    'AR', 'UY',
    // Caribbean (sovereign states)
    'CU', 'JM', 'HT', 'DO', 'BS', 'BB', 'TT', 'GD', 'LC', 'VC',
    'AG', 'DM', 'KN',
  ],
  oceania: [
    'AU', 'NZ', 'PG', 'FJ', 'SB', 'VU', 'WS', 'TO', 'KI', 'FM',
    'MH', 'PW', 'NR', 'TV',
  ],
};

export const countryToRegion: Record<string, Region> = Object.fromEntries(
  (Object.entries(REGION_COUNTRIES) as [Region, string[]][]).flatMap(
    ([region, codes]) => codes.map((code) => [code, region] as const),
  ),
);

export function getRegionForCountry(countryCode: string): Region | null {
  const normalized = countryCode.trim().toUpperCase();

  return countryToRegion[normalized] ?? null;
}

export function resolveCheapThreshold(
  deal: { countryCode?: string | null },
  config: CheapDealThresholds,
): number {
  const code = deal.countryCode?.trim().toUpperCase();

  if (code && code in config.country_overrides) {
    return config.country_overrides[code];
  }

  if (code) {
    const region = getRegionForCountry(code);

    if (region && config.regions[region] !== undefined) {
      return config.regions[region]!;
    }
  }

  return config.default;
}
