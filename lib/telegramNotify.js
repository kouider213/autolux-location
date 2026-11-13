// Notifications Telegram envoyées DIRECTEMENT depuis le site (Vercel) — indépendant de Railway.
// Config (Vercel env) : TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
// Sans config → ne fait rien (jamais bloquant).
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT  = process.env.TELEGRAM_CHAT_ID;

// 13/11 : boutons sous la notif (✅ Accepter / ❌ Refuser, 💬 WhatsApp…) → /api/telegram-notif les exécute
// buttons = [[{ text, data }|{ text, url }], …]
export async function notifyTelegram(text, buttons) {
  if (!TOKEN || !CHAT || !text) return { skipped: true };
  try {
    const kb = Array.isArray(buttons) && buttons.length ? { inline_keyboard: buttons.map(row => row.filter(Boolean).map(b => b.url ? { text: b.text, url: b.url } : { text: b.text, callback_data: b.data })) .filter(r => r.length) } : undefined;
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(kb ? { reply_markup: kb } : {}) }),
    });
    if (!r.ok) { console.error('[telegram]', r.status, await r.text().catch(() => '')); return { error: true }; }
    return { ok: true };
  } catch (e) { console.error('[telegram]', e.message); return { error: true }; }
}

const LANGF = { fr: '🇫🇷 Français', ar: '🇩🇿 العربية', en: '🇬🇧 English' };
const SITE = 'https://fikconciergerie.com';

// Met en forme une notif "nouveau" pour Kouider (HTML Telegram).
export function buildNotif({ icon, type, name, phone, email, lang, lines = [], adminPath }) {
  const out = [`${icon || '🔔'} <b>${type}</b>`];
  if (name) out.push(`👤 ${escapeHtml(name)}`);
  if (phone) out.push(`📞 ${escapeHtml(phone)}`);
  if (email) out.push(`✉️ ${escapeHtml(email)}`);
  lines.forEach(l => l && out.push(escapeHtml(l)));
  if (lang) out.push(`🌍 ${LANGF[lang] || lang}`);
  if (adminPath) out.push(`→ ${SITE}${adminPath}`);
  return out.join('\n');
}

function escapeHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Lien WhatsApp vers un numéro (0664… algérien → 213664…, 0033… → 33…)
export function waLink(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.length === 10 && d.startsWith('0') && /^0[567]/.test(d)) d = '213' + d.slice(1);
  else if (d.length === 10 && d.startsWith('0')) d = '33' + d.slice(1);
  return `https://wa.me/${d}`;
}
export function tgCall(method, body) {
  if (!TOKEN) return Promise.resolve(null);
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).catch(() => null);
}
export const TG_CHAT = CHAT;
