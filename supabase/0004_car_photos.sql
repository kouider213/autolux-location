-- Migration 0004: Photos multiples pour véhicules
-- Exécuter dans Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS car_photos (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  car_id      UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_car_photos_car     ON car_photos(car_id);
CREATE INDEX IF NOT EXISTS idx_car_photos_position ON car_photos(car_id, position);

ALTER TABLE car_photos ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pour afficher les photos sur le site)
CREATE POLICY "car_photos: read public" ON car_photos FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "car_photos: admin write" ON car_photos FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
