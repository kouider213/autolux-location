import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);     // session de récupération détectée
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase pose une session "recovery" depuis le lien email
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data?.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (pwd.length < 6) { toast.error('Mot de passe : 6 caractères minimum'); return; }
    if (pwd !== pwd2) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    setTimeout(() => router.push('/admin'), 1500);
  };

  return (
    <>
      <Head><title>Réinitialiser le mot de passe — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center px-5">
        <div className="relative w-full max-w-sm z-10">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Fik Conciergerie" className="w-14 h-14 object-contain mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-white">Nouveau mot de passe</h1>
          </div>
          <form onSubmit={submit} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-8 space-y-5">
            {done ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={26} className="text-emerald-400" /></div>
                <p className="text-white font-semibold">Mot de passe changé ✅</p>
                <p className="text-white/40 text-sm mt-1">Redirection…</p>
              </div>
            ) : !ready ? (
              <p className="text-white/50 text-sm text-center py-4">Ouvre cette page depuis le lien reçu par email. En attente du lien de récupération…</p>
            ) : (
              <>
                <div>
                  <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" required
                      className="w-full bg-white/[0.05] border border-white/10 focus:border-gold-500/50 rounded-xl pl-10 pr-11 py-3.5 text-white text-sm outline-none" />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60" tabIndex={-1}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Confirmer</label>
                  <input type={show ? 'text' : 'password'} value={pwd2} onChange={e => setPwd2(e.target.value)} placeholder="••••••••" required
                    className="w-full bg-white/[0.05] border border-white/10 focus:border-gold-500/50 rounded-xl px-4 py-3.5 text-white text-sm outline-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 disabled:opacity-50">{loading ? 'Enregistrement…' : 'Changer le mot de passe'}</button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
