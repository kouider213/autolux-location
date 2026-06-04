-- Migration 0016 : leads / demandes clients (suivi des recherches).
-- Un client qui CHERCHE un bien/voiture (pas encore une vente/location) =
-- un lead à suivre. Dzaryx l'enregistre, le matche au stock, le relance.
-- Non destructif. Exécuter dans Supabase > SQL Editor.

CREATE TABLE IF NOT EXISTS client_leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  category     TEXT NOT NULL DEFAULT 'immo_location',  -- immo_location | immo_vente | voiture_location | voiture_vente
  criteria     TEXT,                                    -- "F4 Bir El Djir, 2 chambres, balcon"
  budget_max   NUMERIC,
  currency     TEXT DEFAULT 'DZD',
  city         TEXT,
  status       TEXT NOT NULL DEFAULT 'nouveau',         -- nouveau | en_cours | conclu | perdu
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_leads_status  ON client_leads(status);
CREATE INDEX IF NOT EXISTS idx_client_leads_created ON client_leads(created_at DESC);

ALTER TABLE client_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads read"  ON client_leads;
DROP POLICY IF EXISTS "leads write" ON client_leads;
CREATE POLICY "leads read"  ON client_leads FOR SELECT USING (true);
CREATE POLICY "leads write" ON client_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
