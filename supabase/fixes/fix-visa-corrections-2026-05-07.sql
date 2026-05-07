-- ============================================================
-- Corrections donnees visa passeports marocains - 2026-05-07
-- Sources verifiees sur deux sources officielles.
-- A executer dans l'editeur SQL Supabase (Run).
-- ============================================================


-- -----------------------------------------------------------------
-- SECTION 1 - Corrections de TYPE de visa
-- -----------------------------------------------------------------

-- Tadjikistan : evisa -> sans visa (14j)
update countries set
  visa_type           = 'visa_free',
  max_stay_days       = 14,
  notes               = 'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 14 jours.',
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
where code = 'TJ';
update destinations set visa_type = 'visa_free' where country_code = 'TJ';

-- Coree du Sud : visa a l''arrivee -> eVisa (K-ETA, 90j)
update countries set
  visa_type           = 'evisa',
  max_stay_days       = 90,
  notes               = 'eVisa (K-ETA) requis pour les voyageurs marocains. Autorisation electronique a obtenir avant le depart. Sejour indicatif : 90 jours.',
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
where code = 'KR';
update destinations set visa_type = 'evisa' where country_code = 'KR';

-- Sri Lanka : visa a l''arrivee -> eVisa (30j)
update countries set
  visa_type           = 'evisa',
  max_stay_days       = 30,
  notes               = 'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.',
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
where code = 'LK';
update destinations set visa_type = 'evisa' where country_code = 'LK';

-- 14 pays : evisa -> visa a l''arrivee
update countries set
  visa_type           = 'on_arrival',
  max_stay_days       = v.max_stay_days,
  notes               = v.notes,
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
from (values
  ('BI', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('KM', 45,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 45 jours.'),
  ('GW', 90,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('ID', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('MH', 90,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('LB', 30,  'Visa a l''arrivee sous conditions strictes : reservation hotel 3 a 5 etoiles, 2 000 USD en especes, billet retour, et aucun tampon israelien sur le passeport. Sejour indicatif : 30 jours.'),
  ('MV', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('MU', 60,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'),
  ('NP', 90,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('PW', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('CG', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('WS', 90,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('TL', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('TV', 30,  'Visa a l''arrivee pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.')
) as v(code, max_stay_days, notes)
where countries.code = v.code;

update destinations set visa_type = 'on_arrival'
where country_code in ('BI','KM','GW','ID','MH','LB','MV','MU','NP','PW','CG','WS','TL','TV');


-- -----------------------------------------------------------------
-- SECTION 2 - Corrections de DUREE de sejour
-- (type de visa inchange, seule la duree et la note sont mises a jour)
-- -----------------------------------------------------------------

update countries set
  max_stay_days       = v.max_stay_days,
  notes               = v.notes,
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
from (values
  ('BB', 90,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('BF', 90,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('BJ', 90,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('BZ', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('DM', 21,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 21 jours.'),
  ('DO', 60,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'),
  ('GH', 90,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('KE', 60,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'),
  ('KI', 90,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('FM', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('RW', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('ST', 15,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 15 jours.'),
  ('VC', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('VU', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('ZM', 30,  'Sans visa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('AG', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('AL', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('AM', 120, 'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 120 jours.'),
  ('BW', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('CD', 7,   'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 7 jours.'),
  ('CU', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('DJ', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('ET', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('KG', 60,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'),
  ('KN', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('MG', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('MM', 28,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 28 jours.'),
  ('MR', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('MW', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('NA', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('NG', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('PG', 60,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'),
  ('PK', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('SL', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'),
  ('TT', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('TZ', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('UG', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('VN', 90,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'),
  ('ZW', 30,  'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.')
) as v(code, max_stay_days, notes)
where countries.code = v.code;

-- Suriname : frais d''entree 50 USD (type sans visa inchange)
update countries
set notes = 'Sans visa pour les voyageurs marocains selon conditions. Frais d''entree de 50 USD a regler en ligne avant l''arrivee. Sejour indicatif : 90 jours.'
where code = 'SR';


-- -----------------------------------------------------------------
-- SECTION 3 - Bahamas, Cameroun, Guyana, Somalie, Royaume-Uni
-- -----------------------------------------------------------------

update countries set
  visa_type           = v.visa_type,
  max_stay_days       = v.max_stay_days,
  notes               = v.notes,
  official_source_url = 'https://visaindex.com/visa-requirement/morocco-passport-visa-free-countries-list/'
from (values
  ('BS'::text, 'evisa'::text, 90::int,   'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 90 jours.'::text),
  ('CM'::text, 'evisa'::text, 60::int,   'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 60 jours.'::text),
  ('GY'::text, 'evisa'::text, null::int, 'eVisa pour les voyageurs marocains selon conditions. Duree de sejour a verifier avant le depart.'::text),
  ('SO'::text, 'evisa'::text, 30::int,   'eVisa pour les voyageurs marocains selon conditions. Sejour indicatif : 30 jours.'::text),
  ('GB'::text, 'evisa'::text, null::int, 'eVisa obligatoire pour les voyageurs marocains depuis fevrier 2026. Demande en ligne via le portail officiel UK Visas and Immigration. Duree de sejour variable selon le type de visa accorde.'::text)
) as v(code, visa_type, max_stay_days, notes)
where countries.code = v.code;

update destinations set visa_type = 'evisa'
where country_code in ('BS', 'CM', 'GY', 'SO', 'GB');
