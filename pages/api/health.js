// Endpoint de santé — pour le monitoring (UptimeRobot, etc.).
// Vérifie que la base Supabase répond. 200 = tout va bien, 503 = problème DB.
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const out = { ok: true, ts: new Date().toISOString(), checks: {} };
  try {
    const admin = supabaseAdmin();
    if (!admin) { out.checks.db = 'no-key'; }
    else {
      const { error } = await admin.from('site_settings').select('id').limit(1);
      out.checks.db = error ? 'down' : 'up';
      if (error) out.ok = false;
    }
  } catch (e) { out.checks.db = 'down'; out.ok = false; out.error = e.message; }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(out.ok ? 200 : 503).json(out);
}
