import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserCog, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";

export default function AdminComptePage() {
  const [me, setMe] = useState(null);
  const [prof, setProf] = useState(null);

  // changement mot de passe
  const [curPwd1, setCurPwd1] = useState(''); const [newPwd, setNewPwd] = useState(''); const [savingPwd, setSavingPwd] = useState(false);
  // changement email
  const [curPwd2, setCurPwd2] = useState(''); const [newEmail, setNewEmail] = useState(''); const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMe(data?.user || null);
      if (data?.user) supabase.from('profiles').select('name, role, username, is_super').eq('id', data.user.id).single().then(({ data: p }) => setProf(p));
    });
  }, []);

  // Ré-authentifie avec le mot de passe actuel (sécurité)
  const reauth = async (password) => {
    if (!me?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({ email: me.email, password });
    return !error;
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Nouveau mot de passe : 6 caractères minimum'); return; }
    setSavingPwd(true);
    if (!(await reauth(curPwd1))) { toast.error('Mot de passe actuel incorrect'); setSavingPwd(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) { toast.error(error.message); return; }
    setCurPwd1(''); setNewPwd('');
    toast.success('Mot de passe changé ✅');
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) { toast.error('Email invalide'); return; }
    setSavingEmail(true);
    if (!(await reauth(curPwd2))) { toast.error('Mot de passe incorrect'); setSavingEmail(false); return; }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    if (error) { toast.error(error.message); return; }
    setCurPwd2(''); setNewEmail('');
    toast.success('Email en cours de changement — confirme via le lien envoyé à ta nouvelle adresse 📧');
  };

  return (
    <AdminLayout title="Mon compte">
      <Head><title>Mon compte — Admin</title></Head>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><UserCog size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Mon compte</h1>
            <p className="text-white/30 text-sm">{prof?.name} · {prof?.role}{prof?.is_super ? ' · admin suprême' : ''} · {me?.email}</p>
          </div>
        </div>

        {/* Mot de passe */}
        <form onSubmit={changePassword} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Lock size={15} className="text-gold-500" />Changer le mot de passe</h2>
          <p className="text-white/30 text-xs">Pour des raisons de sécurité, confirme avec ton mot de passe actuel.</p>
          <input type="password" value={curPwd1} onChange={e => setCurPwd1(e.target.value)} placeholder="Mot de passe actuel" className={inputCls} autoComplete="current-password" />
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Nouveau mot de passe (6+ caractères)" className={inputCls} autoComplete="new-password" />
          <button disabled={savingPwd} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
            {savingPwd ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}Changer le mot de passe
          </button>
        </form>

        {/* Email */}
        <form onSubmit={changeEmail} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Mail size={15} className="text-gold-500" />Changer l'adresse email</h2>
          <p className="text-white/30 text-xs">Confirme avec ton mot de passe. Un lien de validation sera envoyé à la nouvelle adresse.</p>
          <input type="password" value={curPwd2} onChange={e => setCurPwd2(e.target.value)} placeholder="Mot de passe actuel" className={inputCls} autoComplete="current-password" />
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Nouvelle adresse email" className={inputCls} autoComplete="email" />
          <button disabled={savingEmail} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
            {savingEmail ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}Changer l'email
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
