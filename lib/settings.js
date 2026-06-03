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
  address:       'Hay Badr, Oran, Algérie',
  maps_url:      'https://maps.google.com/maps?q=Hay+Badr+Oran+Algerie',
  instagram:     '',
  tiktok:        '',
  facebook:      '',
  acompte_pct:   50,
  hero_title:    '',
  hero_subtitle: '',
  announcement:  '',
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
