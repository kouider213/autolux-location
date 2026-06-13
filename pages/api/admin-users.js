// Gestion des comptes admin — réservé à l'admin SUPRÊME (is_super).
// Actions: list | create | reset-password | update-email | update-role | delete.
// Les mots de passe ne sont JAMAIS lisibles (chiffrés) — on peut seulement en définir un nouveau.
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // 1) Authentifie l'appelant
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'non autorisé' });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return res.status(401).json({ error: 'non autorisé' });

  // 2) Vérifie qu'il est admin suprême
  const { data: me } = await admin.from('profiles').select('is_super, role').eq('id', u.user.id).single();
  if (!me?.is_super && me?.role !== 'kouider') return res.status(403).json({ error: 'réservé à l\'admin suprême' });

  const { action, payload = {} } = req.body || {};

  try {
    if (action === 'list') {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const { data: profs } = await admin.from('profiles').select('id, name, role, username, is_super');
      const byId = Object.fromEntries((profs || []).map(p => [p.id, p]));
      const users = (list?.users || []).map(usr => {
        const p = byId[usr.id] || {};
        return { id: usr.id, email: usr.email, name: p.name || '', role: p.role || 'admin', username: p.username || '', is_super: !!p.is_super, last_sign_in: usr.last_sign_in_at };
      }).filter(x => byId[x.id]); // uniquement les comptes admin (présents dans profiles)
      return res.status(200).json({ ok: true, users });
    }

    if (action === 'create') {
      const { email, password, name, role = 'admin', username } = payload;
      if (!email || !password || !name) return res.status(400).json({ error: 'email + mot de passe + nom requis' });
      const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) return res.status(400).json({ error: error.message });
      const { error: pe } = await admin.from('profiles').insert({ id: created.user.id, name, role, username: username || null, is_super: false });
      if (pe) { await admin.auth.admin.deleteUser(created.user.id); return res.status(400).json({ error: pe.message }); }
      return res.status(200).json({ ok: true, id: created.user.id });
    }

    if (action === 'reset-password') {
      const { id, password } = payload;
      if (!id || !password || password.length < 6) return res.status(400).json({ error: 'mot de passe (6+ caractères) requis' });
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === 'update-email') {
      const { id, email } = payload;
      if (!id || !email) return res.status(400).json({ error: 'id + email requis' });
      const { error } = await admin.auth.admin.updateUserById(id, { email, email_confirm: true });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === 'update-profile') {
      const { id, name, role, username } = payload;
      const patch = {};
      if (name !== undefined) patch.name = name;
      if (role !== undefined) patch.role = role;
      if (username !== undefined) patch.username = username || null;
      if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'rien à modifier' });
      const { error } = await admin.from('profiles').update(patch).eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      const { id } = payload;
      if (!id) return res.status(400).json({ error: 'id requis' });
      if (id === u.user.id) return res.status(400).json({ error: 'tu ne peux pas supprimer ton propre compte' });
      const { data: target } = await admin.from('profiles').select('is_super').eq('id', id).single();
      if (target?.is_super) return res.status(400).json({ error: 'impossible de supprimer un admin suprême' });
      await admin.auth.admin.deleteUser(id);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'action inconnue' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
