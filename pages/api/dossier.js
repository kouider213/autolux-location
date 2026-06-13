// Suivi public d'un dossier par numéro (ou téléphone/email). Payload sanitisé.
import { supabaseAdmin } from '../../lib/supabase';

const digits = (s) => String(s || '').replace(/\D/g, '');
const maskPhone = (p) => { const d = digits(p); return d.length >= 4 ? `••• ••• ${d.slice(-3)}` : null; };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const q = String(req.body?.query || req.body?.ref || '').trim();
  if (q.length < 4) return res.status(400).json({ error: 'recherche trop courte' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  const refUpper = /^(VTE|IMM|PCK)-/i.test(q) ? q.toUpperCase() : null;
  const isEmail = q.includes('@');
  const qDigits = digits(q);

  let d = null;
  if (refUpper) { const { data } = await admin.from('dossiers').select('*').eq('ref', refUpper).maybeSingle(); if (data) d = data; }
  if (!d && isEmail) { const { data } = await admin.from('dossiers').select('*').ilike('client_email', q).order('created_at', { ascending: false }).limit(1); if (data?.[0]) d = data[0]; }
  if (!d && qDigits.length >= 6) { const { data } = await admin.from('dossiers').select('*').order('created_at', { ascending: false }).limit(400); d = (data || []).find(o => digits(o.client_phone).slice(-8) === qDigits.slice(-8)) || null; }

  if (!d) return res.status(200).json({ ok: true, dossier: null });

  return res.status(200).json({
    ok: true,
    dossier: {
      id: d.id, ref: d.ref, kind: d.kind, status: d.status,
      client_name: d.client_name, client_phone_mask: maskPhone(d.client_phone), client_city: d.client_city, lang: d.lang,
      subject: d.subject, budget: d.budget, currency: d.currency, details: d.details,
      photos: Array.isArray(d.photos) ? d.photos : [], notes_client: d.notes_client,
      created_at: d.created_at, updated_at: d.updated_at,
    },
  });
}
