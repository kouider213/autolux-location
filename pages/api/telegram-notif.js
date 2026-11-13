// 13/11 : boutons du bot « Fik Conciergerie Notifs » (Kouider : « on peut le connecter à Dzaryx ? »).
// Telegram appelle cette route quand il appuie sur ✅ Accepter / ❌ Refuser (réservation) ou ✅ Publier / 🗑️ Supprimer (avis).
// Sécurité : en-tête secret posé au setWebhook (dérivé de INTERNAL_API_TOKEN) + seul SON chat Telegram est obéi.
import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabase';
import { tgCall, TG_CHAT } from '../../lib/telegramNotify';

const SITE = 'https://fikconciergerie.com';
export const hookSecret = () => crypto.createHash('sha256').update(`tg-notif|${process.env.INTERNAL_API_TOKEN || ''}`).digest('hex').slice(0, 48);
const internal = () => ({ 'Content-Type': 'application/json', 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' });
const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' });

async function done(cq, line, keepUrls = true) {
  const msg = cq.message;
  const urls = keepUrls ? (msg.reply_markup?.inline_keyboard || []).map(r => r.filter(b => b.url)).filter(r => r.length) : [];
  await tgCall('editMessageText', { chat_id: msg.chat.id, message_id: msg.message_id, text: `${msg.text}\n\n${line}`, disable_web_page_preview: true, ...(urls.length ? { reply_markup: { inline_keyboard: urls } } : {}) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.INTERNAL_API_TOKEN || req.headers['x-telegram-bot-api-secret-token'] !== hookSecret()) return res.status(401).end();
  const cq = req.body?.callback_query;
  // Message texte écrit au bot : on rappelle que c'est Dzaryx qui gère (pas de réponse IA ici)
  if (!cq) {
    const m = req.body?.message;
    if (m && String(m.chat?.id) === String(TG_CHAT)) await tgCall('sendMessage', { chat_id: m.chat.id, text: 'Ce bot sert aux alertes du site (boutons ✅ / ❌ sous chaque demande). Pour tout le reste, écris à Dzaryx : « demandes en attente ? », « accepte <nom> », « mets l\'annonce… ».' });
    return res.status(200).json({ ok: true });
  }
  if (String(cq.message?.chat?.id) !== String(TG_CHAT)) { await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: 'Non autorisé' }); return res.status(200).json({ ok: true }); }
  const [kind, act, id] = String(cq.data || '').split(':');
  const admin = supabaseAdmin();
  try {
    if (kind === 'bk') {
      const { data: b } = await admin.from('bookings').select('id, status, client_name, client_phone, start_date, end_date, nb_days, final_price, notes, cars(name)').eq('id', id).single();
      if (!b) { await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: 'Réservation introuvable' }); return res.status(200).json({ ok: true }); }
      if (b.status !== 'PENDING') { await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: `Déjà traitée (${b.status})` }); await done(cq, `ℹ️ Déjà traitée : ${b.status}`); return res.status(200).json({ ok: true }); }
      const accept = act === 'acc';
      const r = await fetch(`${SITE}/api/update-booking-status`, { method: 'POST', headers: internal(), body: JSON.stringify({ bookingId: id, status: accept ? 'ACCEPTED' : 'REJECTED' }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: `Erreur : ${d.error || r.status}`, show_alert: true }); return res.status(200).json({ ok: true }); }
      let cal = '';
      if (accept) {
        const c = await fetch(`${SITE}/api/calendar-event`, { method: 'POST', headers: internal(), body: JSON.stringify({ clientName: b.client_name, clientPhone: b.client_phone || '', carName: b.cars?.name || '—', startDate: b.start_date, endDate: b.end_date, nbDays: b.nb_days || 1, finalPrice: b.final_price, notes: b.notes || '' }) }).then(x => x.json()).catch(() => ({}));
        cal = c?.success ? ' · agenda ✅' : ' · ⚠️ agenda pas créé';
      }
      // Dzaryx est prévenu (il connaît le nouveau statut pour la suite : WhatsApp de confirmation, bouclier…)
      fetch(`${SITE}/api/notify-dzaryx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'booking_status', data: { id, status: accept ? 'CONFIRMED' : 'REJECTED', car_name: b.cars?.name, client_name: b.client_name, via: 'bouton Telegram' } }) }).catch(() => {});
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: accept ? '✅ Acceptée' : '❌ Refusée' });
      await done(cq, accept ? `✅ ACCEPTÉE à ${hhmm()} — email au client${cal}. Pense au WhatsApp de confirmation 👇` : `❌ REFUSÉE à ${hhmm()} — email « indisponible » au client.`);
    } else if (kind === 'rv') {
      if (act === 'ok') { const { error } = await admin.from('reviews').update({ approved: true }).eq('id', id); if (error) throw error; }
      else { const { error } = await admin.from('reviews').delete().eq('id', id); if (error) throw error; }
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: act === 'ok' ? '✅ Avis publié' : '🗑️ Avis supprimé' });
      await done(cq, act === 'ok' ? `✅ Avis PUBLIÉ sur le site à ${hhmm()}` : `🗑️ Avis SUPPRIMÉ à ${hhmm()}`, false);
    } else {
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: 'Bouton inconnu' });
    }
  } catch (e) {
    await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: `Erreur : ${e.message || e}`, show_alert: true });
  }
  return res.status(200).json({ ok: true });
}
