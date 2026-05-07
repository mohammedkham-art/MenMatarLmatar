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

const visaTypeMetadataPattern =
  /<!--\s*mmlm:visa_type=(visa_free|evisa|e_visa|on_arrival|visa_on_arrival|visa_required)\s*-->/;

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

export function getVisaTypeFromMetadata(notes: string | null | undefined) {
  const visaType = notes?.match(visaTypeMetadataPattern)?.[1] as
    | VisaType
    | undefined;

  return visaType ? normalizeVisaType(visaType) : null;
}

export function stripVisaTypeMetadata(notes: string | null | undefined) {
  return notes?.replace(visaTypeMetadataPattern, '').trim() || null;
}

export function appendVisaTypeMetadata(
  notes: string | null | undefined,
  visaType: VisaType,
) {
  return [
    stripVisaTypeMetadata(notes),
    `<!-- mmlm:visa_type=${normalizeVisaType(visaType)} -->`,
  ]
    .filter(Boolean)
    .join('\n');
}

const countryVisaTypeOverrides: Partial<Record<string, StoredVisaType>> = {
  BA: 'visa_required',
  DK: 'visa_required',
  DZ: 'visa_required',
  ES: 'visa_required',
  FR: 'visa_required',
  IT: 'visa_required',
  ME: 'visa_required',
  MK: 'visa_required',
  NL: 'visa_required',
  PE: 'visa_required',
  PT: 'visa_required',
  RS: 'visa_required',
  SA: 'visa_required',
};

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
  countryCode: string | null | undefined,
  visaType: VisaType | null,
) {
  if (countryCode && countryCode in countryVisaTypeOverrides) {
    return countryVisaTypeOverrides[countryCode]!;
  }

  return normalizeVisaType(visaType);
}

export function isPublicVisaType(visaType: VisaType | null) {
  return getVisaTypeForCountry(null, visaType) !== 'visa_required';
}

export function isVisaRequiredCountry(countryCode: string | null | undefined) {
  return getVisaTypeForCountry(countryCode, null) === 'visa_required';
}
