// Mise à jour d'une réservation par l'admin, via la clé service (contourne la RLS).
// Whitelist stricte des champs modifiables.
import { supabaseAdmin } from '../../lib/supabase';

const ALLOWED = new Set([
  'status', 'start_date', 'end_date', 'nb_days',
  'final_price', 'paid_amount', 'payment_status', 'rented_by',
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

  const { data, error } = await admin.from('bookings').update(clean).eq('id', bookingId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, booking: data });
}
