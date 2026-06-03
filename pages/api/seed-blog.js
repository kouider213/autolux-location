import { supabaseAdmin } from '../../lib/supabase';
import { posts } from '../../lib/blogSeedData';

// Route TEMPORAIRE de seed du blog. Protégée par token. À supprimer après usage.
export default async function handler(req, res) {
  if (req.query.token !== 'fik-seed-2026-x9') return res.status(403).json({ error: 'forbidden' });
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'service key missing' });

  const rows = posts.map(p => ({ ...p, cover_url: '', published: true, updated_at: new Date().toISOString() }));
  const { data, error } = await admin.from('blog_posts').upsert(rows, { onConflict: 'slug' }).select('slug');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ ok: true, inserted: data.map(d => d.slug) });
}
