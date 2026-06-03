-- Migration 0012 : Activer/désactiver le chatbot depuis l'admin
-- Exécuter dans Supabase > SQL Editor (non destructif).

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS chatbot_enabled BOOLEAN DEFAULT true;
