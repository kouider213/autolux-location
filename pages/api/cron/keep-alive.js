// Garde la base Supabase ACTIVE (le plan gratuit se met en pause après ~7 jours
// sans activité → site cassé). Une requête minime quotidienne suffit à l'empêcher.
// Déclenché par le cron Vercel (vercel.json). Inoffensif si appelé manuellement.
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  let db = 'skip';
  try {
    const admin = supabaseAdmin();
    if (admin) {
      const { error } = await admin.from('site_settings').select('id').limit(1);
      db = error ? 'error' : 'ok';
    }
  } catch { db = 'error'; }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, db, pinged: new Date().toISOString() });
}
