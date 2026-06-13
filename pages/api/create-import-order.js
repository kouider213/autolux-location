// Crée une commande d'importation véhicule (statut REQUESTED) depuis le formulaire public.
// Clé service (contourne la RLS). Retourne le numéro de commande + lien de suivi.
import { supabaseAdmin } from '../../lib/supabase';

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I/O/0/1 (lisibilité)
const genRef = () => 'IMP-' + Array.from({ length: 5 }, () => REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]).join('');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const b = req.body || {};
  if (!b.client_name && !b.client_phone) return res.status(400).json({ error: 'nom ou téléphone requis' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const row = {
    client_name: b.client_name || null,
    client_phone: b.client_phone || null,
    client_email: b.client_email || null,
    client_city: b.client_city || null,
    lang: b.lang || 'fr',
    vehicle_brand: b.vehicle_brand || null,
    vehicle_model: b.vehicle_model || null,
    vehicle_year: b.vehicle_year || null,
    vehicle_type: b.vehicle_type || null,
    vehicle_fuel: b.vehicle_fuel || null,
    vehicle_gearbox: b.vehicle_gearbox || null,
    vehicle_color: b.vehicle_color || null,
    vehicle_specs: b.vehicle_specs || null,
    budget: b.budget ? Number(b.budget) : null,
    currency: b.currency || 'EUR',
    country_origin: b.country_origin || null,
    deadline: b.deadline || null,
    status: 'REQUESTED',
  };

  // Génère un ref unique (retry sur collision improbable)
  let data, error, ref;
  for (let i = 0; i < 5; i++) {
    ref = genRef();
    ({ data, error } = await admin.from('import_orders').insert({ ...row, order_ref: ref }).select('id, order_ref').single());
    if (!error) break;
    if (!String(error.message || '').toLowerCase().includes('duplicate')) break;
  }
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, ref: data.order_ref, id: data.id });
}
