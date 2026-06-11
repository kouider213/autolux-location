// Génère (ou réutilise) le lien de contrat à signer pour une réservation.
// Crée une ligne contract_signatures (token unique) liée au booking → renvoie l'URL
// de la page de signature servie par le backend Dzaryx (/sign/:token).
import { supabaseAdmin } from '../../lib/supabase';
import { randomBytes } from 'crypto';

const BACKEND = (process.env.IBRAHIM_BACKEND_URL || 'https://ibrahim-backend-production.up.railway.app').replace(/\/$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { bookingId } = req.body || {};
  if (!bookingId) return res.status(400).json({ error: 'bookingId manquant' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // Réservation
  const { data: b, error } = await admin
    .from('bookings')
    .select('id, client_name, start_date, end_date, final_price, currency, cars(name)')
    .eq('id', bookingId).single();
  if (error || !b) return res.status(404).json({ error: 'réservation introuvable' });

  // Réutilise un contrat non signé existant
  const { data: existing } = await admin
    .from('contract_signatures')
    .select('token, status')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1);

  let token;
  if (existing && existing[0] && existing[0].status !== 'signed') {
    token = existing[0].token;
  } else {
    token = randomBytes(8).toString('hex');
    const { error: insErr } = await admin.from('contract_signatures').insert({
      token,
      booking_id: bookingId,
      client_name: b.client_name,
      status: 'pending',
      details: {
        car: b.cars?.name || null,
        start: b.start_date,
        end: b.end_date,
        price: b.final_price,
        currency: b.currency || 'EUR',
      },
    });
    if (insErr) return res.status(500).json({ error: insErr.message });
  }

  return res.status(200).json({
    ok: true,
    token,
    url: `${BACKEND}/sign/${token}`,
    already_signed: existing?.[0]?.status === 'signed',
  });
}
