-- Migration 0017 : mode "disponibilité à confirmer".
-- ON par défaut côté code (safe) : tant que la colonne n'existe pas, le site
-- reste en mode "à confirmer". Cette migration permet de le COUPER depuis
-- l'admin quand les vraies dispos sont gérées (août).
-- Non destructif. Exécuter dans Supabase > SQL Editor (au moment voulu).

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS availability_mode BOOLEAN DEFAULT true;
