// 13/11 : boutons du bot « Fik Conciergerie Notifs » (Kouider : « on peut le connecter à Dzaryx ? »).
// Telegram appelle cette route quand il appuie sur ✅ Accepter / ❌ Refuser (réservation) ou ✅ Publier / 🗑️ Supprimer (avis).
// Sécurité : en-tête secret posé au setWebhook (dérivé de INTERNAL_API_TOKEN) + seul SON chat Telegram est obéi.
import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabase';
import { tgCall, TG_CHAT, waLink } from '../../lib/telegramNotify';

const SITE = 'https://fikconciergerie.com';
export const hookSecret = () => crypto.createHash('sha256').update(`tg-notif|${process.env.INTERNAL_API_TOKEN || ''}`).digest('hex').slice(0, 48);
const internal = () => ({ 'Content-Type': 'application/json', 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' });
const dm = d => d ? `${String(d).slice(8, 10)}/${String(d).slice(5, 7)}` : '?';
/** Messages WhatsApp polis après un refus (langue du formulaire). 22/11 Kouider : 2 choix —
 *  « autre » = ce véhicule n'est pas dispo, on propose un autre véhicule ; « complet » = complets à ces dates, ravis pour d'autres dates.
 *  Jamais la vraie raison (durée trop courte), jamais la Belgique. */
function sorryText(b, kind) {
  const first = String(b.client_name || '').trim().split(/\s+/)[0] || '';
  const car = b.cars?.name || '';
  const en = b.client_lang === 'en', ar = b.client_lang === 'ar';
  const when = en ? ` (${car ? `${car}, ` : ''}${dm(b.start_date)} → ${dm(b.end_date)})` : ar ? ` (${car ? `${car}، ` : ''}${dm(b.start_date)} ← ${dm(b.end_date)})` : ` (${car ? `${car}, ` : ''}du ${dm(b.start_date)} au ${dm(b.end_date)})`;
  if (kind === 'complet') {
    if (en) return `Hello ${first}, thank you very much for your booking request with FIK Conciergerie${when}. Unfortunately, we are fully booked on these dates and we are truly sorry. We would be delighted to welcome you on other dates if you wish: just tell us which dates suit you. Have a nice day!`;
    if (ar) return `السلام عليكم ${first}، شكراً جزيلاً على طلب الحجز عند FIK Conciergerie${when}. للأسف كل سياراتنا محجوزة في هذه التواريخ، ونعتذر منك. يسعدنا أن نستقبلك في تواريخ أخرى إذا أردت: قل لنا فقط التواريخ التي تناسبك. يومك سعيد!`;
    return `Bonjour ${first}, merci beaucoup pour votre demande de réservation chez FIK Conciergerie${when}. Malheureusement, nous sommes complets à ces dates, nous en sommes vraiment désolés. Nous serions ravis de vous accueillir à d'autres dates si vous le souhaitez : dites-nous simplement lesquelles vous arrangent. Belle journée à vous !`;
  }
  if (en) return `Hello ${first}, thank you very much for your booking request with FIK Conciergerie${when}. Unfortunately, this vehicle is not available on these dates and we are truly sorry. We can offer you another vehicle for the same dates: would you like us to send you the available models? Have a nice day!`;
  if (ar) return `السلام عليكم ${first}، شكراً جزيلاً على طلب الحجز عند FIK Conciergerie${when}. للأسف هذه السيارة غير متوفرة في هذه التواريخ، ونعتذر منك. نقدر نقترحو عليك سيارة أخرى في نفس التواريخ: تحب نبعثولك السيارات المتوفرة؟ يومك سعيد!`;
  return `Bonjour ${first}, merci beaucoup pour votre demande de réservation chez FIK Conciergerie${when}. Malheureusement, ce véhicule n'est pas disponible à ces dates, nous en sommes vraiment désolés. Nous pouvons vous proposer un autre véhicule pour les mêmes dates : souhaitez-vous que je vous envoie les modèles disponibles ? Belle journée à vous !`;
}
/** 22/11 : WhatsApp de confirmation prêt après ✅ Accepter (acompte = 3 jours de location, déduit du total). */
function confirmText(b, price) {
  const first = String(b.client_name || '').trim().split(/\s+/)[0] || '';
  const car = b.cars?.name || 'votre véhicule';
  const days = Math.max(1, Math.round((Date.parse(b.end_date) - Date.parse(b.start_date)) / 86_400_000));
  const cur = b.currency === 'DZD' ? 'DA' : '€';
  const acompte = b.client_price_per_day ? Math.round(Number(b.client_price_per_day) * 3) : null;
  const pickup = (/📍 Prise[^\n]*/.exec(b.notes || '') || [''])[0].replace(/^📍\s*/, '');
  if (b.client_lang === 'en') return `Hello ${first}, good news: your booking is confirmed ✅\n🚗 ${car}\n📅 ${dm(b.start_date)} → ${dm(b.end_date)} (${days} days)\n💰 Total: ${price} ${cur}${pickup ? `\n📍 ${pickup.replace(/^Prise\s*:\s*/, 'Pick-up: ')}` : ''}\nTo secure the vehicle, a deposit of 3 rental days${acompte ? ` (${acompte} ${cur})` : ''} is requested, deducted from the total. We will get back to you for the contract. See you soon in Oran!`;
  if (b.client_lang === 'ar') return `السلام عليكم ${first}، خبر زين: الحجز تاعك مؤكد ✅\n🚗 ${car}\n📅 ${dm(b.start_date)} ← ${dm(b.end_date)} (${days} أيام)\n💰 المجموع: ${price} ${cur}${pickup ? `\n📍 ${pickup}` : ''}\nباش نحجزو لك السيارة نهائياً، نطلبو عربون تاع 3 أيام كراء${acompte ? ` (${acompte} ${cur})` : ''} يتنقص من المجموع. نرجعو لك من أجل العقد. نشوفوك قريب في وهران!`;
  return `Bonjour ${first}, bonne nouvelle : votre réservation est confirmée ✅\n🚗 ${car}\n📅 Du ${dm(b.start_date)} au ${dm(b.end_date)} (${days} jours)\n💰 Total : ${price} ${cur}${pickup ? `\n📍 ${pickup}` : ''}\nPour bloquer le véhicule, un acompte de 3 jours de location${acompte ? ` (${acompte} ${cur})` : ''} est demandé, déduit du total. Nous revenons vers vous pour le contrat. À très vite à Oran !`;
}
const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' });

async function done(cq, line, keepUrls = true, waUrls = null) {
  const msg = cq.message;
  let urls = keepUrls ? (msg.reply_markup?.inline_keyboard || []).map(r => r.filter(b => b.url)).filter(r => r.length) : [];
  // 22/11 : après un refus, « 💬 WhatsApp client » ouvre WhatsApp avec le message poli « véhicule indisponible » déjà écrit
  if (waUrls?.confirm) urls = urls.map(r => r.map(b => /wa\.me\//.test(b.url) ? { text: '💬 WhatsApp : confirmation prête', url: waUrls.confirm } : b));
  else if (waUrls) urls = [[{ text: '🚗 « Autre véhicule »', url: waUrls.autre }, { text: '📅 « Complet, autres dates »', url: waUrls.complet }], ...urls.map(r => r.filter(b => !/wa\.me\//.test(b.url))).filter(r => r.length)];
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
      const { data: b } = await admin.from('bookings').select('id, status, client_name, client_phone, client_lang, start_date, end_date, nb_days, final_price, client_price_per_day, currency, notes, cars(name)').eq('id', id).single();
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
      const wa = accept ? (waLink(b.client_phone) ? { confirm: `${waLink(b.client_phone)}?text=${encodeURIComponent(confirmText(b, Math.round(Number(d.finalPrice ?? b.final_price ?? 0))))}` } : null) : waLink(b.client_phone) ? { autre: `${waLink(b.client_phone)}?text=${encodeURIComponent(sorryText(b, 'autre'))}`, complet: `${waLink(b.client_phone)}?text=${encodeURIComponent(sorryText(b, 'complet'))}` } : null;
      await done(cq, accept ? `✅ ACCEPTÉE à ${hhmm()} — email au client${cal}.${wa ? ' WhatsApp de confirmation prêt : appuie 👇' : ' Pense au WhatsApp de confirmation.'}` : `❌ REFUSÉE à ${hhmm()} — email « indisponible » au client.${wa ? ' Choisis le message WhatsApp 👇 : 🚗 autre véhicule ou 📅 complet à ces dates' : ''}`, true, wa);
    } else if (kind === 'rv') {
      if (act === 'ok') { const { error } = await admin.from('reviews').update({ approved: true }).eq('id', id); if (error) throw error; }
      else { const { error } = await admin.from('reviews').delete().eq('id', id); if (error) throw error; }
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: act === 'ok' ? '✅ Avis publié' : '🗑️ Avis supprimé' });
      await done(cq, act === 'ok' ? `✅ Avis PUBLIÉ sur le site à ${hhmm()}` : `🗑️ Avis SUPPRIMÉ à ${hhmm()}`, false);
    } else if (kind === 'dz') {
      // 15/11 : choix d'une décision Dzaryx → Railway l'exécute, le résultat arrive dans la conversation Dzaryx
      const r = await fetch('https://ibrahim-backend-production.up.railway.app/api/jarvis/decisions-button', { method: 'POST', headers: internal(), body: JSON.stringify({ id: act, n: Number(id) }), signal: AbortSignal.timeout(8000) }).then(x => x.json()).catch(() => ({ error: 'Dzaryx injoignable, réponds le chiffre à Dzaryx' }));
      if (r.error) { await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: r.error, show_alert: true }); if (/Déjà choisi/.test(r.error)) await done(cq, `ℹ️ ${r.error}`, false); return res.status(200).json({ ok: true }); }
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: `✅ ${r.label}` });
      await done(cq, `👉 Choisi : ${r.label} (${hhmm()}) — Dzaryx s'en occupe, le résultat arrive dans sa conversation.`, false);
    } else {
      await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: 'Bouton inconnu' });
    }
  } catch (e) {
    await tgCall('answerCallbackQuery', { callback_query_id: cq.id, text: `Erreur : ${e.message || e}`, show_alert: true });
  }
  return res.status(200).json({ ok: true });
}
