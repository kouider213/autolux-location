// Envoi d'une campagne newsletter à tous les abonnés actifs.
// Protégé : nécessite un token de session Supabase valide (admin connecté).
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, newsletterCampaignEmail } from '../../lib/email';
import { translateTexts, translateHtml } from '../../lib/serverTranslate';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Auth : soit token interne (app Dzaryx via backend), soit session admin Supabase.
  const internal = req.headers['x-internal-token'];
  const internalOk = !!internal && !!process.env.INTERNAL_API_TOKEN && internal === process.env.INTERNAL_API_TOKEN;
  let callerEmail = process.env.RESEND_FROM || 'admin@fikconciergerie.com';
  if (!internalOk) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'non autorisé' });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sb = createClient(url, anon);
    const { data: u } = await sb.auth.getUser(token);
    if (!u?.user) return res.status(401).json({ error: 'non autorisé' });
    callerEmail = u.user.email;
  }

  const { title, body, test, testEmail } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'titre + contenu requis' });

  // Diagnostic explicite : sans RESEND_API_KEY, aucun email ne part (skip silencieux avant).
  if (!process.env.RESEND_API_KEY) {
    return res.status(400).json({ error: "Envoi d'emails non configuré : ajoutez RESEND_API_KEY + RESEND_FROM dans les variables Vercel (domaine vérifié sur resend.com)." });
  }

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // Mode test : envoie à l'email de test fourni (ou, à défaut, l'email du compte admin)
  if (test) {
    const dest = (testEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) ? testEmail : callerEmail;
    const { subject, html } = newsletterCampaignEmail(title, body, dest);
    const r = await sendEmail(dest, subject, html);
    if (!r.ok) return res.status(502).json({ error: `Échec Resend${r.status ? ` (${r.status})` : ''} : ${r.detail || r.reason || 'inconnu'}` });
    return res.json({ ok: true, test: true, dest });
  }

  const { data: subs, error } = await admin
    .from('newsletter_subscribers')
    .select('email, lang').eq('status', 'active');
  if (error) return res.status(500).json({ error: error.message });

  // Traduit le titre + le contenu UNE fois par langue (le HTML img/boutons est préservé).
  const langs = [...new Set((subs || []).map(s => (s.lang === 'ar' ? 'ar' : s.lang === 'en' ? 'en' : 'fr')))];
  const translated = {}; // lang -> { title, body }
  for (const lg of langs) {
    if (lg === 'fr') { translated.fr = { title, body }; continue; }
    try {
      const [tTitle] = await translateTexts([title], lg);
      const tBody = await translateHtml(body, lg);
      translated[lg] = { title: tTitle || title, body: tBody || body };
    } catch { translated[lg] = { title, body }; }
  }

  let sent = 0; let lastErr = null;
  for (const s of subs || []) {
    const lg = s.lang === 'ar' ? 'ar' : s.lang === 'en' ? 'en' : 'fr';
    const t = translated[lg] || { title, body };
    const { subject, html } = newsletterCampaignEmail(t.title, t.body, s.email);
    const r = await sendEmail(s.email, subject, html);
    if (r.ok) sent++;
    else lastErr = r.detail || r.reason || `status ${r.status || '?'}`;
    await new Promise(r => setTimeout(r, 120)); // ~8/s, respecte la limite Resend
  }

  // Si rien n'est parti alors qu'il y avait des abonnés → remonte la cause (souvent : domaine Resend non vérifié)
  if ((subs?.length || 0) > 0 && sent === 0) {
    return res.status(502).json({ error: `Aucun email envoyé. Cause Resend : ${lastErr || 'inconnue'}. Vérifiez le domaine RESEND_FROM sur resend.com.` });
  }

  return res.json({ ok: true, total: subs?.length || 0, sent });
}
