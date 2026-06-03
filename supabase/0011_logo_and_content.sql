-- Migration 0011 : Logo éditable + tables FAQ et Blog (contenu sans coder)
-- Exécuter dans Supabase > SQL Editor (non destructif). À coller en entier.

-- 1) Logo du site (uploadé depuis l'admin Paramètres)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2) FAQ éditable (bilingue FR/AR)
CREATE TABLE IF NOT EXISTS site_faq (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_fr TEXT,
  question_ar TEXT,
  answer_fr   TEXT,
  answer_ar   TEXT,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_faq ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faq: read public" ON site_faq;
DROP POLICY IF EXISTS "faq: auth write" ON site_faq;
CREATE POLICY "faq: read public" ON site_faq FOR SELECT USING (true);
CREATE POLICY "faq: auth write" ON site_faq FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) Blog (bilingue FR/AR, SEO)
CREATE TABLE IF NOT EXISTS blog_posts (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title_fr    TEXT,
  title_ar    TEXT,
  excerpt_fr  TEXT,
  excerpt_ar  TEXT,
  body_fr     TEXT,
  body_ar     TEXT,
  cover_url   TEXT,
  published   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blog: read public" ON blog_posts;
DROP POLICY IF EXISTS "blog: auth write" ON blog_posts;
-- Lecture publique uniquement des articles publiés ; l'admin (authentifié) voit tout
CREATE POLICY "blog: read public" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "blog: auth read all" ON blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "blog: auth write" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
