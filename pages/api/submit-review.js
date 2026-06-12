// Soumission d'un avis. Si bookingId fourni + réservation valide → avis VÉRIFIÉ.
// Sinon → avis simple (non vérifié), modéré par l'admin avant publication.
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { bookingId, clientName, rating, comment } = req.body || {};
  const r = Number(rating);
  if (!comment || !comment.trim() || !r || r < 1 || r > 5) {
    return res.status(400).json({ error: 'note (1-5) + commentaire requis' });
  }

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  let verified = false;
  let name = (clientName || '').trim();

  // Vérifie la réservation si fournie → avis vérifié + nom auto
  if (bookingId) {
    const { data: b } = await admin.from('bookings').select('client_name, status').eq('id', bookingId).maybeSingle();
    if (b) { verified = true; name = b.client_name || name; }
  }
  if (!name) return res.status(400).json({ error: 'nom requis' });

  const row = { client_name: name, rating: r, comment: comment.trim(), approved: false };
  // Champs avis vérifiés (présents après migration 0019) — fallback si absents
  let { error } = await admin.from('reviews').insert({ ...row, verified, booking_id: bookingId || null });
  if (error && /column .* (verified|booking_id)/i.test(error.message)) {
    ({ error } = await admin.from('reviews').insert(row));
    verified = false;
  }
  if (error) return res.status(500).json({ error: error.message });

  // Notifie Dzaryx (non bloquant)
  fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['host']}/api/notify-dzaryx`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'new_review', data: { client_name: name, rating: r, comment, verified } }),
  }).catch(() => {});

  return res.status(200).json({ ok: true, verified });
}
