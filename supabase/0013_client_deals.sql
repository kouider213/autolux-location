-- Migration 0013 : Table unifiée des opérations clients (location/vente, voiture/immo)
-- Permet à Dzaryx ET au site admin de savoir QUI a fait QUOI (locataire voiture,
-- locataire appart, acheteur bien, acheteur voiture...). Source unique de vérité.
-- Exécuter dans Supabase > SQL Editor (non destructif).

CREATE TABLE IF NOT EXISTS client_deals (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  -- Type d'opération :
  --   location_voiture | vente_voiture | location_immo | vente_immo | commande_vehicule
  deal_type    TEXT NOT NULL,
  item_table   TEXT,        -- 'cars' | 'properties' | 'vehicles_for_sale'
  item_id      TEXT,        -- id de l'élément concerné
  item_label   TEXT,        -- ex: "Clio 5 Alpine" / "Appartement Hay Badr"
  amount       NUMERIC,     -- montant (loyer total, prix de vente...)
  currency     TEXT DEFAULT 'DZD',
  status       TEXT DEFAULT 'en_cours',   -- en_cours | termine | annule
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_deals_name  ON client_deals (lower(client_name));
CREATE INDEX IF NOT EXISTS idx_client_deals_phone ON client_deals (client_phone);
CREATE INDEX IF NOT EXISTS idx_client_deals_type  ON client_deals (deal_type);

-- RLS : données clients sensibles → lecture/écriture authentifiée uniquement.
-- (Dzaryx backend utilise la service role key qui bypasse la RLS.)
ALTER TABLE client_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deals: auth all" ON client_deals;
CREATE POLICY "deals: auth all" ON client_deals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
