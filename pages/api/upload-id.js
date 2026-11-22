// 22/11 Kouider : « il me dit 35 ans mais j'ai pas de preuve » → la photo de la pièce d'identité (passeport / carte)
// est envoyée avec la réservation. Stockage PRIVÉ (bucket client-ids, jamais public) ; Kouider la reçoit sur Telegram.
import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabase';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const hits = new Map();   // anti-abus simple : 6 envois / 10 min par IP (instance)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 600_000);
  if (h.length >= 6) return res.status(429).json({ error: 'Trop d\'envois, réessayez dans quelques minutes.' });
  hits.set(ip, [...h, now]);

  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.image || ''));
  if (!m) return res.status(400).json({ error: 'Image invalide' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 5_000 || buf.length > 3_500_000) return res.status(400).json({ error: 'Image trop petite ou trop lourde' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Stockage indisponible' });
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from('client-ids').upload(path, buf, { contentType: `image/${m[1]}`, upsert: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, path });
}
