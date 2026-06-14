// Machine à avis : envoyée chaque jour par Vercel Cron.
// Cherche les locations TERMINÉES HIER (end_date = hier), avec email client, jamais relancées,
// et envoie une demande d'avis Google (dans la langue du client), puis marque review_request_sent_at.
// Levier n°1 du référencement local : plus d'avis Google = meilleur classement à Oran.
import { supabaseAdmin } from '../../../lib/supabase';
import { sendEmail, reviewRequestEmail } from '../../../lib/email';

export default async function handler(req, res) {
  // Sécurité : Vercel Cron envoie "Authorization: Bearer <CRON_SECRET>".
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorized' });
  }

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const ymd = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('id, client_name, client_email, client_lang, end_date, status, review_request_sent_at')
    .eq('end_date', ymd)
    .is('review_request_sent_at', null)
    .in('status', ['ACCEPTED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'accepted', 'confirmed', 'active', 'completed']);

  if (error) { console.error('[cron/review-request]', error.message); return res.status(500).json({ error: error.message }); }

  let sent = 0;
  for (const b of bookings || []) {
    if (!b.client_email || !/@/.test(b.client_email)) continue;
    const { subject, html } = reviewRequestEmail({
      client_name: b.client_name,
      booking_id: b.id,
      lang: b.client_lang || 'fr',
    });
    const r = await sendEmail(b.client_email, subject, html);
    if (r.ok) {
      await admin.from('bookings').update({ review_request_sent_at: new Date().toISOString() }).eq('id', b.id);
      sent++;
    }
  }

  return res.json({ ok: true, date: ymd, candidates: bookings?.length || 0, sent });
}
