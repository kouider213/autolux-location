// Envoie l'email "demande de réservation reçue" (le formulaire insère la résa côté client,
// donc l'email n'était pas envoyé). Best-effort, non bloquant.
import { sendEmail, bookingReceivedEmail } from '../../lib/email';
import { notifyTelegram, buildNotif } from '../../lib/telegramNotify';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { client_email, client_name, client_phone, car_name, start_date, end_date, total, currency, booking_id, lang } = req.body || {};

  // Notif Telegram à Kouider (toujours, même sans email client)
  notifyTelegram(buildNotif({
    icon: '🚗', type: 'Nouvelle RÉSERVATION',
    name: client_name, phone: client_phone, email: client_email, lang,
    lines: [car_name ? `🚘 ${car_name}` : '', (start_date || end_date) ? `📅 ${start_date || '?'} → ${end_date || '?'}` : '', total ? `💰 ${total} ${currency === 'DZD' ? 'DA' : '€'}` : ''],
    adminPath: '/admin/bookings',
  })).catch(() => {});

  // Email "demande reçue" au client (si email fourni)
  if (client_email && /@/.test(client_email)) {
    const { subject, html } = bookingReceivedEmail({ client_name, car_name, start_date, end_date, total, currency, booking_id, lang });
    const r = await sendEmail(client_email, subject, html);
    return res.status(200).json({ ok: !!r.ok });
  }
  return res.status(200).json({ ok: true, emailSkipped: true });
}
