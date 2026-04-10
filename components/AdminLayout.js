import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (!prof) { router.push('/login'); return; }
      setProfile(prof);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: '📊' },
    { href: '/admin/bookings', label: 'Réservations', icon: '📅' },
    { href: '/admin/cars', label: 'Véhicules', icon: '🚗' },
    { href: '/admin/reviews', label: 'Avis', icon: '⭐' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-noir-900 border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
              <span className="text-noir-950 font-black text-sm">FC</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Fik Conciergerie</p>
              <p className="text-white/30 text-xs">Administration</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 bg-noir-800 rounded-xl p-3">
            <div className="w-9 h-9 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-500 font-bold">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{profile?.name}</p>
              <p className="text-gold-500 text-xs capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${router.pathname === item.href ? 'bg-gold-500/15 text-gold-500' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors">
            <span>🌐</span> Voir le site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-noir-900/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/50 hover:text-white">☰</button>
          <div className="hidden md:block">
            <span className="text-white/20 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Connecté — {profile?.name}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
          }
