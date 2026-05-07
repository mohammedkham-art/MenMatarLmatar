-- ============================================================
-- Suppression du hack metadonnee visa_type - 2026-05-07
-- A executer dans l editeur SQL Supabase (Run).
-- ============================================================

-- 1. Mettre a jour les contraintes pour autoriser visa_required directement
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_visa_type_check;
ALTER TABLE countries ADD CONSTRAINT countries_visa_type_check
  CHECK (visa_type IN ('visa_free', 'evisa', 'e_visa', 'on_arrival', 'visa_on_arrival', 'visa_required'));

ALTER TABLE destinations DROP CONSTRAINT IF EXISTS destinations_visa_type_check;
ALTER TABLE destinations ADD CONSTRAINT destinations_visa_type_check
  CHECK (visa_type IN ('visa_free', 'evisa', 'e_visa', 'on_arrival', 'visa_on_arrival', 'visa_required'));

-- 2. Stocker visa_required directement dans les tables (fin du contournement)
UPDATE countries SET visa_type = 'visa_required'
WHERE code IN ('BA', 'DK', 'DZ', 'ES', 'FR', 'IT', 'ME', 'MK', 'NL', 'PE', 'PT', 'RS', 'SA');

UPDATE destinations SET visa_type = 'visa_required'
WHERE country_code IN ('BA', 'DK', 'DZ', 'ES', 'FR', 'IT', 'ME', 'MK', 'NL', 'PE', 'PT', 'RS', 'SA');

-- 3. Supprimer les metadonnees cachees des notes (<!-- mmlm:visa_type=... -->)
UPDATE countries
SET notes = TRIM(REGEXP_REPLACE(notes::text, '<!--\s*mmlm:visa_type=[^>]*-->', '', 'g'))
WHERE notes LIKE '%mmlm:visa_type%';
