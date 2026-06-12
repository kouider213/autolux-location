import { supabase } from './supabase';

// Récupère le contenu éditable d'une page légale (null si rien en base = on garde le défaut).
export async function getLegal(slug) {
  try {
    if (!supabase) return null;
    const { data } = await supabase.from('legal_pages').select('*').eq('slug', slug).maybeSingle();
    return data || null;
  } catch { return null; }
}

export const LEGAL_SLUGS = [
  { slug: 'a-propos',         label: 'Qui sommes-nous', defTitle: 'Qui sommes-nous' },
  { slug: 'cgv',              label: 'Conditions générales', defTitle: 'Conditions générales' },
  { slug: 'mentions-legales', label: 'Mentions légales', defTitle: 'Mentions légales' },
  { slug: 'confidentialite',  label: 'Confidentialité', defTitle: 'Politique de confidentialité' },
];
