import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, X, LayoutDashboard, LogOut, LogIn, CalendarCheck } from 'lucide-react';

export default function Navbar({ scrollContainerRef }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [user, setUser]           = useState(null);
  const router = useRouter();

  useEffect(() => {
    const el = scrollContainerRef?.current || window;
    const fn = () => {
      const top = scrollContainerRef?.current?.scrollTop ?? window.scrollY;
      setScrolled(top > 30);
    };
    fn();
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, [scrollContainerRef]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [router.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const links = [
    { href: '/',           label: 'Accueil' },
    { href: '/cars',       label: 'Véhicules' },
    { href: '/conditions', label: 'Conditions' },
    { href: '/reviews',    label: 'Avis' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.05] py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-gold-500/20 rounded-lg blur-md group-hover:opacity-60 transition-opacity" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-[0_2px_12px_rgba(226,182,20,0.4)]">
              <span className="text-noir-950 font-black text-xs tracking-tight">FK</span>
            </div>
          </div>
          <div className="leading-none">
            <span className="font-display font-bold text-lg text-white block leading-tight">
              Fik <span className="text-gold-500">Conciergerie</span>
            </span>
            <span className="text-white/20 text-[9px] tracking-widest uppercase font-body">Location Premium</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const active = router.pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`relative px-4 py-2 text-sm font-medium font-body rounded-lg transition-all duration-200 ${
                  active ? 'text-gold-400' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}>
                {link.label}
                {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500 rounded-full" />}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/admin" className="btn-ghost text-sm font-body"><LayoutDashboard size={14} />Dashboard</Link>
              <button onClick={handleLogout} className="btn-ghost text-sm font-body text-white/40 hover:text-red-400"><LogOut size={14} />Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm font-body"><LogIn size={14} />Connexion</Link>
              <Link href="/reservation" className="btn-gold text-sm py-2 px-5 font-body"><CalendarCheck size={14} />Réserver</Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(v => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#080808]/98 backdrop-blur-xl border-t border-white/[0.05] px-5 py-4 space-y-1">
          {links.map(link => {
            const active = router.pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium font-body transition-all ${
                  active ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                }`}>
                {active && <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />}
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/[0.05] space-y-2">
            {user ? (
              <>
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.04] font-body transition-all"><LayoutDashboard size={15} />Dashboard</Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 font-body transition-all"><LogOut size={15} />Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.04] font-body transition-all"><LogIn size={15} />Connexion</Link>
                <Link href="/reservation" className="btn-gold w-full py-3 text-sm font-body"><CalendarCheck size={15} />Réserver maintenant</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

