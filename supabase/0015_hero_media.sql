-- Migration 0015 : média du hero (photo OU vidéo) + upload vidéo.
-- Non destructif. Exécuter dans Supabase > SQL Editor.

-- 1) Colonne hero (photo/vidéo de fond de l'accueil). Vide = photo auto.
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_media_url TEXT;

-- 2) Bucket 'videos' (vidéos des annonces + hero). public en lecture.
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3) Policies storage : lecture publique + écriture pour utilisateurs connectés
--    (l'admin du site écrit via une session Supabase authentifiée, comme pour
--     les autres tables). Si l'upload échoue encore, remplace 'authenticated'
--     par 'public' dans la policy d'insertion ci-dessous.
DROP POLICY IF EXISTS "videos public read"   ON storage.objects;
DROP POLICY IF EXISTS "videos auth insert"    ON storage.objects;
DROP POLICY IF EXISTS "videos auth update"    ON storage.objects;
DROP POLICY IF EXISTS "videos auth delete"    ON storage.objects;

CREATE POLICY "videos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "videos auth insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');

CREATE POLICY "videos auth update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'videos');

CREATE POLICY "videos auth delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'videos');
