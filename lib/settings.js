import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Valeurs par défaut — utilisées tant que l'admin n'a rien changé
export const DEFAULT_SETTINGS = {
  whatsapp:      '32466311469',
  whatsapp2:     '',
  whatsapp3:     '',
  logo_url:      '',
  email:         '',
  phone:         '',
  address:       'Rue Derbouz Draoua, Houari, Oran 31300, Algérie',
  maps_url:      'https://maps.google.com/maps?q=Hay+Badr+Oran+Algerie',
  instagram:     '',
  tiktok:        '',
  facebook:      '',
  acompte_pct:   50,
  stat_clients:     '',
  stat_satisfaction: '',
  hero_title:    '',
  hero_subtitle: '',
  hero_media_url: '',
  announcement:  '',
  chatbot_enabled: true,
  // Mode "disponibilité à confirmer" : ON par défaut (safe) tant que les vraies
  // dispos voitures ne sont pas connues. Les cartes affichent "Sur demande" et
  // le bouton devient "Vérifier la disponibilité" (WhatsApp) au lieu de Réserver.
  // Passer à false (admin) quand les dispos réelles sont gérées (août).
  availability_mode: true,
};

// Fetch settings (client ou server). Retourne defaults si erreur/vide.
export async function getSettings() {
  try {
    if (!supabase) return DEFAULT_SETTINGS;
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    return { ...DEFAULT_SETTINGS, ...(data || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Hook client : lit les paramètres du site (numéro WhatsApp, contact...).
// Renvoie toujours un objet utilisable (defaults tant que la DB ne répond pas).
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => { getSettings().then(setSettings); }, []);
  return settings;
}

// Numéro WhatsApp principal nettoyé (chiffres uniquement) pour wa.me.
export function waNumber(settings) {
  const n = (settings?.whatsapp || DEFAULT_SETTINGS.whatsapp || '').replace(/\D/g, '');
  return n || DEFAULT_SETTINGS.whatsapp;
}

// Construit un lien wa.me complet à partir des settings + texte optionnel.
export function waLink(settings, text) {
  const base = `https://wa.me/${waNumber(settings)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
