// 15/11 : Dzaryx envoie ses choix « 1️⃣ … 2️⃣ … » avec de VRAIS boutons via ce bot (Kouider : « comme sur les notifs FIK,
// cliquer au lieu de taper 1 ou 2 »). Seul Dzaryx (jeton interne) peut l'appeler. Clic → /api/telegram-notif (dz:…).
import { requireAdmin } from '../../lib/adminAuth';
import { notifyTelegram } from '../../lib/telegramNotify';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!(await requireAdmin(req, res))) return;
  const { text, buttons } = req.body || {};
  const btns = (Array.isArray(buttons) ? buttons : []).filter(b => b && typeof b.text === 'string' && /^dz:[a-z0-9]{1,16}:[1-5]$/.test(String(b.data))).slice(0, 4);
  if (!text || !btns.length) return res.status(400).json({ ok: false, error: 'text + buttons requis' });
  const r = await notifyTelegram(esc(String(text).slice(0, 3500)), btns.map(b => [{ text: b.text.slice(0, 60), data: b.data }]));
  return res.status(r?.ok ? 200 : 502).json({ ok: !!r?.ok });
}
