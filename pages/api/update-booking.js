// Mise à jour d'une réservation par l'admin, via la clé service (contourne la RLS).
// Whitelist stricte des champs modifiables.
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, bookingStatusEmail } from '../../lib/email';

const ALLOWED = new Set([
  'status', 'start_date', 'end_date', 'nb_days',
  'final_price', 'paid_amount', 'payment_status', 'rented_by', 'client_email',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { bookingId, patch } = req.body || {};
  if (!bookingId || !patch || typeof patch !== 'object') {
    return res.status(400).json({ error: 'bookingId + patch requis' });
  }

  const clean = {};
  for (const [k, v] of Object.entries(patch)) {
    if (ALLOWED.has(k)) clean[k] = v;
  }
  if (Object.keys(clean).length === 0) return res.status(400).json({ error: 'aucun champ valide' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // État avant (pour détecter le changement de statut)
  const { data: before } = await admin.from('bookings').select('status').eq('id', bookingId).single();

  const { data, error } = await admin.from('bookings').update(clean).eq('id', bookingId).select('*, cars(name, currency)').single();
  if (error) return res.status(500).json({ error: error.message });

  // Email auto au client si le statut a changé (et email fourni)
  let emailed = false;
  if (clean.status && before && clean.status !== before.status && data.client_email && /@/.test(data.client_email)) {
    try {
      const { subject, html } = bookingStatusEmail({
        client_name: data.client_name, car_name: data.cars?.name, status: data.status,
        start_date: data.start_date, end_date: data.end_date, total: data.final_price,
        currency: data.cars?.currency, booking_id: data.id,
      });
      const r = await sendEmail(data.client_email, subject, html);
      emailed = !!r.ok;
    } catch (e) { console.error('[booking status email]', e.message); }
  }

  return res.status(200).json({ ok: true, booking: data, emailed });
}
