import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import {
  LayoutDashboard, Car, CalendarCheck, Users, Star,
  BarChart3, LogOut, Globe, Menu, Bell, Building2, Tag, Settings, FileText, HelpCircle, Newspaper, Package, CalendarRange, Mail, Wallet, Ship, UserPlus, FolderKanban, UserCog, ShieldCheck, Search, Languages, Scale,
} from 'lucide-react';

const NAV_GROUPS = [
  { title: 'Activité', items: [
    { href: '/admin',              label: 'Dashboard',           icon: LayoutDashboard },
    { href: '/admin/bookings',     label: 'Réservations',        icon: CalendarCheck, badge: 'pending' },
    { href: '/admin/planning',     label: 'Planning flotte',     icon: CalendarRange },
    { href: '/admin/leads',        label: 'Leads / Demandes',    icon: UserPlus, badge: 'leads' },
    { href: '/admin/clients',      label: 'Clients',             icon: Users },
    { href: '/admin/comptabilite', label: 'Comptabilité',        icon: Wallet },
    { href: '/admin/analytics',    label: 'Analytics',           icon: BarChart3 },
  ] },
  { title: 'Offres', items: [
    { href: '/admin/cars',          label: 'Location voiture',    icon: Car },
    { href: '/admin/vehicles-sale', label: 'Véhicules à vendre',  icon: Tag },
    { href: '/admin/import',        label: 'Importation',         icon: Ship },
    { href: '/admin/dossiers',      label: 'Dossiers achat/immo', icon: FolderKanban },
    { href: '/admin/immo',          label: 'Immobilier',          icon: Building2 },
    { href: '/admin/packs',         label: 'Packs séjour',        icon: Package },
  ] },
  { title: 'Site web', items: [
    { href: '/admin/contenu',    label: 'Contenu (textes/photos)', icon: Globe },
    { href: '/admin/textes',     label: 'Textes du site',     icon: Languages },
    { href: '/admin/pages',      label: 'Pages du site',      icon: FileText },
    { href: '/admin/reviews',    label: 'Avis',               icon: Star },
    { href: '/admin/faq',        label: 'FAQ',                icon: HelpCircle },
    { href: '/admin/blog',       label: 'Blog',               icon: Newspaper },
    { href: '/admin/newsletter', label: 'Newsletter',         icon: Mail },
    { href: '/admin/conditions', label: 'Conditions',         icon: Scale },
  ] },
  { title: 'Réglages', items: [
    { href: '/admin/settings', label: 'Paramètres',     icon: Settings },
    { href: '/admin/compte',   label: 'Mon compte',     icon: UserCog },
    { href: '/admin/equipe',   label: 'Équipe & accès', icon: ShieldCheck },
  ] },
];
const NAV = NAV_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.title })));

