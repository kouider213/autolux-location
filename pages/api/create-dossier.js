// Crée un dossier (achat véhicule / immobilier) — statut REQUESTED. Insert public via clé service.
import { supabaseAdmin } from '../../lib/supabase';
import { notifyTelegram, buildNotif } from '../../lib/telegramNotify';

const KIND_FR = { voiture: 'Achat véhicule', immo: 'Immobilier', pack: 'Pack séjour' };

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rand = () => Array.from({ length: 4 }, () => REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]).join('');
const PREFIX = { immo: 'IMM-', pack: 'PCK-', voiture: 'VTE-' };
const genRef = (kind) => (PREFIX[kind] || 'VTE-') + rand();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const b = req.body || {};
  if (!b.client_name && !b.client_phone) return res.status(400).json({ error: 'nom ou téléphone requis' });
  const kind = ['immo', 'pack', 'voiture'].includes(b.kind) ? b.kind : 'voiture';

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  const row = {
    kind, status: 'REQUESTED',
    client_name: b.client_name || null, client_phone: b.client_phone || null,
    client_email: b.client_email || null, client_city: b.client_city || null, lang: b.lang || 'fr',
    subject: b.subject || null, listing_id: b.listing_id || null,
    budget: b.budget ? Number(b.budget) : null, currency: b.currency || 'DZD', details: b.details || null,
  };

  let data, error, ref;
  for (let i = 0; i < 5; i++) {
    ref = genRef(kind);
    ({ data, error } = await admin.from('dossiers').insert({ ...row, ref }).select('id, ref').single());
    if (!error) break;
    if (!String(error.message || '').toLowerCase().includes('duplicate')) break;
  }
  if (error) return res.status(500).json({ error: error.message });

  // Parrainage : si un code est fourni, on incrémente son compteur
  if (b.referral_code) {
    try {
      const code = String(b.referral_code).trim().toUpperCase();
      const { data: rf } = await admin.from('referrals').select('id, uses').ilike('code', code).maybeSingle();
      if (rf) await admin.from('referrals').update({ uses: (rf.uses || 0) + 1 }).eq('id', rf.id);
    } catch { /* ignore */ }
  }

  await notifyTelegram(buildNotif({
    icon: '📁', type: `Nouveau DOSSIER ${KIND_FR[kind]} — ${data.ref}`,
    name: b.client_name, phone: b.client_phone, email: b.client_email, lang: b.lang,
    lines: [b.subject ? `📌 ${b.subject}` : '', b.budget ? `💰 ${b.budget} ${b.currency || 'DZD'}` : ''],
    adminPath: '/admin/dossiers',
  })).catch(() => {});

  return res.status(200).json({ ok: true, ref: data.ref, id: data.id });
}
