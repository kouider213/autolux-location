import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }

    toast.success('Connexion rÃ©ussie');
    router.push('/admin');
  };

  return (
    <>
      <Head>
        <title>Connexion Admin â Fik Conciergerie</title>
      </Head>

      <div className="grain min-h-screen bg-noir-950 flex items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-noir-950 font-black text-xl">AL</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Fik Conciergerie</h1>
            <p className="text-white/30 text-sm mt-1">Espace administration</p>
          </div>

          <form onSubmit={handleLogin} className="card-dark p-8 space-y-5">
            <div>
              <label className="label-dark">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="input-dark"
              />
            </div>

            <div>
              <label className="label-dark">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
                required
                className="input-dark"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            AccÃ¨s rÃ©servÃ© aux administrateurs Fik Conciergerie
          </p>
        </div>
      </div>
    </>
  );
}
