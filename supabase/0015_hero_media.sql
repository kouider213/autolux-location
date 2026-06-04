-- Migration 0015 : média du hero (photo OU vidéo) éditable depuis l'admin.
-- La page d'accueil affiche settings.hero_media_url si défini (image ou vidéo),
-- sinon retombe sur la photo de la voiture mise en avant (comportement actuel).
-- Non destructif. Exécuter dans Supabase > SQL Editor.

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_media_url TEXT;
