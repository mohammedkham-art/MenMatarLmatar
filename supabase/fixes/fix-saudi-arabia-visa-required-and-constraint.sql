-- Allow visa_required in visa_type constraints and correct Saudi Arabia.
-- Run this file in the Supabase SQL Editor or with Prisma db execute.

alter table countries
drop constraint if exists countries_visa_type_check;

alter table countries
add constraint countries_visa_type_check
check (
  visa_type in (
    'visa_free',
    'evisa',
    'e_visa',
    'on_arrival',
    'visa_on_arrival',
    'visa_required'
  )
);

alter table destinations
drop constraint if exists destinations_visa_type_check;

alter table destinations
add constraint destinations_visa_type_check
check (
  visa_type in (
    'visa_free',
    'evisa',
    'e_visa',
    'on_arrival',
    'visa_on_arrival',
    'visa_required'
  )
);

update countries
set
  visa_type = 'visa_required',
  max_stay_days = null,
  notes = 'Visa requis pour les voyageurs marocains. À vérifier auprès des autorités saoudiennes ou de la plateforme officielle avant réservation ou départ.',
  is_featured = false
where code = 'SA';

update destinations
set visa_type = 'visa_required'
where country_code = 'SA';
