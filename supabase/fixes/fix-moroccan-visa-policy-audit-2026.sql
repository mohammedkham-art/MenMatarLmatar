-- Moroccan passport visa policy audit baseline.
-- Run this file in the Supabase SQL Editor.
-- This script updates existing rows only and does not change schema.
--
-- Broad baseline source:
-- https://evisas.io/visa-free-countries/ma
--
-- Thailand official context:
-- https://thailand.prd.go.th/en/content/category/detail/id/2078/iid/307112
--
-- Important: visa policies can change quickly. Treat this as a product data
-- correction baseline, not legal advice.

with visa_fixes(code, visa_type, max_stay_days, source_url) as (
  values
    -- Visa-free for Moroccan passport holders.
    ('AO', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('AZ', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('BB', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BF', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BJ', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BR', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('BZ', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('CI', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('CO', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('CV', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('DM', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('DO', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('EC', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('FM', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('GA', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('GD', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('GH', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('GM', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('GN', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('HK', 'visa_free', 30, 'https://evisas.io/visa-free-countries/ma'),
    ('HT', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('KE', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('KI', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('KZ', 'visa_free', 30, 'https://evisas.io/visa-free-countries/ma'),
    ('ML', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('MO', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MY', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('NE', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('PH', 'visa_free', 30, 'https://evisas.io/visa-free-countries/ma'),
    ('PS', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('RW', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('SN', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('SR', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('ST', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('SY', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TG', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('TH', 'visa_free', 60, 'https://thailand.prd.go.th/en/content/category/detail/id/2078/iid/307112'),
    ('TN', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('TR', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),
    ('VC', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('VU', 'visa_free', null, 'https://evisas.io/visa-free-countries/ma'),
    ('ZM', 'visa_free', 90, 'https://evisas.io/visa-free-countries/ma'),

    -- Visa on arrival for Moroccan passport holders.
    ('KR', 'on_arrival', null, 'https://evisas.io/visa-free-countries/ma'),
    ('LK', 'on_arrival', null, 'https://evisas.io/visa-free-countries/ma'),
    ('SC', 'on_arrival', null, 'https://evisas.io/visa-free-countries/ma'),

    -- eVisa available for Moroccan passport holders.
    ('AG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('AI', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('AL', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('AM', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BH', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BI', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BO', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BT', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('BW', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('CD', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('CG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('CU', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('DJ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('ET', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('GQ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('GW', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('ID', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('IN', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('IQ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('IR', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('JO', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('KG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('KH', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('KM', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('KN', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('LA', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('LB', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('LY', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MD', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MH', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MM', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MR', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MS', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MU', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MV', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MW', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('MZ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('NA', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('NG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('NI', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('NP', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('OM', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('PG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('PK', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('PW', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('QA', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('SG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('SL', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('SS', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TD', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TJ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TL', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TT', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TV', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('TZ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('UG', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('UZ', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('VN', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('WS', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('ZA', 'evisa', null, 'https://evisas.io/visa-free-countries/ma'),
    ('ZW', 'evisa', null, 'https://evisas.io/visa-free-countries/ma')
)
update countries
set
  visa_type = visa_fixes.visa_type,
  max_stay_days = coalesce(visa_fixes.max_stay_days, countries.max_stay_days),
  official_source_url = visa_fixes.source_url,
  notes = case
    when visa_fixes.visa_type = 'visa_free'
      then 'Sans visa pour les voyageurs marocains selon conditions.'
    when visa_fixes.visa_type = 'on_arrival'
      then 'Visa à l’arrivée pour les voyageurs marocains selon conditions.'
    when visa_fixes.visa_type = 'evisa'
      then 'eVisa pour les voyageurs marocains selon conditions.'
    else countries.notes
  end ||
  case
    when coalesce(visa_fixes.max_stay_days, countries.max_stay_days) is null
      then ' Durée de séjour à vérifier avant le départ.'
    else ' Séjour indicatif : ' || coalesce(visa_fixes.max_stay_days, countries.max_stay_days) || ' jours.'
  end
from visa_fixes
where countries.code = visa_fixes.code;

with visa_fixes(code, visa_type) as (
  values
    ('AO', 'visa_free'), ('AZ', 'visa_free'), ('BB', 'visa_free'), ('BF', 'visa_free'),
    ('BJ', 'visa_free'), ('BR', 'visa_free'), ('BZ', 'visa_free'), ('CI', 'visa_free'),
    ('CO', 'visa_free'), ('CV', 'visa_free'), ('DM', 'visa_free'), ('DO', 'visa_free'),
    ('EC', 'visa_free'), ('FM', 'visa_free'), ('GA', 'visa_free'), ('GD', 'visa_free'),
    ('GH', 'visa_free'), ('GM', 'visa_free'), ('GN', 'visa_free'), ('HK', 'visa_free'),
    ('HT', 'visa_free'), ('KE', 'visa_free'), ('KI', 'visa_free'), ('KZ', 'visa_free'),
    ('ML', 'visa_free'), ('MO', 'visa_free'), ('MY', 'visa_free'), ('NE', 'visa_free'),
    ('PH', 'visa_free'), ('PS', 'visa_free'), ('RW', 'visa_free'), ('SN', 'visa_free'),
    ('SR', 'visa_free'), ('ST', 'visa_free'), ('SY', 'visa_free'), ('TG', 'visa_free'),
    ('TH', 'visa_free'), ('TN', 'visa_free'), ('TR', 'visa_free'), ('VC', 'visa_free'),
    ('VU', 'visa_free'), ('ZM', 'visa_free'),
    ('KR', 'on_arrival'), ('LK', 'on_arrival'), ('SC', 'on_arrival'),
    ('AG', 'evisa'), ('AI', 'evisa'), ('AL', 'evisa'), ('AM', 'evisa'),
    ('BH', 'evisa'), ('BI', 'evisa'), ('BO', 'evisa'), ('BT', 'evisa'),
    ('BW', 'evisa'), ('CD', 'evisa'), ('CG', 'evisa'), ('CU', 'evisa'),
    ('DJ', 'evisa'), ('ET', 'evisa'), ('GQ', 'evisa'), ('GW', 'evisa'),
    ('ID', 'evisa'), ('IN', 'evisa'), ('IQ', 'evisa'), ('IR', 'evisa'),
    ('JO', 'evisa'), ('KG', 'evisa'), ('KH', 'evisa'), ('KM', 'evisa'),
    ('KN', 'evisa'), ('LA', 'evisa'), ('LB', 'evisa'), ('LY', 'evisa'),
    ('MD', 'evisa'), ('MG', 'evisa'), ('MH', 'evisa'), ('MM', 'evisa'),
    ('MR', 'evisa'), ('MS', 'evisa'), ('MU', 'evisa'), ('MV', 'evisa'),
    ('MW', 'evisa'), ('MZ', 'evisa'), ('NA', 'evisa'), ('NG', 'evisa'),
    ('NI', 'evisa'), ('NP', 'evisa'), ('OM', 'evisa'), ('PG', 'evisa'),
    ('PK', 'evisa'), ('PW', 'evisa'), ('QA', 'evisa'), ('SG', 'evisa'),
    ('SL', 'evisa'), ('SS', 'evisa'), ('TD', 'evisa'), ('TJ', 'evisa'),
    ('TL', 'evisa'), ('TT', 'evisa'), ('TV', 'evisa'), ('TZ', 'evisa'),
    ('UG', 'evisa'), ('UZ', 'evisa'), ('VN', 'evisa'), ('WS', 'evisa'),
    ('ZA', 'evisa'), ('ZW', 'evisa')
)
update destinations
set visa_type = visa_fixes.visa_type
from visa_fixes
where destinations.country_code = visa_fixes.code;
