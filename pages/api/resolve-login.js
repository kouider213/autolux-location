// Résout un nom d'utilisateur → email (pour permettre le login par nom). Clé service.
// Ne révèle rien de sensible (juste l'email associé à un username admin).
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const ident = String(req.body?.identifier || '').trim();
  if (!ident) return res.status(400).json({ error: 'identifiant requis' });

  // Déjà un email → on le renvoie tel quel
  if (ident.includes('@')) return res.status(200).json({ email: ident });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur' });

  const { data: prof } = await admin.from('profiles').select('id').ilike('username', ident).maybeSingle();
  if (!prof) return res.status(404).json({ error: 'introuvable' });

  const { data: u } = await admin.auth.admin.getUserById(prof.id);
  if (!u?.user?.email) return res.status(404).json({ error: 'introuvable' });
  return res.status(200).json({ email: u.user.email });
}
