// Rappel J-1 : envoyé chaque jour par Vercel Cron.
// Cherche les réservations confirmées qui démarrent DEMAIN et envoie un email,
// puis marque reminder_sent_at pour ne pas renvoyer.
import { supabaseAdmin } from '../../../lib/supabase';
import { sendEmail, bookingReminderEmail, reviewRequestEmail } from '../../../lib/email';

export default async function handler(req, res) {
  // Sécurité : Vercel Cron envoie "Authorization: Bearer <CRON_SECRET>".
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorized' });
  }

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ymd = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('id, client_name, client_email, start_date, end_date, status, reminder_sent_at, cars(name)')
    .eq('start_date', ymd)
    .is('reminder_sent_at', null)
    .in('status', ['ACCEPTED', 'CONFIRMED', 'confirmed', 'accepted']);

  if (error) { console.error('[cron/reminders]', error.message); return res.status(500).json({ error: error.message }); }

  let sent = 0;
  for (const b of bookings || []) {
    if (!b.client_email) continue;
    const { subject, html } = bookingReminderEmail({
      client_name: b.client_name,
      car_name: b.cars?.name,
      start_date: b.start_date,
      end_date: b.end_date,
      booking_id: b.id,
    });
    const r = await sendEmail(b.client_email, subject, html);
    if (r.ok) {
      await admin.from('bookings').update({ reminder_sent_at: new Date().toISOString() }).eq('id', b.id);
      sent++;
    }
  }

  // --- Machine à avis Google : locations terminées HIER → demande d'avis (1×) ---
  // Fusionnée ici pour rester sous la limite de 2 crons du plan Vercel Hobby.
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const ymdY = yest.toISOString().slice(0, 10);

  let reviewSent = 0;
  try {
    const { data: ended } = await admin
      .from('bookings')
      .select('id, client_name, client_email, client_lang, end_date, status, review_request_sent_at')
      .eq('end_date', ymdY)
      .is('review_request_sent_at', null)
      .in('status', ['ACCEPTED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'accepted', 'confirmed', 'active', 'completed']);

    for (const b of ended || []) {
      if (!b.client_email || !/@/.test(b.client_email)) continue;
      const { subject, html } = reviewRequestEmail({ client_name: b.client_name, booking_id: b.id, lang: b.client_lang || 'fr' });
      const r = await sendEmail(b.client_email, subject, html);
      if (r.ok) {
        await admin.from('bookings').update({ review_request_sent_at: new Date().toISOString() }).eq('id', b.id);
        reviewSent++;
      }
    }
  } catch (e) { console.error('[cron/reminders review]', e.message); }

  return res.json({ ok: true, date: ymd, candidates: bookings?.length || 0, sent, reviewSent });
}
