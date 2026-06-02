-- Migration 0007 : Devise sur les voitures de location (DZD par défaut, EUR possible)
-- Exécuter dans Supabase > SQL Editor (non destructif)

-- Nouvelle colonne devise — DZD par défaut pour les nouvelles voitures
ALTER TABLE cars ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'DZD';

-- Les voitures existantes ont des prix en EUR → on les marque EUR
-- (sinon "55" s'afficherait "55 DA" au lieu de "55 €")
-- Modifiable ensuite voiture par voiture depuis l'admin.
UPDATE cars SET currency = 'EUR' WHERE currency IS NULL OR currency = 'DZD';
