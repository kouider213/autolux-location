import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, X, LayoutDashboard, LogOut, LogIn, CalendarCheck } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useSettings } from '../lib/settings';

export default function Navbar({ scrollContainerRef }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [user, setUser]           = useState(null);
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const settings = useSettings();
  const logo = settings.logo_url || '/logo.png';

  useEffect(() => {
    const el = scrollContainerRef?.current || window;
    const fn = () => {
      const top = scrollContainerRef?.current?.scrollTop ?? window.scrollY;
      setScrolled(top > 30);
      if (top > 60) setMenuOpen(false); // ferme menu au scroll
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
    { href: '/',                  label: t('nav.home') },
    { href: '/cars',              label: t('nav.rental') },
    { href: '/vente-voitures',    label: t('nav.sale') },
    { href: '/commande-vehicule', label: t('nav.order') },
    { href: '/immo',              label: t('nav.immo') },
    { href: '/packs',             label: lang === 'ar' ? 'الباقات' : 'Packs' },
    { href: '/investir',          label: lang === 'ar' ? 'استثمر في وهران' : lang === 'en' ? 'Invest' : 'Investir' },
    { href: '/reviews',           label: t('nav.reviews') },
    { href: '/blog',              label: t('nav.blog') },
    { href: '/faq',               label: t('nav.faq') },
    { href: '/conditions',        label: t('nav.conditions') },
    { href: '/contact',           label: t('nav.contact') },
  ];

  const LangToggle = ({ className = '' }) => (
    <div className={`flex items-center gap-0.5 bg-white/[0.05] rounded-xl p-0.5 ${className}`} aria-label="Langue">
      {[['fr', 'FR'], ['ar', 'ع'], ['en', 'EN']].map(([code, lbl]) => (
        <button key={code} onClick={() => setLang(code)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            lang === code ? 'bg-gold-500 text-noir-950' : 'text-white/60 hover:text-gold-400'
          }`}
          aria-pressed={lang === code}>
          {lbl}
        </button>
      ))}
    </div>
  );

  return (
    <nav
      style={{
        top: 'var(--annc-h, 0px)',
        backgroundColor: scrolled ? '#080808' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.7)' : 'none',
      }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-gold-500/20 rounded-lg blur-md group-hover:opacity-60 transition-opacity" />
            <img
              src={logo}
              alt="Fik Conciergerie"
              className="relative w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(226,182,20,0.5)] animate-float"
            />
          </div>
          <div className="leading-none">
            <span className="font-display font-bold text-lg text-white block leading-tight">
              Fik <span className="text-gold-500">Conciergerie</span>
            </span>
            <span className="text-white/20 text-[9px] tracking-widest uppercase font-body">Conciergerie Premium</span>
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
          <LangToggle />
          {user ? (
            <>
              <Link href="/admin" className="btn-ghost text-sm font-body"><LayoutDashboard size={14} />Dashboard</Link>
              <button onClick={handleLogout} className="btn-ghost text-sm font-body text-white/40 hover:text-red-400"><LogOut size={14} />Déconnexion</button>
            </>
          ) : (
            /* Accès admin masqué : connexion via URL /login directement */
            <Link href="/reservation" className="btn-gold text-sm py-2 px-5 font-body"><CalendarCheck size={14} />{t('nav.book')}</Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LangToggle className="!py-1.5 !px-2.5 text-xs" />
          <button onClick={() => setMenuOpen(v => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#080808]/98 backdrop-blur-xl border-t border-white/[0.05] px-5 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
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
              /* Accès admin masqué : connexion via /login directement */
              <Link href="/reservation" className="btn-gold w-full py-3 text-sm font-body"><CalendarCheck size={15} />{t('nav.book_now')}</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

