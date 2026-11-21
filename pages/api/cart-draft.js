// 21/11 « panier abandonné » : le client a mis son nom + téléphone à l'étape 2 de /reservation mais n'a pas (encore) validé.
// On garde sa demande (client_leads, notes « 🛒 panier {json} ») ; Dzaryx lui propose une relance WhatsApp à Kouider
// le lendemain matin. Validée → done:true → le panier passe « conclu ». Silencieux : pas de notif Telegram ici.
import { supabaseAdmin } from '../../lib/supabase';

const TAG = '🛒 panier';
const hits = new Map();   // anti-abus simple par IP (instance chaude)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 3600_000);
  if (h.length > 30) return res.status(429).json({ error: 'trop de requêtes' });
  hits.set(ip, [...h, now]);

  const b = req.body || {};
  const phone = String(b.phone || '').trim().slice(0, 40);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return res.status(400).json({ error: 'téléphone' });
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // Panier récent du même numéro (3 jours) : on le met à jour au lieu d'en créer un autre
  const since = new Date(now - 3 * 86400_000).toISOString();
  const { data: recent } = await admin.from('client_leads').select('id, client_phone, status, notes')
    .eq('category', 'voiture_location').like('notes', `${TAG}%`).gte('created_at', since).order('created_at', { ascending: false }).limit(50);
  const mine = (recent || []).find(l => String(l.client_phone || '').replace(/\D/g, '').slice(-9) === digits.slice(-9));

  if (b.done) {
    if (mine) await admin.from('client_leads').update({ status: 'conclu', updated_at: new Date().toISOString() }).eq('id', mine.id);
    return res.json({ ok: true });
  }

  const info = {
    car_id: b.car_id || null, car: String(b.car || '').slice(0, 80) || null,
    start: /^\d{4}-\d{2}-\d{2}$/.test(b.start || '') ? b.start : null, end: /^\d{4}-\d{2}-\d{2}$/.test(b.end || '') ? b.end : null,
    age: Number(b.age) > 0 && Number(b.age) < 120 ? Number(b.age) : null,
  };
  const criteria = [info.car, info.start && info.end ? `${info.start} → ${info.end}` : null, info.age ? `âge ${info.age}` : null].filter(Boolean).join(' · ') || 'réservation commencée sur le site';
  const row = {
    client_name: String(b.name || '').trim().slice(0, 80) || 'Client du site', client_phone: phone,
    criteria: `Réservation pas terminée : ${criteria}`, notes: `${TAG} ${JSON.stringify(info)}`,
    lang: ['fr', 'en', 'ar'].includes(b.lang) ? b.lang : 'fr', updated_at: new Date().toISOString(),
  };
  if (mine?.status === 'conclu') return res.json({ ok: true, id: mine.id });   // déjà réservé : un envoi en retard ne recrée rien
  if (mine) {
    await admin.from('client_leads').update(row).eq('id', mine.id);
    return res.json({ ok: true, id: mine.id });
  }
  const ins = await admin.from('client_leads').insert({ ...row, category: 'voiture_location', currency: 'EUR', city: 'Oran', status: 'nouveau' }).select('id').single();
  if (ins.error) return res.status(500).json({ error: ins.error.message });
  return res.json({ ok: true, id: ins.data?.id });
}
