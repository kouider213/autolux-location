import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const router                      = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }
    toast.success('Connexion réussie');
    router.push('/admin');
  };

  return (
    <>
      <Head>
        <title>Connexion — Fik Conciergerie</title>
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center px-5">
        {/* Background elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative w-full max-w-sm z-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gold-500/20 rounded-2xl blur-xl" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(226,182,20,0.35)]">
                <span className="text-noir-950 font-black text-xl tracking-tight">AL</span>
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Fik <span className="text-gold-500">Conciergerie</span>
            </h1>
            <p className="text-white/30 text-sm">Espace administration</p>
          </div>

          {/* Card */}
          <div className="relative">
            {/* Outer glow border */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/15 via-white/[0.04] to-transparent" />
            <form
              onSubmit={handleLogin}
              className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-8 space-y-5"
            >
              <div className="mb-2">
                <h2 className="text-white font-semibold text-lg">Connexion</h2>
                <p className="text-white/30 text-sm mt-0.5">Accès réservé aux administrateurs</p>
              </div>

              {/* Email */}
              <div>
                <label className="label-dark">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-dark">Mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-dark pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  <>
                    <LogIn size={16} />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/15 text-xs mt-6">
            Fik Conciergerie — Oran, Algérie
          </p>
        </div>
      </div>
    </>
  );
}

