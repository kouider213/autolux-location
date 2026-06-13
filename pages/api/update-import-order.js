// Mise à jour admin d'une commande d'importation (clé service, contourne RLS).
// Whitelist stricte. Envoie un email auto au client si le statut change.
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, importStatusEmail } from '../../lib/email';

const ALLOWED = new Set([
  'status', 'client_name', 'client_phone', 'client_email', 'client_city', 'lang',
  'vehicle_brand', 'vehicle_model', 'vehicle_year', 'vehicle_type', 'vehicle_fuel',
  'vehicle_gearbox', 'vehicle_color', 'vehicle_specs', 'budget', 'currency',
  'country_origin', 'deadline', 'photos', 'notes_admin', 'notes_client',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { id, patch } = req.body || {};
  if (!id || !patch || typeof patch !== 'object') return res.status(400).json({ error: 'id + patch requis' });

  const clean = {};
  for (const [k, v] of Object.entries(patch)) if (ALLOWED.has(k)) clean[k] = v;
  if (clean.budget !== undefined) clean.budget = clean.budget === '' || clean.budget === null ? null : Number(clean.budget);
  if (Object.keys(clean).length === 0) return res.status(400).json({ error: 'aucun champ valide' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // État précédent (pour détecter le changement de statut)
  const { data: before } = await admin.from('import_orders').select('status, client_email, client_name, order_ref, lang').eq('id', id).single();

  const { data, error } = await admin.from('import_orders').update(clean).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Email auto si le statut a changé
  if (clean.status && before && clean.status !== before.status && data.client_email && /@/.test(data.client_email)) {
    try {
      const { subject, html } = importStatusEmail({
        client_name: data.client_name, ref: data.order_ref, status: data.status, lang: data.lang || 'fr',
      });
      await sendEmail(data.client_email, subject, html);
    } catch (e) { console.error('[import email]', e.message); }
  }

  return res.status(200).json({ ok: true, order: data });
}
