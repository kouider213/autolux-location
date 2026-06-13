// Suivi public d'une commande d'importation par numéro (ou téléphone/email).
// Clé service. Retourne un payload SANITISÉ (pas de notes_admin, téléphone masqué).
import { supabaseAdmin } from '../../lib/supabase';

const digits = (s) => String(s || '').replace(/\D/g, '');
const maskPhone = (p) => { const d = digits(p); return d.length >= 4 ? `••• ••• ${d.slice(-3)}` : null; };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const q = String(req.body?.query || req.body?.ref || '').trim();
  if (q.length < 4) return res.status(400).json({ error: 'recherche trop courte' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  const refUpper = q.toUpperCase().startsWith('IMP-') ? q.toUpperCase() : `IMP-${q.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  const isEmail = q.includes('@');
  const qDigits = digits(q);

  let order = null;
  // 1) par numéro de commande
  {
    const { data } = await admin.from('import_orders').select('*').eq('order_ref', refUpper).maybeSingle();
    if (data) order = data;
  }
  // 2) par email
  if (!order && isEmail) {
    const { data } = await admin.from('import_orders').select('*').ilike('client_email', q).order('created_at', { ascending: false }).limit(1);
    if (data?.[0]) order = data[0];
  }
  // 3) par téléphone (8 derniers chiffres)
  if (!order && qDigits.length >= 6) {
    const { data } = await admin.from('import_orders').select('*').order('created_at', { ascending: false }).limit(400);
    order = (data || []).find(o => digits(o.client_phone).slice(-8) === qDigits.slice(-8)) || null;
  }

  if (!order) return res.status(200).json({ ok: true, order: null });

  // Sanitise (jamais notes_admin, téléphone masqué)
  return res.status(200).json({
    ok: true,
    order: {
      id: order.id,
      ref: order.order_ref,
      status: order.status,
      client_name: order.client_name,
      client_phone_mask: maskPhone(order.client_phone),
      client_city: order.client_city,
      lang: order.lang,
      vehicle_brand: order.vehicle_brand,
      vehicle_model: order.vehicle_model,
      vehicle_year: order.vehicle_year,
      vehicle_type: order.vehicle_type,
      vehicle_fuel: order.vehicle_fuel,
      vehicle_gearbox: order.vehicle_gearbox,
      vehicle_color: order.vehicle_color,
      vehicle_specs: order.vehicle_specs,
      budget: order.budget,
      currency: order.currency,
      country_origin: order.country_origin,
      deadline: order.deadline,
      photos: Array.isArray(order.photos) ? order.photos : [],
      notes_client: order.notes_client,
      created_at: order.created_at,
      updated_at: order.updated_at,
    },
  });
}
