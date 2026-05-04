-- Algeria visa requirement for Moroccan passport holders.
-- Run this file in the Supabase SQL Editor.
-- This script updates existing rows only and does not change schema.
--
-- Official Algerian MFA/Embassy source:
-- https://embbrussels.mfa.gov.dz/en/news-and-press-releases/visa-requirement-reinstated-for-all-foreign-nationals-with-moroccan-passports

do $$
begin
  update countries
  set
    visa_type = 'visa_required',
    max_stay_days = null,
    notes = 'Visa obligatoire pour les voyageurs marocains. À vérifier auprès des autorités consulaires algériennes avant le départ.',
    official_source_url = 'https://embbrussels.mfa.gov.dz/en/news-and-press-releases/visa-requirement-reinstated-for-all-foreign-nationals-with-moroccan-passports',
    is_featured = false
  where code = 'DZ';

  update destinations
  set visa_type = 'visa_required'
  where country_code = 'DZ';
exception
  when check_violation or invalid_text_representation then
    update countries
    set
      max_stay_days = null,
      notes = 'Visa obligatoire pour les voyageurs marocains. À vérifier auprès des autorités consulaires algériennes avant le départ.',
      official_source_url = 'https://embbrussels.mfa.gov.dz/en/news-and-press-releases/visa-requirement-reinstated-for-all-foreign-nationals-with-moroccan-passports',
      is_featured = false
    where code = 'DZ';

    raise notice 'visa_type does not accept visa_required in the current database constraint. App-side display override is active for DZ.';
end $$;
