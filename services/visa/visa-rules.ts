export type VisaType =
  | 'visa_free'
  | 'evisa'
  | 'e_visa'
  | 'on_arrival'
  | 'visa_on_arrival'
  | 'visa_required';

export type StoredVisaType =
  | 'visa_free'
  | 'evisa'
  | 'on_arrival'
  | 'visa_required';

const visaTypeAliases: Partial<Record<VisaType, StoredVisaType>> = {
  e_visa: 'evisa',
  visa_on_arrival: 'on_arrival',
};

export const visaBadgeStyles: Record<VisaType, string> = {
  visa_free: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  evisa: 'bg-blue-50 text-blue-700 ring-blue-200',
  e_visa: 'bg-blue-50 text-blue-700 ring-blue-200',
  on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_on_arrival: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  visa_required: 'bg-red-50 text-red-700 ring-red-200',
};

export const defaultVisaBadgeStyle = 'bg-muted text-muted-foreground ring-border';

export const visaLabels: Record<VisaType, string> = {
  visa_free: 'Sans visa',
  evisa: 'eVisa',
  e_visa: 'eVisa',
  on_arrival: 'Visa à l’arrivée',
  visa_on_arrival: 'Visa à l’arrivée',
  visa_required: 'Visa requis',
};

export function normalizeVisaType(visaType: null): null;
export function normalizeVisaType(visaType: VisaType): StoredVisaType;
export function normalizeVisaType(
  visaType: VisaType | null,
): StoredVisaType | null;
export function normalizeVisaType(visaType: VisaType | null) {
  if (!visaType) {
    return null;
  }

  return visaTypeAliases[visaType] ?? visaType;
}

export function getVisaTypeForCountry(
  countryCode: string | null | undefined,
  visaType: null,
): StoredVisaType | null;
export function getVisaTypeForCountry(
  countryCode: string | null | undefined,
  visaType: VisaType,
): StoredVisaType;
export function getVisaTypeForCountry(
  countryCode: string | null | undefined,
  visaType: VisaType | null,
): StoredVisaType | null;
export function getVisaTypeForCountry(
  _countryCode: string | null | undefined,
  visaType: VisaType | null,
) {
  return normalizeVisaType(visaType);
}

export function isPublicVisaType(visaType: VisaType | null) {
  return normalizeVisaType(visaType) !== 'visa_required';
}
