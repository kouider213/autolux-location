import { supabase } from './supabase';

// Valeurs par défaut — utilisées tant que l'admin n'a rien changé
export const DEFAULT_SETTINGS = {
  whatsapp:      '32466311469',
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
