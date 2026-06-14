// Incrémente le compteur d'utilisation d'un code parrainage (appelé à la réservation).
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const code = (req.body?.code || '').toString().trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code requis' });
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });
  try {
    const { data } = await admin.from('referrals').select('id, uses').ilike('code', code).maybeSingle();
    if (!data) return res.json({ ok: false, reason: 'code inconnu' });
    await admin.from('referrals').update({ uses: (data.uses || 0) + 1 }).eq('id', data.id);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
