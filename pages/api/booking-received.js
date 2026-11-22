// Envoie l'email "demande de réservation reçue" (le formulaire insère la résa côté client,
// donc l'email n'était pas envoyé). Best-effort, non bloquant.
import { sendEmail, bookingReceivedEmail } from '../../lib/email';
import { notifyTelegram, buildNotif, waLink, tgCall, TG_CHAT } from '../../lib/telegramNotify';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { client_email, client_name, client_phone, car_name, start_date, end_date, total, currency, booking_id, lang, extras, id_path, birth } = req.body || {};

  // Notif Telegram à Kouider (toujours, même sans email client)
  await notifyTelegram(buildNotif({
    icon: '🚗', type: 'Nouvelle RÉSERVATION',
    name: client_name, phone: client_phone, email: client_email, lang,
    lines: [car_name ? `🚘 ${car_name}` : '', (start_date || end_date) ? `📅 ${start_date || '?'} → ${end_date || '?'}` : '', total ? `💰 ${total} ${currency === 'DZD' ? 'DA' : '€'}` : '', ...(Array.isArray(extras) ? extras.map(String).slice(0, 10) : []), client_name ? `👉 Dis à Dzaryx : « accepte ${String(client_name).trim()} » (prix total possible) ou « refuse ${String(client_name).trim()} »` : ''],
    adminPath: booking_id ? `/admin/bookings?id=${encodeURIComponent(booking_id)}` : '/admin/bookings',
  }), booking_id ? [
    [{ text: '✅ Accepter', data: `bk:acc:${booking_id}` }, { text: '❌ Refuser', data: `bk:rej:${booking_id}` }],
    [waLink(client_phone) ? { text: '💬 WhatsApp client', url: waLink(client_phone) } : null, { text: '📋 Ouvrir', url: `https://fikconciergerie.com/admin/bookings?id=${encodeURIComponent(booking_id)}` }],
  ] : undefined).catch(() => {});

  // 22/11 : preuve de l'âge → photo de la pièce d'identité envoyée juste sous la demande (lien privé 1 h, bucket client-ids)
  if (id_path && /^[\w-]+\/[\w-]+\.(jpg|png|webp)$/.test(String(id_path))) {
    try {
      const admin = supabaseAdmin();
      const { data } = admin ? await admin.storage.from('client-ids').createSignedUrl(String(id_path), 3600) : { data: null };
      if (data?.signedUrl) await tgCall('sendPhoto', { chat_id: TG_CHAT, photo: data.signedUrl, caption: `🪪 Pièce d'identité de ${String(client_name || '?').trim()}${birth ? ` — né(e) le ${birth} d'après le formulaire` : ''}. Vérifie que la date de naissance correspond.` });
    } catch { /* non bloquant */ }
  }

  // Email "demande reçue" au client (si email fourni)
  if (client_email && /@/.test(client_email)) {
    const { subject, html } = bookingReceivedEmail({ client_name, car_name, start_date, end_date, total, currency, booking_id, lang });
    const r = await sendEmail(client_email, subject, html);
    return res.status(200).json({ ok: !!r.ok });
  }
  return res.status(200).json({ ok: true, emailSkipped: true });
}
