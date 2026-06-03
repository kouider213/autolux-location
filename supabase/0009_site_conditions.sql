-- Migration 0009 : Conditions éditables depuis l'admin (FR + AR)
-- Exécuter dans Supabase > SQL Editor (non destructif)

CREATE TABLE IF NOT EXISTS site_conditions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section     TEXT NOT NULL,            -- intro | rental | sale | immo | owner
  position    INT  DEFAULT 0,
  text_fr     TEXT,
  text_ar     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_section  ON site_conditions(section);
CREATE INDEX IF NOT EXISTS idx_conditions_position ON site_conditions(section, position);

ALTER TABLE site_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conditions: read public" ON site_conditions FOR SELECT USING (true);

CREATE POLICY "conditions: admin write" ON site_conditions FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
