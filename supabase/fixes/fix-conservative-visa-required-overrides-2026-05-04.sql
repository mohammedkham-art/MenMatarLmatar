-- Conservative visa-policy corrections for Moroccan ordinary passport holders.
-- Goal: avoid showing "Sans visa" when a visa appears required or only conditionally waived.
-- Run in Supabase SQL Editor. If visa_required is blocked by the DB constraint,
-- keep the app-side overrides in services/countries/get-countries.ts as the display source of truth.

do $$
begin
  update countries
  set
    visa_type = 'visa_required',
    max_stay_days = null,
    notes = case code
      when 'BA' then 'Visa requis ou exemption uniquement sous conditions particulières. À vérifier auprès des autorités de Bosnie-Herzégovine avant le départ.'
      when 'ME' then 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.'
      when 'MK' then 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.'
      when 'PE' then 'Visa requis selon les sources de référence consultées. À vérifier auprès des autorités consulaires péruviennes avant le départ.'
      when 'RS' then 'Visa requis pour les passeports marocains ordinaires. À vérifier auprès des autorités serbes avant le départ.'
      else notes
    end,
    is_featured = false
  where code in ('BA', 'ME', 'MK', 'PE', 'RS');

  update destinations
  set visa_type = 'visa_required'
  where country_code in ('BA', 'ME', 'MK', 'PE', 'RS');
exception
  when check_violation then
    update countries
    set
      max_stay_days = null,
      notes = case code
        when 'BA' then 'Visa requis ou exemption uniquement sous conditions particulières. À vérifier auprès des autorités de Bosnie-Herzégovine avant le départ.'
        when 'ME' then 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.'
        when 'MK' then 'Visa requis pour les passeports marocains ordinaires, sauf exemptions conditionnelles avec certains visas ou titres de séjour. À vérifier avant le départ.'
        when 'PE' then 'Visa requis selon les sources de référence consultées. À vérifier auprès des autorités consulaires péruviennes avant le départ.'
        when 'RS' then 'Visa requis pour les passeports marocains ordinaires. À vérifier auprès des autorités serbes avant le départ.'
        else notes
      end,
      is_featured = false
    where code in ('BA', 'ME', 'MK', 'PE', 'RS');

    raise notice 'visa_required is not accepted by the current DB constraint. App-side overrides still force display as visa_required.';
end $$;
