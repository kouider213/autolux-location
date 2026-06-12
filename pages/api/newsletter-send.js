// Envoi d'une campagne newsletter à tous les abonnés actifs.
// Protégé : nécessite un token de session Supabase valide (admin connecté).
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, newsletterCampaignEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Vérifie que l'appelant est connecté (seuls les admins ont un compte)
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'non autorisé' });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sb = createClient(url, anon);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return res.status(401).json({ error: 'non autorisé' });

  const { title, body, test } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'titre + contenu requis' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // Mode test : envoie seulement à l'email de l'admin
  if (test) {
    const { subject, html } = newsletterCampaignEmail(title, body, u.user.email);
    const r = await sendEmail(u.user.email, subject, html);
    return res.json({ ok: !!r.ok, test: true });
  }

  const { data: subs, error } = await admin
    .from('newsletter_subscribers')
    .select('email').eq('status', 'active');
  if (error) return res.status(500).json({ error: error.message });

  let sent = 0;
  for (const s of subs || []) {
    const { subject, html } = newsletterCampaignEmail(title, body, s.email);
    const r = await sendEmail(s.email, subject, html);
    if (r.ok) sent++;
    await new Promise(r => setTimeout(r, 120)); // ~8/s, respecte la limite Resend
  }

  return res.json({ ok: true, total: subs?.length || 0, sent });
}
