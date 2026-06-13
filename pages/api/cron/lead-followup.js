// Relance automatique des leads par email — exécuté chaque jour par Vercel Cron.
// Cible : leads encore "nouveau"/"en_cours", avec email, créés il y a > DELAI jours, jamais relancés.
import { supabaseAdmin } from '../../../lib/supabase';
import { sendEmail, leadFollowUpEmail } from '../../../lib/email';

const DELAI_JOURS = Number(process.env.LEAD_FOLLOWUP_DAYS || 2);

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorized' });
  }

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const cutoff = new Date(Date.now() - DELAI_JOURS * 86400000).toISOString();

  const { data: leads, error } = await admin
    .from('client_leads')
    .select('id, client_name, client_email, criteria, lang, status, created_at, relance_sent_at')
    .in('status', ['nouveau', 'en_cours'])
    .not('client_email', 'is', null)
    .is('relance_sent_at', null)
    .lt('created_at', cutoff)
    .limit(200);

  if (error) { console.error('[cron/lead-followup]', error.message); return res.status(500).json({ error: error.message }); }

  let sent = 0;
  for (const l of leads || []) {
    if (!l.client_email || !/@/.test(l.client_email)) continue;
    const { subject, html } = leadFollowUpEmail({ client_name: l.client_name, subject: l.criteria, lang: l.lang });
    const r = await sendEmail(l.client_email, subject, html);
    if (r.ok) {
      await admin.from('client_leads').update({ relance_sent_at: new Date().toISOString() }).eq('id', l.id);
      sent++;
    }
    await new Promise(res => setTimeout(res, 120));
  }

  return res.json({ ok: true, candidates: leads?.length || 0, sent, delaiJours: DELAI_JOURS });
}