const isActive = (pathname, href) => (href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/'));
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Ctrl/⌘ + K : aller à n'importe quelle page de l'admin au clavier
function QuickJump({ open, onClose }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const hits = useMemo(() => {
    const n = norm(q.trim());
    return n ? NAV.filter(i => norm(i.label + ' ' + i.group + ' ' + i.href).includes(n)) : NAV;
  }, [q]);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  if (!open) return null;

  const go = (i) => { if (!i) return; onClose(); router.push(i.href); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(hits[sel]); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 border-b border-white/[0.06]">
          <Search size={15} className="text-white/30" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Aller à… (réservations, avis, textes…)"
            className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder-white/25 outline-none" />
          <kbd className="text-[10px] text-white/25 border border-white/10 rounded px-1.5 py-0.5">Échap</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1.5">
          {hits.length === 0 && <p className="px-4 py-6 text-center text-white/25 text-sm">Aucune page « {q} »</p>}
          {hits.map((i, idx) => {
            const Icon = i.icon;
            return (
              <button key={i.href} onMouseEnter={() => setSel(idx)} onClick={() => go(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${idx === sel ? 'bg-gold-500/10 text-gold-400' : 'text-white/60'}`}>
                <Icon size={15} className={idx === sel ? 'text-gold-400' : 'text-white/30'} />
                <span className="flex-1">{i.label}</span>
                <span className="text-[10px] text-white/20 uppercase tracking-wider">{i.group}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const settings = useSettings();
  const [sidebar, setSidebar]     = useState(false);
  const [pendingCount, setPending] = useState(0);
  const [leadsCount, setLeads]     = useState(0);
  const [jump, setJump]            = useState(false);
  const pageTitle = title || NAV.find(i => isActive(router.pathname, i.href))?.label || 'Dashboard';

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setJump(j => !j); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    supabase.from('client_leads').select('id', { count: 'exact', head: true }).eq('status', 'nouveau')
      .then(({ count }) => setLeads(count || 0));

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

  // compact = rail d'icônes sur tablette (md → xl), barre complète sur PC (xl+)
  const SidebarContent = ({ compact }) => {
    const lbl = compact ? 'hidden xl:inline' : '';
    return (
    <>
      {/* Logo */}
      <div className={`py-5 border-b border-white/[0.05] ${compact ? 'px-3 xl:px-6' : 'px-6'}`}>
        <div className={`flex items-center gap-3 ${compact ? 'justify-center xl:justify-start' : ''}`}>
          <img src={settings.logo_url || '/logo.png'} alt="Fik Conciergerie" className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(226,182,20,0.5)]" />
          <div className={lbl}>
            <p className="font-display text-white font-bold text-base leading-tight">Fik <span className="text-gold-gradient">Conciergerie</span></p>
            <p className="text-gold-500/50 text-[9px] tracking-[0.3em] uppercase mt-0.5">Administration</p>
          </div>
        </div>
      </div>

      {/* Profil */}
      <div className={`py-3 border-b border-white/[0.05] ${compact ? 'px-3 xl:px-4' : 'px-4'}`}>
        <div className={`flex items-center gap-3 rounded-2xl ${compact ? 'justify-center xl:justify-start xl:gold-frame xl:px-3 xl:py-2.5' : 'gold-frame px-3 py-2.5'}`}>
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(226,182,20,0.35)]">
            <span className="text-noir-950 font-black text-sm">{profile?.name?.[0]?.toUpperCase()}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
          </div>
          <div className={`min-w-0 ${lbl}`}>
            <p className="text-white text-sm font-semibold truncate font-body">{profile?.name}</p>
            <p className="text-gold-500/70 text-[10px] capitalize font-body">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-3 overflow-y-auto no-scrollbar ${compact ? 'px-2.5 xl:px-3' : 'px-3'}`}>
        <button onClick={() => { setSidebar(false); setJump(true); }} title="Rechercher une page"
          className={`w-full flex items-center gap-2.5 mb-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white/35 hover:text-gold-400 hover:border-gold-500/30 text-xs transition-all ${compact ? 'justify-center px-0 xl:justify-start xl:px-3' : 'px-3'}`}>
          <Search size={14} />
          <span className={`flex-1 text-left ${lbl}`}>Rechercher une page</span>
          <kbd className={`text-[10px] border border-white/10 rounded px-1 ${compact ? 'hidden xl:inline' : 'hidden'}`}>Ctrl K</kbd>
        </button>
        {NAV_GROUPS.map((g, gi) => (
          <div key={g.title} className="mb-4">
            <p className={`px-3 pb-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-gold-500/40 ${lbl}`}>{g.title}</p>
            {compact && gi > 0 && <div className="xl:hidden h-px bg-white/[0.06] mx-2 mb-3" />}
            <div className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(router.pathname, href);
                const n = badge === 'pending' ? pendingCount : badge === 'leads' ? leadsCount : 0;
                return (
                  <Link key={href} href={href} onClick={() => setSidebar(false)} title={label}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium font-body transition-all duration-200 ${compact ? 'justify-center px-0 xl:justify-start xl:px-3' : 'px-3'} ${
                      active
                        ? 'bg-gradient-to-r from-gold-500/20 via-gold-500/[0.07] to-transparent text-gold-300'
                        : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                    }`}>
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gold-400 shadow-[0_0_12px_rgba(226,182,20,0.8)]" />}
                    <Icon size={17} className={active ? 'text-gold-400' : 'text-white/35 group-hover:text-gold-400/80 transition-colors'} />
                    <span className={`flex-1 ${lbl}`}>{label}</span>
                    {n > 0 && (
                      <span className={`min-w-[20px] h-5 px-1 bg-gold-500 text-noir-950 text-[10px] font-black rounded-full flex items-center justify-center ${compact ? 'absolute -top-1 right-0.5 xl:static' : ''}`}>
                        {n > 9 ? '9+' : n}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied */}
      <div className={`py-3 border-t border-white/[0.05] space-y-0.5 ${compact ? 'px-2.5 xl:px-3' : 'px-3'}`}>
        <Link href="/" title="Voir le site" className={`flex items-center gap-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-gold-400 font-body transition-all hover:bg-white/[0.04] ${compact ? 'justify-center xl:justify-start xl:px-3' : 'px-3'}`}>
          <Globe size={16} /><span className={lbl}>Voir le site</span>
        </Link>
        <button onClick={handleLogout} title="Déconnexion"
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.07] font-body transition-all ${compact ? 'justify-center xl:justify-start xl:px-3' : 'px-3'}`}>
          <LogOut size={16} /><span className={lbl}>Déconnexion</span>
        </button>
      </div>
    </>
    );
  };

  // Onglets du bas (téléphone)
  const TABS = [
    { href: '/admin',          label: 'Accueil',      icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Réservations', icon: CalendarCheck, n: pendingCount },
    { href: '/admin/planning', label: 'Planning',     icon: CalendarRange },
    { href: '/admin/leads',    label: 'Leads',        icon: UserPlus, n: leadsCount },
  ];

  return (
    <div className="admin-ui min-h-screen bg-[#0b0b0b] flex font-body">
      <Head>
        {/* Hide Ibrahim widget on all admin pages */}
        <style>{`[id*="ibr"],[class*="ibr"],[id*="ibrahim"],[id*="widget-root"],[id*="chatbot"],[id*="chat-widget"]{display:none!important}`}</style>
      </Head>

      {/* Téléphone : menu complet en tiroir */}
      {sidebar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebar(false)} />
      )}
      <aside className={`md:hidden fixed top-0 left-0 h-screen w-72 bg-[#0a0a0a] border-r border-gold-500/10 flex flex-col z-50 transition-transform duration-300 ${
        sidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Tablette : rail d'icônes · PC : barre complète */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[76px] xl:w-64 flex-shrink-0 flex-col z-30 bg-[#090909] border-r border-white/[0.05] relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-gold-500/0 via-gold-500/25 to-gold-500/0" />
        <SidebarContent compact />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(226,182,20,0.08),transparent_65%)]" />

        {/* Barre du haut */}
        <header className="bg-[#0b0b0b]/80 backdrop-blur-xl px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20 border-b border-white/[0.05]">
          <div className="flex items-center gap-3 min-w-0">
            <img src={settings.logo_url || '/logo.png'} alt="" className="md:hidden w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(226,182,20,0.45)]" />
            <div className="min-w-0">
              <h1 className="font-display text-white font-bold text-lg md:text-xl leading-tight truncate">{pageTitle}</h1>
              <p className="text-white/30 text-[11px] font-body hidden sm:block capitalize">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setJump(true)} aria-label="Rechercher une page"
              className="hidden lg:flex items-center gap-2 w-64 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/30 hover:border-gold-500/30 hover:text-white/60 text-xs transition-all">
              <Search size={14} /><span className="flex-1 text-left">Aller à une page…</span>
              <kbd className="text-[10px] border border-white/10 rounded px-1.5">Ctrl K</kbd>
            </button>
            <button onClick={() => setJump(true)} aria-label="Rechercher une page"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white/45 hover:text-white bg-white/[0.03] border border-white/[0.07] transition-all">
              <Search size={16} />
            </button>
            {pendingCount > 0 && (
              <Link href="/admin/bookings"
                className="relative flex items-center gap-2 bg-gold-500/10 border border-gold-500/25 rounded-xl px-3 py-2 text-gold-400 text-xs font-semibold hover:bg-gold-500/15 transition-all">
                <Bell size={14} className="animate-pulse" />
                <span>{pendingCount}<span className="hidden sm:inline"> en attente</span></span>
              </Link>
            )}
            <span className="hidden md:block">
              <Link href="/" target="_blank" className="btn-gold px-4 py-2 text-xs">
                <Globe size={14} />Voir le site
              </Link>
            </span>
          </div>
        </header>

        <QuickJump open={jump} onClose={() => setJump(false)} />

        {/* Content */}
        <main className="relative flex-1 p-4 md:p-6 xl:p-8 pb-28 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Téléphone : onglets en bas */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gold-500/15"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="grid grid-cols-5">
          {TABS.map(({ href, label, icon: Icon, n }) => {
            const active = isActive(router.pathname, href);
            return (
              <Link key={href} href={href} className={`relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-medium ${active ? 'text-gold-400' : 'text-white/40'}`}>
                {active && <span className="absolute top-0 w-8 h-[2px] rounded-b-full bg-gold-400 shadow-[0_0_10px_rgba(226,182,20,0.8)]" />}
                <span className="relative">
                  <Icon size={20} />
                  {n > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-gold-500 text-noir-950 text-[9px] font-black rounded-full flex items-center justify-center">{n > 9 ? '9+' : n}</span>}
                </span>
                {label}
              </Link>
            );
          })}
          <button onClick={() => setSidebar(true)} className="flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-medium text-white/40">
            <Menu size={20} />Menu
          </button>
        </div>
      </nav>
    </div>
  );
}
