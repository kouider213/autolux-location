-- Contenu éditable du site (textes/photos par page) géré depuis Admin → Contenu.
-- À coller dans Supabase → SQL Editor → Run.
alter table site_settings add column if not exists content jsonb default '{}'::jsonb;
