// Envoie l'email "demande de réservation reçue" (le formulaire insère la résa côté client,
// donc l'email n'était pas envoyé). Best-effort, non bloquant.
import { sendEmail, bookingReceivedEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { client_email, client_name, car_name, start_date, end_date, total, currency, booking_id, lang } = req.body || {};
  if (!client_email || !/@/.test(client_email)) return res.status(200).json({ skipped: true });

  const { subject, html } = bookingReceivedEmail({ client_name, car_name, start_date, end_date, total, currency, booking_id, lang });
  const r = await sendEmail(client_email, subject, html);
  return res.status(200).json({ ok: !!r.ok });
}
