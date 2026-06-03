-- Migration 0010 : Réparer RLS écriture admin (5 tables)
-- Problème : policies "FOR ALL" avec rôle limité ('kouider','houari') et,
-- sur site_settings/conditions, INSERT (upsert) refusé.
-- => "new row violates row-level security policy"
-- Solution : écriture autorisée à tout utilisateur authentifié (le login admin
-- est caché, seul le propriétaire se connecte). USING + WITH CHECK => INSERT + UPDATE OK.
-- Exécuter dans Supabase > SQL Editor (non destructif). À coller en entier.

-- 1) site_settings (Paramètres : numéro WhatsApp, contact, réseaux, hero...)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings: admin write" ON site_settings;
DROP POLICY IF EXISTS "settings: read public" ON site_settings;
CREATE POLICY "settings: read public" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "settings: auth write" ON site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2) site_conditions (Conditions éditables)
ALTER TABLE site_conditions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conditions: admin write" ON site_conditions;
DROP POLICY IF EXISTS "conditions: read public" ON site_conditions;
CREATE POLICY "conditions: read public" ON site_conditions
  FOR SELECT USING (true);
CREATE POLICY "conditions: auth write" ON site_conditions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) car_photos (photos multiples des voitures de location)
ALTER TABLE car_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "car_photos: admin write" ON car_photos;
DROP POLICY IF EXISTS "car_photos: read public" ON car_photos;
CREATE POLICY "car_photos: read public" ON car_photos
  FOR SELECT USING (true);
CREATE POLICY "car_photos: auth write" ON car_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4) vehicles_for_sale (voitures à vendre)
ALTER TABLE vehicles_for_sale ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vfs: admin write" ON vehicles_for_sale;
DROP POLICY IF EXISTS "vfs: read public" ON vehicles_for_sale;
CREATE POLICY "vfs: read public" ON vehicles_for_sale
  FOR SELECT USING (true);
CREATE POLICY "vfs: auth write" ON vehicles_for_sale
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5) vehicle_sale_photos (photos des voitures à vendre)
ALTER TABLE vehicle_sale_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vsp: admin write" ON vehicle_sale_photos;
DROP POLICY IF EXISTS "vsp: read public" ON vehicle_sale_photos;
CREATE POLICY "vsp: read public" ON vehicle_sale_photos
  FOR SELECT USING (true);
CREATE POLICY "vsp: auth write" ON vehicle_sale_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6) properties (immobilier) — policy permissive ajoutée (RLS = OR)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "properties: auth write" ON properties;
CREATE POLICY "properties: auth write" ON properties
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7) property_photos (photos immobilier)
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_photos: read public" ON property_photos;
DROP POLICY IF EXISTS "property_photos: auth write" ON property_photos;
CREATE POLICY "property_photos: read public" ON property_photos
  FOR SELECT USING (true);
CREATE POLICY "property_photos: auth write" ON property_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
