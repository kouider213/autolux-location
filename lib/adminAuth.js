// 13/11 : routes d'administration fermées au public (avant : n'importe qui pouvait accepter/refuser une réservation,
// modifier une résa, les pages légales, uploader…). Autorisé = session admin du site (profil) OU Dzaryx (jeton interne).
import { createClient } from '@supabase/supabase-js';

export async function isAdminRequest(req) {
  const internal = req.headers['x-internal-token'];
  if (internal && process.env.INTERNAL_API_TOKEN && internal === process.env.INTERNAL_API_TOKEN) return true;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return false;
  const { data } = await createClient(url, anon).auth.getUser(token);
  if (!data?.user) return false;
  const { data: prof } = await createClient(url, service, { auth: { persistSession: false } }).from('profiles').select('id').eq('id', data.user.id).maybeSingle();
  return !!prof;
}

export async function requireAdmin(req, res) {
  if (await isAdminRequest(req)) return true;
  res.status(401).json({ error: 'non autorisé — reconnecte-toi à l\'admin' });
  return false;
}
