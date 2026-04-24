import Head from 'next/head';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const sub = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadData())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, cars(name, base_price, resale_price)')
      .order('created_at', { ascending: false });

    if (!bookings) { setLoading(false); return; }
    setAllBookings(bookings);
    setRecentBookings(bookings.slice(0, 8));
    setLoading(false);
  };

  // ─── Calculs financiers ───────────────────────────────────────────────────
  const accepted = allBookings.filter(b => b.status === 'ACCEPTED');
  const pending  = allBookings.filter(b => b.status === 'PENDING');

  // Kouider : prix resale × jours
  const kouiderRevenue = accepted.reduce(
    (s, b) => s + Number(b.resale_price_snapshot || b.cars?.resale_price || 0) * (b.nb_days || 1), 0
  );
  // Houari : prix base × jours
  const houariRevenue = accepted.reduce(
    (s, b) => s + Number(b.base_price_snapshot || b.cars?.base_price || 0) * (b.nb_days || 1), 0
  );
  // Profit Kouider = resale − base
  const kouiderProfit = accepted.reduce(
    (s, b) => s + Number(b.profit || 0) * (b.nb_days || 1), 0
  );
  // Total = somme des final_price (DÉJÀ le total, pas par jour)
  const totalRevenue = accepted.reduce(
    (s, b) => s + Number(b.final_price || 0), 0
  );

  // ─── Badges statut ────────────────────────────────────────────────────────
  const statusBadge = (status) => ({
    PENDING:  <span className="badge-pending">En attente</span>,
    ACCEPTED: <span className="badge-accepted">Acceptée</span>,
    REJECTED: <span className="badge-rejected">Refusée</span>,
  }[status] || <span>{status}</span>);

  // ─── Carte réutilisable ───────────────────────────────────────────────────
  const StatCard = ({ title, color, rows, accent }) => {
    const borderColor = {
      gold:    'border-gold-500/30',
      blue:    'border-blue-500/30',
      emerald: 'border-emerald-500/30',
    }[color];
    const titleColor = {
      gold:    'text-gold-400',
      blue:    'text-blue-400',
      emerald: 'text-emerald-400',
    }[color];
    const dotColor = {
      gold:    'bg-gold-500',
      blue:    'bg-blue-500',
      emerald: 'bg-emerald-500',
    }[color];

    return (
      <div className={`card-dark p-5 border ${borderColor} flex flex-col gap-4`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className={`font-display font-bold text-sm uppercase tracking-wider ${titleColor}`}>{title}</h3>
        </div>
        <div className="space-y-3">
          {rows.map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-white/40 text-xs">{label}</span>
              <span className={`font-semibold text-sm ${highlight ? titleColor : 'text-white'}`}>{value}</span>
            </div>
          ))}
        </div>
        {accent && (
          <div className={`rounded-xl px-4 py-3 text-center bg-${color === 'gold' ? 'gold' : color === 'blue' ? 'blue' : 'emerald'}-500/10 border border-${color === 'gold' ? 'gold' : color === 'blue' ? 'blue' : 'emerald'}-500/20`}>
            <p className="text-white/30 text-xs mb-0.5">{accent.label}</p>
            <p className={`font-display font-bold text-2xl ${titleColor}`}>{accent.value}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head><title>Dashboard — AutoLux Admin</title></Head>
      <AdminLayout>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── En-tête ── */}
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Bonjour, {profile?.name} 👋
              </h1>
              <p className="text-white/30 mt-1 text-sm">Vue d'ensemble de l'activité</p>
            </div>

            {/* ── Résumé rapide ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Réservations totales', value: allBookings.length, icon: '📅', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                { label: 'En attente',            value: pending.length,    icon: '⏳', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                { label: 'Acceptées',             value: accepted.length,   icon: '✅', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
                { label: 'CA total',              value: `${totalRevenue.toFixed(0)} €`, icon: '💰', color: 'bg-gold-500/15 text-gold-400 border-gold-500/20' },
              ].map(card => (
                <div key={card.label} className={`card-dark p-5 border ${card.color}`}>
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <div className="font-display text-2xl font-bold text-white mb-1">{card.value}</div>
                  <div className="text-white/40 text-xs">{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── 3 Cases financières ── */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-4">Répartition financière</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* KOUIDER */}
                <StatCard
                  title="Kouider"
                  color="gold"
                  rows={[
                    { label: 'CA (prix resale)', value: `${kouiderRevenue.toFixed(0)} €`, highlight: true },
                    { label: 'Profit net',        value: `+${kouiderProfit.toFixed(0)} €`, highlight: true },
                    { label: 'Locations gérées',  value: accepted.length },
                    { label: 'En attente',         value: pending.length },
                  ]}
                  accent={{ label: 'Profit total Kouider', value: `${kouiderProfit.toFixed(0)} €` }}
                />

                {/* HOUARI */}
                <StatCard
                  title="Houari (propriétaire)"
                  color="blue"
                  rows={[
                    { label: 'Revenu (prix base)', value: `${houariRevenue.toFixed(0)} €`, highlight: true },
                    { label: 'Locations actives',   value: accepted.length },
                    { label: 'En attente',           value: pending.length },
                    { label: 'Part du CA total',     value: `${totalRevenue > 0 ? ((houariRevenue / totalRevenue) * 100).toFixed(0) : 0}%` },
                  ]}
                  accent={{ label: 'Revenu total Houari', value: `${houariRevenue.toFixed(0)} €` }}
                />

                {/* TOTAL */}
                <StatCard
                  title="Total combiné"
                  color="emerald"
                  rows={[
                    { label: 'CA total',         value: `${totalRevenue.toFixed(0)} €`,  highlight: true },
                    { label: 'Part Kouider',      value: `${kouiderProfit.toFixed(0)} €` },
                    { label: 'Part Houari',        value: `${houariRevenue.toFixed(0)} €` },
                    { label: 'Réservations acc.', value: accepted.length },
                  ]}
                  accent={{ label: 'Chiffre d\'affaires total', value: `${totalRevenue.toFixed(0)} €` }}
                />

              </div>
            </div>

            {/* ── Réservations récentes ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Réservations récentes</h2>
                <a href="/admin/bookings" className="text-gold-500 text-sm hover:underline">Voir tout →</a>
              </div>

              <div className="card-dark overflow-hidden">
                {recentBookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30">
                    <p className="text-3xl mb-3">📭</p>
                    <p>Aucune réservation pour l'instant</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Client</th>
                          <th className="text-left px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Véhicule</th>
                          <th className="text-left px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Dates</th>
                          <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Prix client</th>
                          {profile?.role === 'kouider' && (
                            <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Profit</th>
                          )}
                          <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => {
                          // final_price contient DÉJÀ le total (pas besoin de multiplier)
                          const total  = Number(b.final_price).toFixed(0);
                          const profit = (Number(b.profit) * (b.nb_days || 1)).toFixed(0);
                          return (
                            <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                              <td className="px-5 py-4">
                                <p className="text-white text-sm font-medium">{b.client_name}</p>
                                <p className="text-white/30 text-xs">{b.client_phone}</p>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <span className="text-white/60 text-sm">{b.cars?.name || '—'}</span>
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <span className="text-white/40 text-xs">{b.start_date} → {b.end_date}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-gold-500 font-semibold text-sm">{total} €</span>
                              </td>
                              {profile?.role === 'kouider' && (
                                <td className="px-5 py-4 text-right hidden md:table-cell">
                                  <span className="text-emerald-400 text-sm">+{profit} €</span>
                                </td>
                              )}
                              <td className="px-5 py-4 text-right">{statusBadge(b.status)}</td>
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
