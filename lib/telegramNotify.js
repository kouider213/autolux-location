// Notifications Telegram envoyées DIRECTEMENT depuis le site (Vercel) — indépendant de Railway.
// Config (Vercel env) : TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
// Sans config → ne fait rien (jamais bloquant).
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT  = process.env.TELEGRAM_CHAT_ID;

export async function notifyTelegram(text) {
  if (!TOKEN || !CHAT || !text) return { skipped: true };
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }),
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
