-- Migration 0006 : Paramètres du site éditables depuis l'admin
-- Exécuter dans Supabase > SQL Editor (non destructif)

CREATE TABLE IF NOT EXISTS site_settings (
  id            INT PRIMARY KEY DEFAULT 1,
  whatsapp      TEXT DEFAULT '32466311469',
  email         TEXT,
  phone         TEXT,
  address       TEXT DEFAULT 'Hay Badr, Oran, Algérie',
  maps_url      TEXT DEFAULT 'https://maps.google.com/maps?q=Oran+Algerie',
  instagram     TEXT,
  tiktok        TEXT,
  facebook      TEXT,
  acompte_pct   INT DEFAULT 50,
  hero_title    TEXT,
  hero_subtitle TEXT,
  announcement  TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Ligne unique par défaut
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique (footer, contact lisent les réseaux/contact)
CREATE POLICY "settings: read public" ON site_settings FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "settings: admin write" ON site_settings FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
