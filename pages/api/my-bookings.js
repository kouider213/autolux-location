// Espace client léger : retrouve les réservations d'un client par son téléphone.
// Pas de compte/mot de passe (cohérent "sans création de compte"). Clé service.
import { supabaseAdmin } from '../../lib/supabase';

const digits = (s) => String(s || '').replace(/\D/g, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const phone = digits(req.body?.phone);
  if (phone.length < 6) return res.status(400).json({ error: 'numéro invalide' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  // Récupère tout puis filtre par téléphone normalisé (gère +213 / 0 / espaces)
  const { data, error } = await admin
    .from('bookings')
    .select('id, client_name, client_phone, start_date, end_date, status, final_price, paid_amount, currency, cars(name, image_url)')
    .order('start_date', { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ error: error.message });

  const last8 = phone.slice(-8); // compare sur les 8 derniers chiffres (robuste aux préfixes)
  const mine = (data || []).filter(b => digits(b.client_phone).slice(-8) === last8);

  return res.status(200).json({
    ok: true,
    bookings: mine.map(b => ({
      id: b.id, client_name: b.client_name,
      car: b.cars?.name || '—', image: b.cars?.image_url || null,
      start: b.start_date, end: b.end_date, status: b.status,
      total: b.final_price, paid: b.paid_amount, currency: b.currency || 'EUR',
    })),
  });
}
