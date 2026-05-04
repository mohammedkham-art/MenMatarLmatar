import type { Country } from '@/services/countries/get-countries';

export const fallbackCountries: Country[] = [
  {
    id: 'fallback-tr',
    name: 'Turquie',
    code: 'TR',
    region: 'Europe / Asie',
    visaType: 'visa_free',
    maxStayDays: 90,
    notes:
      'Sans visa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: true,
  },
  {
    id: 'fallback-th',
    name: 'Thaïlande',
    code: 'TH',
    region: 'Asie du Sud-Est',
    visaType: 'visa_free',
    maxStayDays: 60,
    notes:
      'Sans visa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: true,
  },
  {
    id: 'fallback-tn',
    name: 'Tunisie',
    code: 'TN',
    region: 'Afrique du Nord',
    visaType: 'visa_free',
    maxStayDays: 90,
    notes:
      'Sans visa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: true,
  },
  {
    id: 'fallback-ae',
    name: 'Émirats arabes unis',
    code: 'AE',
    region: 'Moyen-Orient',
    visaType: 'evisa',
    maxStayDays: 30,
    notes:
      'eVisa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: true,
  },
  {
    id: 'fallback-bh',
    name: 'Bahreïn',
    code: 'BH',
    region: 'Moyen-Orient',
    visaType: 'evisa',
    maxStayDays: 14,
    notes:
      'eVisa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: false,
  },
  {
    id: 'fallback-kh',
    name: 'Cambodge',
    code: 'KH',
    region: 'Asie du Sud-Est',
    visaType: 'evisa',
    maxStayDays: 30,
    notes:
      'eVisa pour les voyageurs marocains selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: false,
  },
  {
    id: 'fallback-sc',
    name: 'Seychelles',
    code: 'SC',
    region: 'Afrique de l’Est',
    visaType: 'visa_on_arrival',
    maxStayDays: 90,
    notes:
      'Autorisation ou formalité à l’arrivée selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: true,
  },
  {
    id: 'fallback-lk',
    name: 'Sri Lanka',
    code: 'LK',
    region: 'Asie du Sud',
    visaType: 'visa_on_arrival',
    maxStayDays: 30,
    notes:
      'Formalité à l’arrivée ou autorisation préalable selon conditions. À vérifier avant le départ.',
    officialSourceUrl: null,
    isFeatured: false,
  },
];
