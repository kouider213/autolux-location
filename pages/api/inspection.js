// État des lieux (entrée/sortie) d'un véhicule, lié à la réservation du client.
// GET  ?bookingId=...  → liste les états des lieux (avant/après) de la réservation
// POST { bookingId, stateType, photos[], markers[], notes, accident } → enregistre
// Stocké dans vehicle_states (mêmes colonnes que l'app Dzaryx) → visible aussi sur /suivi.
import { supabaseAdmin } from '../../lib/supabase';

const SEV_RANK = { aucun: 0, leger: 1, moyen: 2, grave: 3 };

export default async function handler(req, res) {
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // ── Liste ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const { bookingId } = req.query;
    if (!bookingId) return res.status(400).json({ error: 'bookingId manquant' });
    const { data, error } = await admin
      .from('vehicle_states')
      .select('id, state_type, photos, damage_boxes, damages, severity, accident, notes, created_at')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, inspections: data || [] });
  }

  // ── Enregistrement ─────────────────────────────────────
  if (req.method === 'POST') {
    const { bookingId, stateType, photos = [], markers = [], notes = '', accident = false } = req.body || {};
    if (!bookingId || !['before', 'after'].includes(stateType)) {
      return res.status(400).json({ error: 'paramètres invalides' });
    }

    // Récup réservation (client + voiture) pour relier proprement
    const { data: b } = await admin
      .from('bookings')
      .select('client_name, rented_by, cars(name)')
      .eq('id', bookingId).single();
    if (!b) return res.status(404).json({ error: 'réservation introuvable' });

    // markers = [{ photo_index, x, y, severity, label }] (x,y = centre normalisé 0..1)
    const damage_boxes = markers.map(m => ({
      label:       m.label || 'Défaut',
      severity:    m.severity || 'leger',
      location:    m.label || '',
      photo_index: Number(m.photo_index || 0),
      box: {
        x: Math.max(0, Number(m.x) - 0.06),
        y: Math.max(0, Number(m.y) - 0.05),
        w: 0.12,
        h: 0.10,
      },
    }));
    const damages  = damage_boxes.map(d => d.label);
    const severity = damage_boxes.reduce((acc, d) => SEV_RANK[d.severity] > SEV_RANK[acc] ? d.severity : acc, 'aucun');

    const { data: inserted, error } = await admin.from('vehicle_states').insert({
      owner_key:       (b.rented_by || 'kouider').toLowerCase(),
      client_name:     b.client_name,
      car_name:        b.cars?.name || 'Véhicule',
      booking_id:      bookingId,
      state_type:      stateType,
      photos,
      damages,
      damage_boxes,
      damage_detected: damage_boxes.length > 0,
      severity,
      accident:        !!accident,
      notes,
    }).select('id').single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, id: inserted?.id });
  }

  return res.status(405).json({ error: 'méthode non autorisée' });
}
