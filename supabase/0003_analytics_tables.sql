-- Migration 0003: Analytics tables (page_views + car_views)
-- Exécuter dans Supabase > SQL Editor

-- TABLE: page_views
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page       TEXT NOT NULL,
  referrer   TEXT,
  device     TEXT DEFAULT 'unknown',
  country    TEXT,
  city       TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page    ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);

-- TABLE: car_views
CREATE TABLE IF NOT EXISTS car_views (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  car_id     UUID REFERENCES cars(id) ON DELETE SET NULL,
  device     TEXT DEFAULT 'unknown',
  country    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_car_views_created ON car_views(created_at);
CREATE INDEX IF NOT EXISTS idx_car_views_car     ON car_views(car_id);

-- RLS: analytics en lecture seule pour admins
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_views  ENABLE ROW LEVEL SECURITY;

-- Insertion publique (tracking côté client)
CREATE POLICY "page_views: insert public"  ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "car_views: insert public"   ON car_views  FOR INSERT WITH CHECK (true);

-- Lecture admin uniquement
CREATE POLICY "page_views: read admins" ON page_views FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
CREATE POLICY "car_views: read admins"  ON car_views  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
