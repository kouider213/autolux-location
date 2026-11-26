// Parrainage (appelé à la réservation) : « Recommandé par » = un CODE ou le NOM d'un ancien client.
// 26/11 Kouider : le remerciement dit « il nous donne simplement votre nom » → le nom suffit. La personne citée devient
// client prioritaire (Dzaryx, priority-referral). Anti-triche : seulement pour une vraie réservation du site créée il y a
// moins de 2 h avec le même téléphone, et une seule fois par réservation.
import { supabaseAdmin } from '../../lib/supabase';

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9؀-ۿ ]/g, ' ').replace(/\s+/g, ' ').trim();
const key9 = p => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 8 ? d.slice(-9) : ''; };
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const raw = (req.body?.code || '').toString().trim().slice(0, 60);
  const bookingId = (req.body?.booking_id || '').toString();
  const phone = (req.body?.phone || '').toString();
  if (!raw) return res.status(400).json({ error: 'code requis' });
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });
  try {
    // Vraie réservation récente du même client
    if (!bookingId) return res.json({ ok: false, reason: 'réservation manquante' });
    const { data: bk } = await admin.from('bookings').select('id, client_phone, client_name, created_at').eq('id', bookingId).maybeSingle();
    if (!bk || key9(bk.client_phone) !== key9(phone) || Date.now() - Date.parse(bk.created_at) > 2 * 3600_000) return res.json({ ok: false, reason: 'réservation introuvable' });
    const tag = `bk:${bk.id}`;
    const { data: refs } = await admin.from('referrals').select('id, code, uses, note, referrer_name, referrer_phone').limit(1000);
    const R = refs || [];
    if (R.some(r => String(r.note || '').includes(tag))) return res.json({ ok: true, already: true });
    const bump = async (r) => {
      await admin.from('referrals').update({ uses: (r.uses || 0) + 1, note: `${r.note ? r.note + ' · ' : ''}${tag}` }).eq('id', r.id);
      return res.json({ ok: true, who: r.referrer_name || r.code });
    };
    // 1) un code
    const byCode = R.find(r => String(r.code).toUpperCase() === raw.toUpperCase().replace(/\s/g, ''));
    if (byCode) return bump(byCode);
    // 2) le nom d'un ancien client (nom complet, ou prénom seul s'il est unique) — jamais soi-même
    const t = norm(raw);
    if (t.length < 3) return res.json({ ok: false, reason: 'nom trop court' });
    const { data: past } = await admin.from('bookings').select('client_name, client_phone').in('status', ['COMPLETED', 'ACTIVE', 'CONFIRMED']).limit(2000);
    const seen = new Map();
    for (const b of past || []) {
      const n = norm(b.client_name); if (n.length < 3) continue;
      if (key9(b.client_phone) && key9(b.client_phone) === key9(phone)) continue;
      if (!seen.has(n)) seen.set(n, { name: String(b.client_name).trim(), phone: b.client_phone });
    }
    let hit = [...seen.entries()].filter(([n]) => n === t || (n.includes(' ') && ` ${t} `.includes(` ${n} `)) || (t.includes(' ') && n.startsWith(t + ' ')) || (t.includes(' ') && n.endsWith(' ' + t)));
    if (!hit.length && !t.includes(' ')) { const f = [...seen.entries()].filter(([n]) => n.split(' ')[0] === t); if (f.length === 1) hit = f; }
    if (hit.length !== 1) return res.json({ ok: false, reason: 'personne non trouvée' });
    const who = hit[0][1];
    const ex = R.find(r => (key9(who.phone) && key9(r.referrer_phone) === key9(who.phone)) || norm(r.referrer_name) === norm(who.name));
    if (ex) return bump(ex);
    let error;
    for (let i = 0; i < 5; i++) {
      const code = (who.name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'FIK') + Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
      ({ error } = await admin.from('referrals').insert({ code, referrer_name: who.name, referrer_phone: who.phone || null, uses: 1, note: `auto site : ${bk.client_name} · ${tag}` }));
      if (!error || !String(error.message).toLowerCase().includes('duplicate')) break;
    }
    if (error) throw new Error(error.message);
    return res.json({ ok: true, who: who.name, created: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
