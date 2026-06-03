import { supabase } from './supabase';

// Récupère tous les articles publiés (liste). Vide si erreur/aucun.
export async function getPublishedPosts() {
  try {
    if (!supabase) return [];
    const { data } = await supabase.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

// Récupère un article par slug (publié uniquement, côté public).
export async function getPostBySlug(slug) {
  try {
    if (!supabase) return null;
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single();
    return data || null;
  } catch {
    return null;
  }
}

// Helpers d'affichage bilingue
export const pickTitle   = (p, lang) => (lang === 'ar' ? (p.title_ar   || p.title_fr)   : (p.title_fr   || p.title_ar))   || '';
export const pickExcerpt = (p, lang) => (lang === 'ar' ? (p.excerpt_ar || p.excerpt_fr) : (p.excerpt_fr || p.excerpt_ar)) || '';
export const pickBody    = (p, lang) => (lang === 'ar' ? (p.body_ar    || p.body_fr)    : (p.body_fr    || p.body_ar))    || '';

// Slugify simple (titre -> slug url)
export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || ('article-' + Date.now());
}
