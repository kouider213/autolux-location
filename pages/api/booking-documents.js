// Documents client d'une réservation (service-role, lecture seule par booking id).
// Alimente la page /suivi/[id] : paiement (acompte/reste), état des lieux avant/après
// (photos + dégâts), contrat (statut signature). Branché sur les tables réelles :
//   payments · vehicle_states · contract_signatures
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'id manquant' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(200).json({ ok: false, degraded: true });

  // 1. Réservation (pour relier par booking_id OU client_name+car_name en secours)
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_name, final_price, currency, car_id, cars(name)')
    .eq('id', id)
    .single();
  if (!booking) return res.status(404).json({ error: 'réservation introuvable' });

  const carName = booking.cars?.name ?? null;

  // 2. Paiements confirmés → acompte / total payé / reste
  const { data: pays } = await admin
    .from('payments')
    .select('amount, status, is_deposit, paid_at, method')
    .eq('booking_id', id);
  const confirmed = (pays || []).filter(p => p.status === 'confirmed');
  const totalPaid = confirmed.reduce((s, p) => s + Number(p.amount || 0), 0);
  const depositPaid = confirmed.filter(p => p.is_deposit).reduce((s, p) => s + Number(p.amount || 0), 0);
  const finalPrice = Number(booking.final_price || 0);
  const remaining = finalPrice > 0 ? Math.max(0, finalPrice - totalPaid) : null;

  // 3. État des lieux (vehicle_states) lié à la réservation (sinon client+voiture)
  let states = [];
  const byBooking = await admin
    .from('vehicle_states')
    .select('state_type, photos, damage_boxes, damages, severity, accident, ai_description, created_at')
    .eq('booking_id', id)
    .order('created_at', { ascending: true });
  states = byBooking.data || [];
  if (states.length === 0 && carName) {
    const byNames = await admin
      .from('vehicle_states')
      .select('state_type, photos, damage_boxes, damages, severity, accident, ai_description, created_at')
      .eq('client_name', booking.client_name)
      .eq('car_name', carName)
      .order('created_at', { ascending: true });
    states = byNames.data || [];
  }
  const inspections = states.map(s => ({
    type:     s.state_type,                       // 'before' | 'after'
    photos:   Array.isArray(s.photos) ? s.photos : [],
    damages:  Array.isArray(s.damages) ? s.damages : [],
    boxes:    Array.isArray(s.damage_boxes) ? s.damage_boxes : [],
    severity: s.severity || null,
    accident: !!s.accident,
    date:     s.created_at,
  }));

  // 4. Contrat / signature électronique
  const { data: sigs } = await admin
    .from('contract_signatures')
    .select('status, signature_url, signed_at, token, created_at, details')
    .eq('booking_id', id)
    .order('created_at', { ascending: false });
  // La page de signature /sign/:token est servie par le backend Dzaryx (Railway),
  // avec bascule sur le backup Render si besoin.
  const BACKEND = (process.env.IBRAHIM_BACKEND_URL || 'https://ibrahim-backend-production.up.railway.app').replace(/\/$/, '');
  const sig = (sigs && sigs[0]) || null;
  const det = sig?.details || {};
  const contract = sig ? {
    status:        sig.status,                    // 'pending' | 'signed'
    signed:        sig.status === 'signed',
    token:         sig.token || null,
    signatureUrl:  sig.signature_url || null,
    passportUrl:   det.passport_url || null,
    permitUrl:     det.permit_url || null,
    signedAt:      sig.signed_at || null,
    pdfLink:       sig.token ? `${BACKEND}/sign/${sig.token}/contrat` : null,
    signLink:      sig.status === 'signed' ? null : (sig.token ? `${BACKEND}/sign/${sig.token}` : null),
  } : null;

  return res.status(200).json({
    ok: true,
    currency: booking.currency || 'EUR',
    payment: { finalPrice, totalPaid, depositPaid, remaining },
    inspections,
    contract,
  });
}
