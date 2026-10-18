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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <img src={settings.logo_url || '/logo.png'} alt="Fik Conciergerie" className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(226,182,20,0.4)]" />
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
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <button onClick={() => { setSidebar(false); setJump(true); }}
          className="w-full flex items-center gap-2.5 mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 text-xs transition-all">
          <Search size={13} />
          <span className="flex-1 text-left">Rechercher une page</span>
          <kbd className="hidden md:inline text-[10px] border border-white/10 rounded px-1">Ctrl K</kbd>
        </button>
        {NAV_GROUPS.map(g => (
          <div key={g.title} className="mb-3">
            <p className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/20">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(router.pathname, href);
                const n = badge === 'pending' ? pendingCount : badge === 'leads' ? leadsCount : 0;
                return (
                  <Link key={href} href={href} onClick={() => setSidebar(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium font-body transition-all duration-150 ${
                      active
                        ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                        : 'text-white/45 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}>
                    <Icon size={16} className={active ? 'text-gold-400' : 'text-white/35'} />
                    <span className="flex-1">{label}</span>
                    {n > 0 && (
                      <span className="min-w-[20px] h-5 px-1 bg-gold-500 text-noir-950 text-[10px] font-black rounded-full flex items-center justify-center">
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
            <button onClick={() => setSidebar(true)} aria-label="Ouvrir le menu"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-white font-semibold text-base font-body">{pageTitle}</h1>
              <p className="text-white/25 text-xs font-body hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setJump(true)} aria-label="Rechercher une page"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <Search size={16} />
            </button>
            {pendingCount > 0 && (
              <Link href="/admin/bookings"
                className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl px-3 py-1.5 text-gold-400 text-xs font-medium hover:bg-gold-500/15 transition-all">
                <Bell size={13} className="animate-pulse" />
                {pendingCount} en attente
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/25 font-body">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              {profile?.name}
            </div>
          </div>
        </header>

        <QuickJump open={jump} onClose={() => setJump(false)} />

        {/* Content */}
        <main className="flex-1 p-5 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
