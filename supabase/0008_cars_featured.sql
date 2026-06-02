-- Migration 0008 : Mise en avant des voitures de location (carousel homepage)
-- Exécuter dans Supabase > SQL Editor (non destructif)

ALTER TABLE cars ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_cars_featured ON cars(featured);
