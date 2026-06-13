// Mise à jour admin d'un dossier (clé service). Whitelist + email auto au client si le statut change.
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, dossierStatusEmail } from '../../lib/email';

const ALLOWED = new Set([
  'status', 'client_name', 'client_phone', 'client_email', 'client_city', 'lang',
  'subject', 'budget', 'currency', 'details', 'photos', 'notes_admin', 'notes_client', 'kind',
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

  const { data: before } = await admin.from('dossiers').select('status').eq('id', id).single();
  const { data, error } = await admin.from('dossiers').update(clean).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  if (clean.status && before && clean.status !== before.status && data.client_email && /@/.test(data.client_email)) {
    try {
      const { subject, html } = dossierStatusEmail({
        client_name: data.client_name, ref: data.ref, kind: data.kind, status: data.status,
        subject: data.subject, lang: data.lang || 'fr',
      });
      await sendEmail(data.client_email, subject, html);
    } catch (e) { console.error('[dossier email]', e.message); }
  }

  return res.status(200).json({ ok: true, dossier: data });
}
