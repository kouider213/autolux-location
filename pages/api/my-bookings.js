// Espace client léger : retrouve les réservations par téléphone, email OU numéro de réservation.
// Pas de compte/mot de passe. Clé service.
import { supabaseAdmin } from '../../lib/supabase';

const digits = (s) => String(s || '').replace(/\D/g, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const q = String(req.body?.query || req.body?.phone || '').trim();
  if (q.length < 4) return res.status(400).json({ error: 'recherche trop courte' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  const { data, error } = await admin
    .from('bookings')
    .select('id, client_name, client_phone, client_email, start_date, end_date, status, final_price, paid_amount, currency, cars(name, image_url)')
    .order('start_date', { ascending: false })
    .limit(800);
  if (error) return res.status(500).json({ error: error.message });

  const isEmail = q.includes('@');
  const qDigits = digits(q);
  const qRef = q.toLowerCase().replace(/[^a-f0-9]/g, ''); // numéro de réservation = début de l'id

  const mine = (data || []).filter(b => {
    if (isEmail) return (b.client_email || '').toLowerCase() === q.toLowerCase();
    if (qDigits.length >= 6) return digits(b.client_phone).slice(-8) === qDigits.slice(-8);
    // sinon : numéro de réservation (8 premiers caractères de l'id)
    return qRef.length >= 4 && String(b.id).toLowerCase().replace(/-/g, '').startsWith(qRef);
  });

  return res.status(200).json({
    ok: true,
    bookings: mine.map(b => ({
      id: b.id, ref: String(b.id).slice(0, 8).toUpperCase(), client_name: b.client_name,
      car: b.cars?.name || '—', image: b.cars?.image_url || null,
      start: b.start_date, end: b.end_date, status: b.status,
      total: b.final_price, paid: b.paid_amount, currency: b.currency || 'EUR',
    })),
  });
}
