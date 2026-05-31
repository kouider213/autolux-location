import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, Car, CalendarCheck, Users, Star,
  BarChart3, LogOut, Globe, Menu, Bell,
} from 'lucide-react';

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/analytics',  label: 'Analytics',     icon: BarChart3 },
  { href: '/admin/bookings',   label: 'Réservations',  icon: CalendarCheck },
  { href: '/admin/clients',    label: 'Clients',       icon: Users },
  { href: '/admin/cars',       label: 'Véhicules',     icon: Car },
  { href: '/admin/reviews',    label: 'Avis',          icon: Star },
];

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sidebar, setSidebar]     = useState(false);
  const [pendingCount, setPending] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!prof) { router.push('/login'); return; }
      setProfile(prof);
      setLoading(false);
    };
    init();

    // Live badge pending bookings
    if (!supabase) return;
    supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'PENDING')
      .then(({ count }) => setPending(count || 0));

    // Demande permission notification dès ouverture admin
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const sub = supabase.channel('admin-pending')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        // Notification push navigateur
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚗 Nouvelle réservation — Fik Conciergerie', {
            body: `${payload.new?.client_name || 'Nouveau client'} · ${payload.new?.start_date || ''} → ${payload.new?.end_date || ''}`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
          });
        }
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'PENDING')
          .then(({ count }) => setPending(count || 0));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => {
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'PENDING')
          .then(({ count }) => setPending(count || 0));
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <>
        <Head>
          {/* Hide Ibrahim widget on all admin pages */}
          <style>{`[id*="ibr"],[class*="ibr"],[id*="ibrahim"],[id*="widget-root"],[id*="chatbot"]{display:none!important}`}</style>
        </Head>
        <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white/30 text-sm font-body">Chargement...</span>
          </div>
        </div>
      </>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(226,182,20,0.3)]">
            <span className="text-noir-950 font-black text-xs">FK</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm font-body">Fik Conciergerie</p>
            <p className="text-white/25 text-[10px] tracking-widest uppercase">Administration</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-400/30 to-gold-600/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gold-400 font-bold text-xs">{profile?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate font-body">{profile?.name}</p>
            <p className="text-gold-500/70 text-[10px] capitalize font-body">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          const hasBadge = href === '/admin/bookings' && pendingCount > 0;
          return (
            <Link key={href} href={href} onClick={() => setSidebar(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-body transition-all duration-150 ${
                active
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                  : 'text-white/45 hover:text-white hover:bg-white/[0.05]'
              }`}>
              <Icon size={16} className={active ? 'text-gold-400' : 'text-white/35'} />
              <span className="flex-1">{label}</span>
              {hasBadge && (
                <span className="w-5 h-5 bg-gold-500 text-noir-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.05] space-y-0.5">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 font-body transition-all hover:bg-white/[0.04]">
          <Globe size={15} />Voir le site
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.07] font-body transition-all">
          <LogOut size={15} />Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex font-body">
      <Head>
        {/* Hide Ibrahim widget on all admin pages */}
        <style>{`[id*="ibr"],[class*="ibr"],[id*="ibrahim"],[id*="widget-root"],[id*="chatbot"],[id*="chat-widget"]{display:none!important}`}</style>
      </Head>

      {/* Mobile overlay */}
      {sidebar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-[#0a0a0a] border-r border-white/[0.05] flex flex-col z-40 transition-transform duration-300 ${
        sidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.05] px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebar(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-white font-semibold text-base font-body">{title || 'Dashboard'}</h1>
              <p className="text-white/25 text-xs font-body hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Link href="/admin/bookings"
                className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl px-3 py-1.5 text-gold-400 text-xs font-medium hover:bg-gold-500/15 transition-all">
                <Bell size={13} className="animate-pulse" />
                {pendingCount} en attente
              </Link>
            )}
            <div className="flex items-center gap-1.5 text-xs text-white/25 font-body">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              {profile?.name}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
