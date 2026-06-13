import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Loader2, Plus, KeyRound, Mail, Trash2, ShieldCheck, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const ROLES = ['admin', 'houari', 'kouider'];

export default function AdminEquipePage() {
  const [allowed, setAllowed] = useState(null); // null=loading, true/false
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nf, setNf] = useState({ name: '', username: '', email: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token || '';

  const call = async (action, payload) => {
    const r = await fetch('/api/admin-users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ action, payload }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'erreur');
    return d;
  };

  const load = async () => {
    setLoading(true);
    try { const d = await call('list'); setUsers(d.users || []); setAllowed(true); }
    catch (e) { if (/suprême|autorisé/i.test(e.message)) setAllowed(false); else toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { setAllowed(false); setLoading(false); return; }
      const { data: p } = await supabase.from('profiles').select('is_super, role').eq('id', data.user.id).single();
      if (p?.is_super || p?.role === 'kouider') load(); else { setAllowed(false); setLoading(false); }
    });
  }, []);

  const create = async () => {
    if (!nf.name || !nf.email || !nf.password) { toast.error('Nom + email + mot de passe requis'); return; }
    setCreating(true);
    try { await call('create', nf); toast.success('Admin créé'); setNf({ name: '', username: '', email: '', password: '', role: 'admin' }); await load(); }
    catch (e) { toast.error(e.message); }
    setCreating(false);
  };

  const resetPwd = async (u) => {
    const p = window.prompt(`Nouveau mot de passe pour ${u.name || u.email} :`);
    if (!p) return;
    try { await call('reset-password', { id: u.id, password: p }); toast.success('Mot de passe réinitialisé'); }
    catch (e) { toast.error(e.message); }
  };
  const changeEmail = async (u) => {
    const em = window.prompt(`Nouvel email pour ${u.name || u.email} :`, u.email);
    if (!em || em === u.email) return;
    try { await call('update-email', { id: u.id, email: em }); toast.success('Email changé'); await load(); }
    catch (e) { toast.error(e.message); }
  };
  const saveRow = async (u, patch) => {
    try { await call('update-profile', { id: u.id, ...patch }); setUsers(us => us.map(x => x.id === u.id ? { ...x, ...patch } : x)); }
    catch (e) { toast.error(e.message); }
  };
  const del = async (u) => {
    if (!confirm(`Supprimer le compte de ${u.name || u.email} ? Action définitive.`)) return;
    try { await call('delete', { id: u.id }); toast.success('Compte supprimé'); setUsers(us => us.filter(x => x.id !== u.id)); }
    catch (e) { toast.error(e.message); }
  };

  if (allowed === false) return (
    <AdminLayout title="Équipe">
      <div className="max-w-md mx-auto bg-[#141414] border border-white/[0.07] rounded-2xl p-8 text-center text-white/50 text-sm mt-10">
        🔒 Réservé à l'administrateur suprême.
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Équipe & accès">
      <Head><title>Équipe — Admin</title></Head>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><Users size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Équipe & accès</h1>
            <p className="text-white/30 text-sm">Gère les comptes admin. Les mots de passe sont chiffrés (non visibles) — tu peux les réinitialiser.</p>
          </div>
        </div>

        {/* Ajouter un admin */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Plus size={15} className="text-gold-500" />Ajouter un accès (employé / admin)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <input value={nf.name} onChange={e => setNf(f => ({ ...f, name: e.target.value }))} placeholder="Nom" className={inputCls} />
            <input value={nf.username} onChange={e => setNf(f => ({ ...f, username: e.target.value }))} placeholder="Nom d'utilisateur (login)" className={inputCls} />
            <select value={nf.role} onChange={e => setNf(f => ({ ...f, role: e.target.value }))} className={inputCls}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={nf.email} onChange={e => setNf(f => ({ ...f, email: e.target.value }))} placeholder="Email" className={inputCls} />
            <input value={nf.password} onChange={e => setNf(f => ({ ...f, password: e.target.value }))} placeholder="Mot de passe (6+)" className={inputCls} />
            <button onClick={create} disabled={creating} className="flex items-center justify-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}Créer
            </button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-gold-500" /></div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{u.name || '—'}</p>
                      {u.is_super && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-400">Admin suprême</span>}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-white/50">{u.role}</span>
                    </div>
                    <p className="text-white/45 text-xs mt-1">✉️ {u.email}</p>
                    {u.username && <p className="text-white/35 text-xs">👤 {u.username}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => resetPwd(u)} title="Réinitialiser le mot de passe" className="flex items-center gap-1 text-xs font-semibold text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 rounded-lg px-2.5 py-1.5"><KeyRound size={13} />Mot de passe</button>
                    <button onClick={() => changeEmail(u)} title="Changer l'email" className="flex items-center gap-1 text-xs font-semibold text-white/60 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5"><Mail size={13} />Email</button>
                    {!u.is_super && <button onClick={() => del(u)} className="w-8 h-8 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400 flex items-center justify-center"><Trash2 size={13} /></button>}
                  </div>
                </div>
                {/* édition rapide rôle + username */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05] flex-wrap">
                  {!u.is_super && (
                    <select value={u.role} onChange={e => saveRow(u, { role: e.target.value })} className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5 text-white text-xs outline-none">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                  <input defaultValue={u.username || ''} onBlur={e => e.target.value !== (u.username || '') && saveRow(u, { username: e.target.value })}
                    placeholder="nom d'utilisateur (login)" className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5 text-white text-xs outline-none w-44" />
                  <span className="text-white/20 text-[11px]">enregistré au clic ailleurs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
