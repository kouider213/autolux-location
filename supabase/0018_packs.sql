-- Migration 0018 : Packs (combos voiture + immobilier + jet ski + chauffeur)
-- Exécuter dans Supabase > SQL Editor. NON DESTRUCTIF (IF NOT EXISTS).

-- ════════════════════════════════════════════════════════════════
-- TABLE packs
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS packs (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,                 -- nom du pack
  tier          TEXT DEFAULT 'entree',         -- entree | medium | premium | entreprise
  tagline       TEXT,                          -- accroche courte
  description   TEXT,
  price         NUMERIC,                       -- NULL = "Sur devis"
  price_type    TEXT DEFAULT 'sejour',         -- jour | semaine | sejour | sur_devis
  currency      TEXT DEFAULT 'DZD',            -- DZD | EUR
  duration      TEXT,                          -- ex: "7 jours", "week-end"
  -- Inventaire RÉEL lié (le pack bloque ce véhicule + ce bien quand loué).
  -- NULL possible (ex: pack entreprise = voiture avec chauffeur, pas dans le parc).
  car_id        UUID REFERENCES cars(id)       ON DELETE SET NULL,
  property_id   UUID REFERENCES properties(id) ON DELETE SET NULL,
  -- Composants inclus (pour icônes / badges d'affichage)
  inc_car       BOOLEAN DEFAULT false,
  inc_apartment BOOLEAN DEFAULT false,
  inc_villa     BOOLEAN DEFAULT false,
  inc_jetski    BOOLEAN DEFAULT false,
  inc_driver    BOOLEAN DEFAULT false,
  features      TEXT[],                        -- liste à puces (détails inclus)
  status        TEXT DEFAULT 'disponible',     -- disponible | indisponible | coming_soon
  featured      BOOLEAN DEFAULT false,
  image_url     TEXT,                          -- photo principale
  position      INT DEFAULT 0,                 -- ordre d'affichage
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packs_status   ON packs(status);
CREATE INDEX IF NOT EXISTS idx_packs_tier      ON packs(tier);
CREATE INDEX IF NOT EXISTS idx_packs_featured  ON packs(featured);
CREATE INDEX IF NOT EXISTS idx_packs_car       ON packs(car_id);
CREATE INDEX IF NOT EXISTS idx_packs_property  ON packs(property_id);

-- Photos multiples
CREATE TABLE IF NOT EXISTS pack_photos (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pack_id    UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
  url        TEXT NOT NULL,
  position   INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pack_photos_pack     ON pack_photos(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_photos_position ON pack_photos(pack_id, position);

-- ════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════
ALTER TABLE packs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packs: read public"  ON packs        FOR SELECT USING (true);
CREATE POLICY "ppho: read public"   ON pack_photos  FOR SELECT USING (true);

CREATE POLICY "packs: admin write"  ON packs FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));
CREATE POLICY "ppho: admin write"   ON pack_photos FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('kouider', 'houari')));

-- ════════════════════════════════════════════════════════════════
-- Données d'exemple (les 4 packs demandés) — modifiables depuis l'admin
-- ════════════════════════════════════════════════════════════════
INSERT INTO packs (title, tier, tagline, description, price, price_type, currency, duration, inc_car, inc_apartment, inc_villa, inc_jetski, inc_driver, features, featured, position) VALUES
  ('Pack Évasion', 'entree',
   'Voiture + Appartement — l''essentiel pour découvrir Oran',
   'Le combo parfait pour un séjour malin : une voiture de location + un appartement confortable bien situé. Idéal couples et petites familles.',
   NULL, 'sejour', 'DZD', '7 jours',
   true, true, false, false, false,
   ARRAY['Voiture de location (catégorie citadine/berline)','Appartement équipé bien situé','Assurance + kilométrage inclus','Livraison aéroport possible'],
   false, 1),

  ('Pack Prestige', 'medium',
   'Voiture + Villa — le confort en plus',
   'Montez en gamme : une belle voiture + une villa avec espace et intimité. Pour ceux qui veulent plus de confort pendant leur séjour.',
   NULL, 'sejour', 'DZD', '7 jours',
   true, false, true, false, false,
   ARRAY['Voiture de location (catégorie supérieure)','Villa privée avec jardin','Assurance + kilométrage illimité','Livraison aéroport offerte'],
   true, 2),

  ('Pack Privilège', 'premium',
   'Voiture + Villa + Jet Ski — l''expérience complète',
   'Le grand jeu : voiture, villa premium et jet ski pour des journées mer inoubliables. Le séjour d''exception à Oran.',
   NULL, 'sejour', 'DZD', 'week-end / semaine',
   true, false, true, true, false,
   ARRAY['Voiture premium','Villa haut de gamme','Jet ski (sessions incluses)','Assurance complète','Conciergerie dédiée'],
   true, 3),

  ('Pack Groupe & Entreprise', 'entreprise',
   'Villa + Voiture avec chauffeur — pour groupes et sociétés',
   'Pensé pour les groupes de voyage et les entreprises : villa spacieuse + voiture avec chauffeur à disposition. Devis sur mesure selon vos besoins.',
   NULL, 'sur_devis', 'DZD', 'sur mesure',
   true, false, true, false, true,
   ARRAY['Villa grande capacité','Voiture avec chauffeur professionnel','Transferts aéroport / réunions','Organisation sur mesure','Facturation entreprise'],
   false, 4)
ON CONFLICT DO NOTHING;
