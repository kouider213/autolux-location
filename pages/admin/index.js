import Head from 'next/head';
import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, TrendingUp, Banknote, CheckCircle2, XCircle, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

// ─── Status badge ──────────────────────────────────────────────────────────
const STATUS = {
  PENDING:   { label: 'En attente',  bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400',   icon: Clock },
  CONFIRMED: { label: 'Confirmée',   bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', icon: CheckCircle2 },
  ACTIVE:    { label: 'En cours',    bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400',    icon: CheckCircle2 },
  COMPLETED: { label: 'Terminée',    bg: 'bg-white/10',       text: 'text-white/50',    dot: 'bg-white/30',    icon: CheckCircle2 },
  REJECTED:  { label: 'Refusée',     bg: 'bg-red-500/15',     text: 'text-red-400',     dot: 'bg-red-400',     icon: XCircle },
  ACCEPTED:  { label: 'Acceptée',    bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', icon: CheckCircle2 },
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

// ─── Delta badge ───────────────────────────────────────────────────────────
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

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, delta, accent, Icon, color }) {
  const colors = {
    gold:    { border: 'border-gold-500/20',    icon: 'bg-gold-500/10 text-gold-400',    val: 'text-white',       sub: 'text-gold-400/60' },
    blue:    { border: 'border-blue-500/20',    icon: 'bg-blue-500/10 text-blue-400',    val: 'text-white',       sub: 'text-blue-400/60' },
    emerald: { border: 'border-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-400', val: 'text-white',    sub: 'text-emerald-400/60' },
    amber:   { border: 'border-amber-500/20',   icon: 'bg-amber-500/10 text-amber-400',  val: 'text-white',       sub: 'text-amber-400/60' },
  }[color] || {};

  return (
    <div className={`bg-[#141414] border ${colors.border} rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <Icon size={18} />
        </div>
        {delta !== undefined && <Delta v={delta} />}
      </div>
      <div>
        <div className={`font-display text-2xl font-bold ${colors.val} leading-none mb-1`}>{value}</div>
        <div className="text-white/40 text-xs font-medium">{label}</div>
        {sub && <div className={`text-[11px] mt-1 ${colors.sub}`}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Finance Card ─────────────────────────────────────────────────────────
function FinanceCard({ title, accent, rows, color }) {
  const c = {
    gold:    { border: 'border-gold-500/25',    title: 'text-gold-400',    accent: 'from-gold-500/10 to-gold-500/5 border-gold-500/20',    val: 'text-gold-300' },
    blue:    { border: 'border-blue-500/25',    title: 'text-blue-400',    accent: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',    val: 'text-blue-300' },
    emerald: { border: 'border-emerald-500/25', title: 'text-emerald-400', accent: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20', val: 'text-emerald-300' },
  }[color] || {};

  return (
    <div className={`bg-[#141414] border ${c.border} rounded-2xl p-5 flex flex-col gap-4`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${c.title}`}>{title}</h3>
      <div className="space-y-2.5">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-white/35 text-xs">{label}</span>
            <span className={`text-sm font-semibold tabular-nums ${highlight ? c.title : 'text-white/80'}`}>{value}</span>
          </div>
        ))}
      </div>
      <div className={`bg-gradient-to-br ${c.accent} border rounded-xl px-4 py-3.5 text-center mt-auto`}>
        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{accent.label}</p>
        <p className={`font-display font-black text-2xl tabular-nums ${c.val}`}>{accent.value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [profile, setProfile]         = useState(null);
  const [recentBookings, setRecent]   = useState([]);
  const [allBookings, setAll]         = useState([]);
  const [loading, setLoading]         = useState(true);

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

  // ── Calculs (logique inchangée) ──────────────────────────────────────────
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

  // Mois courant vs précédent
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

            {/* ── En-tête ── */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Bonjour, <span className="text-gold-400">{profile?.name}</span>
                </h1>
                <p className="text-white/30 text-sm mt-0.5">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {pending.length > 0 && (
                <a href="/admin/bookings"
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition-all">
                  <AlertCircle size={13} className="animate-pulse" />
                  {pending.length} en attente
                </a>
              )}
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                Icon={CalendarCheck} color="blue"
                label="Réservations totales"
                value={allBookings.length}
                sub={`${thisMonth.length} ce mois`}
              />
              <KpiCard
                Icon={Clock} color="amber"
                label="En attente"
                value={pending.length}
                sub="À confirmer"
              />
              <KpiCard
                Icon={Banknote} color="gold"
                label="CA ce mois"
                value={fmt(thisCA)}
                sub={`vs ${fmt(lastCA)} mois dernier`}
                delta={caDelta}
              />
              <KpiCard
                Icon={TrendingUp} color="emerald"
                label="Bénéfice ce mois"
                value={fmt(thisBen)}
                sub={`vs ${fmt(lastBen)} mois dernier`}
                delta={benDelta}
              />
            </div>

            {/* ── Répartition financière ── */}
            <div>
              <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">Répartition financière</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FinanceCard
                  title="Kouider — Bénéfice"
                  color="gold"
                  rows={[
                    { label: 'CA clients total',    value: fmt(totalRevenue) },
                    { label: 'Payé à Houari',       value: `−${fmt(houariRevenue)}` },
                    { label: 'Bénéfice net',        value: `+${fmt(kouiderProfit)}`, highlight: true },
                    { label: 'Locations gérées',    value: accepted.length },
                  ]}
                  accent={{ label: 'Bénéfice total Kouider', value: fmt(kouiderProfit) }}
                />
                <FinanceCard
                  title="Houari — Propriétaire"
                  color="blue"
                  rows={[
                    { label: 'Part propriétaire',   value: fmt(houariRevenue), highlight: true },
                    { label: 'Locations',           value: accepted.length },
                    { label: 'En attente',          value: pending.length },
                    { label: '% du CA total',       value: `${totalRevenue > 0 ? Math.round((houariRevenue / totalRevenue) * 100) : 0}%` },
                  ]}
                  accent={{ label: 'Revenu total Houari', value: fmt(houariRevenue) }}
                />
                <FinanceCard
                  title="Total combiné"
                  color="emerald"
                  rows={[
                    { label: 'CA total',              value: fmt(totalRevenue),  highlight: true },
                    { label: 'Bénéfice Kouider',      value: fmt(kouiderProfit) },
                    { label: 'Part Houari',           value: fmt(houariRevenue) },
                    { label: 'Réservations acceptées', value: accepted.length },
                  ]}
                  accent={{ label: "Chiffre d'affaires total", value: fmt(totalRevenue) }}
                />
              </div>
            </div>

            {/* ── Réservations récentes ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest">Réservations récentes</h2>
                <a href="/admin/bookings"
                  className="flex items-center gap-1 text-gold-500/70 hover:text-gold-400 text-xs font-medium transition-colors">
                  Voir tout <ArrowRight size={12} />
                </a>
              </div>

              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
                {recentBookings.length === 0 ? (
                  <div className="py-16 text-center">
                    <CalendarCheck size={32} className="text-white/15 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Aucune réservation pour l'instant</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          {['Client', 'Véhicule', 'Dates', 'Montant', profile?.role === 'kouider' && 'Profit', 'Statut'].filter(Boolean).map(h => (
                            <th key={h} className={`px-5 py-3 text-white/25 text-[10px] font-semibold uppercase tracking-widest text-left ${
                              h === 'Montant' || h === 'Profit' || h === 'Statut' ? 'text-right' : ''
                            } ${h === 'Véhicule' ? 'hidden md:table-cell' : ''} ${h === 'Dates' ? 'hidden lg:table-cell' : ''} ${h === 'Profit' ? 'hidden md:table-cell' : ''}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {recentBookings.map((b) => {
                          const total  = Number(b.final_price || 0);
                          const profit = total - getPartHouari(b);
                          return (
                            <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-5 py-3.5">
                                <p className="text-white text-sm font-medium leading-tight">{b.client_name}</p>
                                <p className="text-white/25 text-xs mt-0.5">{b.client_phone}</p>
                              </td>
                              <td className="px-5 py-3.5 hidden md:table-cell">
                                <span className="text-white/55 text-sm">{b.cars?.name || '—'}</span>
                              </td>
                              <td className="px-5 py-3.5 hidden lg:table-cell">
                                <span className="text-white/35 text-xs tabular-nums">
                                  {b.start_date} → {b.end_date}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <span className="text-gold-400 font-bold text-sm tabular-nums">
                                  {Math.round(total).toLocaleString('fr-FR')} €
                                </span>
                              </td>
                              {profile?.role === 'kouider' && (
                                <td className="px-5 py-3.5 text-right hidden md:table-cell">
                                  <span className="text-emerald-400 text-sm tabular-nums font-semibold">
                                    +{Math.round(profit).toLocaleString('fr-FR')} €
                                  </span>
                                </td>
                              )}
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
