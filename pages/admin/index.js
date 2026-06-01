import Head from 'next/head';
import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, TrendingUp, Banknote, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const STATUS = {
  PENDING:   { label: 'En attente',  bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  CONFIRMED: { label: 'Confirmée',   bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  ACTIVE:    { label: 'En cours',    bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  COMPLETED: { label: 'Terminée',    bg: 'bg-white/[0.08]',   text: 'text-white/40',    dot: 'bg-white/25' },
  REJECTED:  { label: 'Refusée',     bg: 'bg-red-500/15',     text: 'text-red-400',     dot: 'bg-red-400' },
  ACCEPTED:  { label: 'Acceptée',    bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, bg: 'bg-white/10', text: 'text-white/40', dot: 'bg-white/30' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Delta({ v }) {
  if (v === null) return null;
  const pos = v >= 0;
  const Icon = pos ? ChevronUp : ChevronDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${pos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      <Icon size={10} /> {Math.abs(v)}%
    </span>
  );
}

function KpiCard({ label, value, sub, delta, Icon, accentColor }) {
  const c = {
    gold:    { line: 'from-gold-500/0 via-gold-500 to-gold-500/0',          glow: 'bg-gold-500/8',    icon: 'bg-gold-500/15 text-gold-400',    grad: 'from-gold-300 to-gold-500' },
    blue:    { line: 'from-blue-500/0 via-blue-500 to-blue-500/0',          glow: 'bg-blue-500/8',    icon: 'bg-blue-500/15 text-blue-400',    grad: 'from-blue-300 to-blue-400' },
    emerald: { line: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0', glow: 'bg-emerald-500/8', icon: 'bg-emerald-500/15 text-emerald-400', grad: 'from-emerald-300 to-emerald-400' },
    amber:   { line: 'from-amber-500/0 via-amber-500 to-amber-500/0',       glow: 'bg-amber-500/8',   icon: 'bg-amber-500/15 text-amber-400',  grad: 'from-amber-300 to-amber-400' },
  }[accentColor];

  return (
    <div className="relative bg-[#141414] border border-white/[0.07] rounded-2xl p-5 overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.line}`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${c.glow} blur-3xl pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon size={18} />
          </div>
          {delta !== undefined && <Delta v={delta} />}
        </div>
        <div className={`font-display text-3xl font-black bg-gradient-to-br ${c.grad} bg-clip-text text-transparent leading-none tabular-nums mb-1.5`}>
          {value}
        </div>
        <div className="text-white/50 text-xs font-semibold">{label}</div>
        {sub && <div className="text-white/25 text-[10px] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function FinanceCard({ title, rows, accent, accentColor }) {
  const c = {
    gold:    { border: 'border-gold-500/25',    title: 'text-gold-400',    line: 'from-gold-500/0 via-gold-500 to-gold-500/0',          glow: 'bg-gold-500/6',    aB: 'from-gold-500/15 to-gold-600/5',    aBorder: 'border-gold-500/25',    val: 'text-gold-300' },
    blue:    { border: 'border-blue-500/25',    title: 'text-blue-400',    line: 'from-blue-500/0 via-blue-500 to-blue-500/0',          glow: 'bg-blue-500/6',    aB: 'from-blue-500/15 to-blue-600/5',    aBorder: 'border-blue-500/25',    val: 'text-blue-300' },
    emerald: { border: 'border-emerald-500/25', title: 'text-emerald-400', line: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0', glow: 'bg-emerald-500/6', aB: 'from-emerald-500/15 to-emerald-600/5', aBorder: 'border-emerald-500/25', val: 'text-emerald-300' },
  }[accentColor];

  return (
    <div className={`relative bg-[#141414] border ${c.border} rounded-2xl p-5 overflow-hidden flex flex-col gap-4`}>
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.line}`} />
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full ${c.glow} blur-3xl pointer-events-none`} />
      <h3 className={`text-[10px] font-black uppercase tracking-[0.15em] ${c.title} relative`}>{title}</h3>
      <div className="space-y-2.5 relative">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-white/30 text-xs">{label}</span>
            <span className={`text-sm font-bold tabular-nums ${highlight ? c.title : 'text-white/70'}`}>{value}</span>
          </div>
        ))}
      </div>
      <div className={`bg-gradient-to-br ${c.aB} border ${c.aBorder} rounded-xl px-4 py-3.5 text-center mt-auto relative`}>
        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">{accent.label}</p>
        <p className={`font-display font-black text-2xl tabular-nums ${c.val}`}>{accent.value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [profile, setProfile]       = useState(null);
  const [recentBookings, setRecent] = useState([]);
  const [allBookings, setAll]       = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    loadData();
    const sub = supabase.channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadData)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, cars(name, base_price, resale_price, category)')
      .order('created_at', { ascending: false });
    if (!bookings) { setLoading(false); return; }
    setAll(bookings);
    setRecent(bookings.slice(0, 8));
    setLoading(false);
  };

  const accepted = allBookings.filter(b => ['ACCEPTED','CONFIRMED','ACTIVE','COMPLETED'].includes(b.status));
  const pending  = allBookings.filter(b => b.status === 'PENDING');

  const getNbDays = (b) => {
    if (b.nb_days && Number(b.nb_days) > 0) return Number(b.nb_days);
    if (b.start_date && b.end_date) {
      const d = Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000);
      return d > 0 ? d : 1;
    }
    return 1;
  };

  const getPrixHouariJour = (b) => {
    if (b.owner_price_per_day && Number(b.owner_price_per_day) > 0) return Number(b.owner_price_per_day);
    return Number(b.cars?.base_price || 0);
  };

  const getPartHouari = (b) => {
    const brute = getPrixHouariJour(b) * getNbDays(b);
    const fp    = Number(b.final_price || 0);
    return brute > fp ? fp : brute;
  };

  const totalRevenue  = accepted.reduce((s, b) => s + Number(b.final_price || 0), 0);
  const houariRevenue = accepted.reduce((s, b) => s + getPartHouari(b), 0);
  const kouiderProfit = totalRevenue - houariRevenue;

  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd   = thisMonthStart;
  const thisMonth = accepted.filter(b => b.created_at >= thisMonthStart);
  const lastMonth = accepted.filter(b => b.created_at >= lastMonthStart && b.created_at < lastMonthEnd);
  const thisCA    = thisMonth.reduce((s, b) => s + Number(b.final_price || 0), 0);
  const lastCA    = lastMonth.reduce((s, b) => s + Number(b.final_price || 0), 0);
  const thisBen   = thisMonth.reduce((s, b) => s + (Number(b.final_price || 0) - getPartHouari(b)), 0);
  const lastBen   = lastMonth.reduce((s, b) => s + (Number(b.final_price || 0) - getPartHouari(b)), 0);
  const caDelta   = lastCA  > 0 ? Math.round(((thisCA  - lastCA)  / lastCA)  * 100) : null;
  const benDelta  = lastBen > 0 ? Math.round(((thisBen - lastBen) / lastBen) * 100) : null;

  const fmt = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;

  return (
    <>
      <Head><title>Dashboard — Fik Conciergerie Admin</title></Head>
      <AdminLayout>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white/30 text-sm">Chargement...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-7">

            {/* En-tête */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Bonjour,{' '}
                  <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                    {profile?.name}
                  </span>
                </h1>
                <p className="text-white/30 text-sm mt-0.5">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {pending.length > 0 && (
                <a href="/admin/bookings"
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-amber-400 text-xs font-bold hover:bg-amber-500/15 transition-all">
                  <AlertCircle size={13} className="animate-pulse" />
                  {pending.length} en attente
                </a>
              )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard Icon={CalendarCheck} accentColor="blue"    label="Réservations"   value={allBookings.length} sub={`${thisMonth.length} ce mois`} />
              <KpiCard Icon={Clock}         accentColor="amber"   label="En attente"     value={pending.length}    sub="À confirmer" />
              <KpiCard Icon={Banknote}      accentColor="gold"    label="CA ce mois"     value={fmt(thisCA)}       sub={`vs ${fmt(lastCA)}`} delta={caDelta} />
              <KpiCard Icon={TrendingUp}    accentColor="emerald" label="Bénéfice mois"  value={fmt(thisBen)}      sub={`vs ${fmt(lastBen)}`} delta={benDelta} />
            </div>

            {/* Répartition financière */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-gold-500/30 to-transparent" />
                <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.15em]">Répartition financière</span>
                <div className="h-px flex-1 bg-gradient-to-l from-gold-500/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FinanceCard
                  title="Kouider — Bénéfice" accentColor="gold"
                  rows={[
                    { label: 'CA total clients',    value: fmt(totalRevenue) },
                    { label: 'Payé à Houari',       value: `−${fmt(houariRevenue)}` },
                    { label: 'Bénéfice net',        value: `+${fmt(kouiderProfit)}`, highlight: true },
                    { label: 'Locations gérées',    value: accepted.length },
                  ]}
                  accent={{ label: 'Bénéfice total Kouider', value: fmt(kouiderProfit) }}
                />
                <FinanceCard
                  title="Houari — Propriétaire" accentColor="blue"
                  rows={[
                    { label: 'Part propriétaire',   value: fmt(houariRevenue), highlight: true },
                    { label: 'Locations',           value: accepted.length },
                    { label: 'En attente',          value: pending.length },
                    { label: '% du CA',             value: `${totalRevenue > 0 ? Math.round((houariRevenue / totalRevenue) * 100) : 0}%` },
                  ]}
                  accent={{ label: 'Revenu total Houari', value: fmt(houariRevenue) }}
                />
                <FinanceCard
                  title="Total combiné" accentColor="emerald"
                  rows={[
                    { label: 'CA total',            value: fmt(totalRevenue), highlight: true },
                    { label: 'Bénéfice Kouider',    value: fmt(kouiderProfit) },
                    { label: 'Part Houari',         value: fmt(houariRevenue) },
                    { label: 'Réservations',        value: accepted.length },
                  ]}
                  accent={{ label: "Chiffre d'affaires", value: fmt(totalRevenue) }}
                />
              </div>
            </div>

            {/* Réservations récentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-px w-6 bg-gradient-to-r from-gold-500/40 to-transparent" />
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.15em]">Réservations récentes</span>
                </div>
                <a href="/admin/bookings"
                  className="flex items-center gap-1 text-gold-500/50 hover:text-gold-400 text-xs font-semibold transition-colors">
                  Voir tout <ArrowRight size={11} />
                </a>
              </div>

              <div className="relative bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {recentBookings.length === 0 ? (
                  <div className="py-16 text-center">
                    <CalendarCheck size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/25 text-sm">Aucune réservation pour l'instant</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          <th className="px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest text-left">Client</th>
                          <th className="px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest text-left hidden md:table-cell">Véhicule</th>
                          <th className="px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest text-left hidden lg:table-cell">Dates</th>
                          <th className="px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest text-right">Montant</th>
                          <th className="px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {recentBookings.map((b) => {
                          const total = Number(b.final_price || 0);
                          return (
                            <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3.5">
                                <p className="text-white text-sm font-semibold leading-tight">{b.client_name}</p>
                                <p className="text-white/20 text-xs mt-0.5">{b.client_phone}</p>
                              </td>
                              <td className="px-5 py-3.5 hidden md:table-cell">
                                <span className="text-white/45 text-sm">{b.cars?.name || '—'}</span>
                              </td>
                              <td className="px-5 py-3.5 hidden lg:table-cell">
                                <span className="text-white/25 text-xs tabular-nums">{b.start_date} → {b.end_date}</span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent font-black text-sm tabular-nums">
                                  {Math.round(total).toLocaleString('fr-FR')} €
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <StatusBadge status={b.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </AdminLayout>
    </>
  );
}
