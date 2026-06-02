-- Migration 0005 : Immobilier complet (Immoweb-style) + Véhicules à vendre (AutoScout-style)
-- Exécuter dans Supabase > SQL Editor
-- NON DESTRUCTIF : ajoute colonnes/tables sans toucher l'existant

-- ════════════════════════════════════════════════════════════════
-- 1. EXTENSION TABLE properties (immobilier)
-- ════════════════════════════════════════════════════════════════

ALTER TABLE properties ADD COLUMN IF NOT EXISTS transaction      TEXT DEFAULT 'location';  -- 'location' | 'vente'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status           TEXT DEFAULT 'disponible'; -- disponible | loue | vendu | coming_soon
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured         BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS currency         TEXT DEFAULT 'EUR';        -- 'EUR' | 'DZD'
ALTER TABLE properties ADD COLUMN IF NOT EXISTS charges_included BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS charges_amount   NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit          NUMERIC;                   -- caution
ALTER TABLE properties ADD COLUMN IF NOT EXISTS min_duration     TEXT;                      -- ex: "1 an", "longue durée"
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms         INT;                       -- chambres
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms        INT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS equipment        TEXT[];                    -- équipements
ALTER TABLE properties ADD COLUMN IF NOT EXISTS conditions       TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude         NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude        NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_properties_transaction ON properties(transaction);
CREATE INDEX IF NOT EXISTS idx_properties_status      ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured    ON properties(featured);

-- ════════════════════════════════════════════════════════════════
-- 2. TABLE vehicles_for_sale (véhicules à vendre — séparé de la location)
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vehicles_for_sale (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand         TEXT NOT NULL,                 -- marque
  model         TEXT NOT NULL,                 -- modèle
  year          INT,
  mileage       INT,                           -- kilométrage
  fuel          TEXT,                          -- essence | diesel | hybride | électrique
  transmission  TEXT,                          -- manuelle | automatique
  price         NUMERIC,
  currency      TEXT DEFAULT 'EUR',            -- EUR | DZD
  city          TEXT,
  description   TEXT,
  equipment     TEXT[],
  condition     TEXT,                          -- état général
  status        TEXT DEFAULT 'disponible',     -- disponible | vendu | reserve | coming_soon
  featured      BOOLEAN DEFAULT false,
  image_url     TEXT,                          -- photo principale
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vfs_status   ON vehicles_for_sale(status);
CREATE INDEX IF NOT EXISTS idx_vfs_featured ON vehicles_for_sale(featured);

-- Photos multiples pour véhicules à vendre
CREATE TABLE IF NOT EXISTS vehicle_sale_photos (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id  UUID REFERENCES vehicles_for_sale(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vsp_vehicle  ON vehicle_sale_photos(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vsp_position ON vehicle_sale_photos(vehicle_id, position);

-- ════════════════════════════════════════════════════════════════
-- 3. RLS (Row Level Security)
-- ════════════════════════════════════════════════════════════════

ALTER TABLE vehicles_for_sale   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_sale_photos ENABLE ROW LEVEL SECURITY;

-- Lecture publique (affichage site)
CREATE POLICY "vfs: read public"  ON vehicles_for_sale   FOR SELECT USING (true);
CREATE POLICY "vsp: read public"  ON vehicle_sale_photos FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "vfs: admin write"  ON vehicles_for_sale FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
CREATE POLICY "vsp: admin write"  ON vehicle_sale_photos FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
