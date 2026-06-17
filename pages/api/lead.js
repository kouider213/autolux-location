// Enregistre un lead (client intéressé par immo / vente voiture / pack) AVANT WhatsApp.
// Insert public via clé service (RLS écriture = authenticated). Best-effort, jamais bloquant.
import { supabaseAdmin } from '../../lib/supabase';
import { notifyTelegram, buildNotif } from '../../lib/telegramNotify';

const VALID_CAT = new Set(['immo_location', 'immo_vente', 'voiture_vente', 'voiture_location', 'pack', 'entreprise']);
const CAT_FR = { immo_location: 'Immo location', immo_vente: 'Immo vente', voiture_vente: 'Voiture vente', voiture_location: 'Voiture location', pack: 'Pack séjour', entreprise: 'Entreprise / B2B' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const b = req.body || {};
  if (!b.client_name?.trim() || !b.client_phone?.trim()) return res.status(400).json({ error: 'nom + téléphone requis' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const { data, error } = await admin.from('client_leads').insert({
    client_name: b.client_name.trim(),
    client_phone: b.client_phone.trim(),
    category: VALID_CAT.has(b.category) ? b.category : 'immo_vente',
    criteria: b.criteria || null,
    budget_max: b.budget_max ? Number(b.budget_max) : null,
    currency: b.currency || 'DZD',
    city: b.city || null,
    notes: b.notes || null,
    lang: b.lang || 'fr',
    client_email: b.client_email || null,
    status: 'nouveau',
  }).select('id').single();
  if (error) return res.status(500).json({ error: error.message });

  notifyTelegram(buildNotif({
    icon: '🔔', type: 'Nouveau LEAD — ' + (CAT_FR[b.category] || 'Demande'),
    name: b.client_name, phone: b.client_phone, email: b.client_email, lang: b.lang,
    lines: [b.criteria ? `📌 ${b.criteria}` : '', b.budget_max ? `💰 ${b.budget_max} ${b.currency || 'DZD'}` : '', b.city ? `📍 ${b.city}` : ''],
    adminPath: '/admin/leads',
  })).catch(() => {});

  return res.status(200).json({ ok: true, id: data.id });
}
