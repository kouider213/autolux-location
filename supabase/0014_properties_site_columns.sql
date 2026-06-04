-- Migration 0014 : Colonnes manquantes sur properties (alignement site/admin/Dzaryx)
-- La table properties venait d'un ancien module (name, monthly_rent, tenant_name...).
-- Le site immo + l'admin + Dzaryx utilisent title/city/price/image_url... qui
-- n'existaient pas → erreurs "Could not find the 'city'/'available' column".
-- Cette migration ajoute toutes les colonnes attendues. Non destructif (ADD IF NOT EXISTS).
-- Exécuter dans Supabase > SQL Editor.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS title       TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS city        TEXT DEFAULT 'Oran';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS district    TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price       NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_type  TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface     NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rooms       INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor       INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url   TEXT;

-- Reprise éventuelle de l'ancien champ name → title (si title vide)
UPDATE properties SET title = name WHERE title IS NULL AND name IS NOT NULL;
