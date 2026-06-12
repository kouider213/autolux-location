-- ════════════════════════════════════════════════════════════════
-- 0019 — Pack admin complet : avis vérifiés + pages légales éditables + maintenance véhicules
-- À coller une seule fois dans Supabase > SQL Editor. Idempotent (réexécutable sans risque).
-- ════════════════════════════════════════════════════════════════

-- ── 1. AVIS VÉRIFIÉS ───────────────────────────────────────────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id UUID;

-- ── 2. PAGES LÉGALES ÉDITABLES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS legal_pages (
  slug       TEXT PRIMARY KEY,                 -- 'cgv' | 'mentions-legales' | 'confidentialite' | 'a-propos'
  title_fr   TEXT, title_ar TEXT, title_en TEXT,
  body_fr    TEXT, body_ar  TEXT, body_en  TEXT,   -- contenu (texte simple multi-lignes)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_pages_read ON legal_pages;
CREATE POLICY legal_pages_read ON legal_pages FOR SELECT USING (TRUE);  -- lecture publique
-- écriture = clé service uniquement (depuis l'admin via API serveur)

-- ── 3. MAINTENANCE VÉHICULES ───────────────────────────────────
ALTER TABLE cars ADD COLUMN IF NOT EXISTS insurance_expiry  DATE;     -- assurance
ALTER TABLE cars ADD COLUMN IF NOT EXISTS technical_expiry  DATE;     -- contrôle technique
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vignette_expiry   DATE;     -- vignette
ALTER TABLE cars ADD COLUMN IF NOT EXISTS service_due_date  DATE;     -- prochaine révision
ALTER TABLE cars ADD COLUMN IF NOT EXISTS maintenance_note  TEXT;

-- Vérification
SELECT 'reviews.verified' AS check, COUNT(*) FROM reviews
UNION ALL SELECT 'legal_pages', COUNT(*) FROM legal_pages
UNION ALL SELECT 'cars.insurance_expiry', COUNT(*) FROM cars WHERE insurance_expiry IS NOT NULL;
