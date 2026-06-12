// Enregistre/upsert le contenu d'une page légale (clé service, contourne RLS).
import { supabaseAdmin } from '../../lib/supabase';

const SLUGS = new Set(['a-propos', 'cgv', 'mentions-legales', 'confidentialite']);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const slug = req.query.slug;
    const admin = supabaseAdmin();
    if (!admin) return res.status(500).json({ error: 'config serveur' });
    const { data } = await admin.from('legal_pages').select('*').eq('slug', slug).maybeSingle();
    return res.status(200).json({ ok: true, page: data || null });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { slug, title_fr, title_ar, title_en, body_fr, body_ar, body_en } = req.body || {};
  if (!SLUGS.has(slug)) return res.status(400).json({ error: 'slug invalide' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  const row = {
    slug,
    title_fr: title_fr || null, title_ar: title_ar || null, title_en: title_en || null,
    body_fr: body_fr || null, body_ar: body_ar || null, body_en: body_en || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from('legal_pages').upsert(row, { onConflict: 'slug' });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
