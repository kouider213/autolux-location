import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, X, LayoutDashboard, LogOut, LogIn, CalendarCheck, Heart, ChevronDown } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useSettings } from '../lib/settings';
import { useFavorites } from '../lib/favorites';

export default function Navbar({ scrollContainerRef }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [user, setUser]           = useState(null);
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const settings = useSettings();
  const { count: favCount } = useFavorites();
  const logo = settings.logo_url || '/logo.png';
  const favLabel = lang === 'ar' ? 'مفضلتي' : lang === 'en' ? 'Favorites' : 'Mes favoris';

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
    { href: '/entreprises',       label: lang === 'ar' ? 'الشركات' : lang === 'en' ? 'Business' : 'Entreprises' },
    { href: '/investir',          label: lang === 'ar' ? 'استثمر في وهران' : lang === 'en' ? 'Invest' : 'Investir' },
    { href: '/mes-reservations',  label: lang === 'ar' ? 'تتبّع طلبي' : lang === 'en' ? 'Track' : 'Suivi' },
    { href: '/reviews',           label: t('nav.reviews') },
    { href: '/blog',              label: t('nav.blog') },
    { href: '/faq',               label: t('nav.faq') },
    { href: '/conditions',        label: t('nav.conditions') },
    { href: '/contact',           label: t('nav.contact') },
  ];
  // Barre PC : les pages principales visibles, le reste dans « Plus » (14 liens ne tiennent pas sur une ligne).
  const PRIMARY = ['/cars', '/vente-voitures', '/immo', '/packs', '/entreprises', '/contact'];
  const primaryLinks = links.filter(l => PRIMARY.includes(l.href));
  const moreLinks = links.filter(l => l.href !== '/' && !PRIMARY.includes(l.href));
  const moreActive = moreLinks.some(l => l.href === router.pathname);
  const moreLabel = lang === 'ar' ? 'المزيد' : lang === 'en' ? 'More' : 'Plus';

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
        // marge du haut + encoche iPhone (l'ancien paddingTop inline annulait le py-* → logo collé en haut de l'écran)
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${scrolled ? 12 : 20}px)`,
        backgroundColor: scrolled ? '#080808' : 'transparent',
        // En haut de page : voile sombre pour garder le menu lisible sur une photo claire (ciel, drapeau)
        backgroundImage: scrolled ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0))',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.7)' : 'none',
      }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'pb-3' : 'pb-5'}`}>
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
            <span className="font-display font-bold text-base min-[400px]:text-lg text-white block leading-tight whitespace-nowrap">
              Fik <span className="text-gold-500">Conciergerie</span>
            </span>
            <span className="hidden min-[400px]:block text-white/20 text-[9px] tracking-widest uppercase font-body whitespace-nowrap">Conciergerie Premium</span>
          </div>
        </Link>

        <div className="hidden xl:flex items-center gap-0.5">
          {primaryLinks.map(link => {
            const active = router.pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`relative px-3 py-2 text-sm font-medium font-body rounded-lg whitespace-nowrap transition-all duration-200 ${
                  active ? 'text-gold-400' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}>
                {link.label}
                {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-500 rounded-full" />}
              </Link>
            );
          })}
          <div className="relative group">
            <button type="button" aria-haspopup="true"
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium font-body rounded-lg whitespace-nowrap transition-all duration-200 ${
                moreActive ? 'text-gold-400' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}>
              {moreLabel}<ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            <div className="absolute top-full end-0 pt-2 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200">
              <div className="min-w-[200px] bg-[#0d0d0d] border border-white/[0.08] rounded-xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
                {moreLinks.map(link => {
                  const active = router.pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href}
                      className={`block px-3.5 py-2.5 rounded-lg text-sm font-body whitespace-nowrap transition-all ${
                        active ? 'bg-gold-500/10 text-gold-400' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                      }`}>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-2">
          <Link href="/favoris" title={favLabel} aria-label={favLabel}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-white/55 hover:text-red-400 hover:bg-white/[0.04] transition-all">
            <Heart size={18} className={favCount > 0 ? 'fill-red-500 text-red-500' : ''} />
            {favCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">{favCount}</span>
            )}
          </Link>
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

        <div className="xl:hidden flex items-center gap-2">
          <span className="hidden md:block"><Link href="/reservation" className="btn-gold text-sm py-2 px-4 font-body"><CalendarCheck size={14} />{t('nav.book')}</Link></span>
          <LangToggle className="!py-1.5 !px-2.5 text-xs" />
          <button onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Fermer le menu' : 'Menu'} aria-expanded={menuOpen}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`xl:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
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
            <Link href="/favoris" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/55 hover:text-red-400 hover:bg-white/[0.04] font-body transition-all">
              <Heart size={15} className={favCount > 0 ? 'fill-red-500 text-red-500' : ''} />{favLabel}
              {favCount > 0 && <span className="ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">{favCount}</span>}
            </Link>
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

