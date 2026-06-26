export type CurrencyInfo = { code: string; name: string };

export const currencyMap: Record<string, CurrencyInfo> = {
  TH: { code: 'THB', name: 'Baht thaïlandais' },
  CH: { code: 'CHF', name: 'Franc suisse' },
  BR: { code: 'BRL', name: 'Real brésilien' },
  ES: { code: 'EUR', name: 'Euro' },
  FR: { code: 'EUR', name: 'Euro' },
  TR: { code: 'TRY', name: 'Livre turque' },
  TN: { code: 'TND', name: 'Dinar tunisien' },
  AZ: { code: 'AZN', name: 'Manat azerbaïdjanais' },
  MY: { code: 'MYR', name: 'Ringgit malaisien' },
  CV: { code: 'CVE', name: 'Escudo cap-verdien' },
  MV: { code: 'MVR', name: 'Rufiyaa maldivien' },
  CN: { code: 'CNY', name: 'Yuan chinois' },
  SA: { code: 'SAR', name: 'Riyal saoudien' },
  AE: { code: 'AED', name: 'Dirham émirati' },
  JP: { code: 'JPY', name: 'Yen japonais' },
  GB: { code: 'GBP', name: 'Livre sterling' },
  US: { code: 'USD', name: 'Dollar américain' },
  ID: { code: 'IDR', name: 'Roupie indonésienne' },
  MA: { code: 'MAD', name: 'Dirham marocain' },
};
