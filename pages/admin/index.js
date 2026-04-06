import Head from 'next/head';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const sub = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadData();
      })
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

    const accepted = bookings.filter(b => b.status === 'ACCEPTED');
    const pending = bookings.filter(b => b.status === 'PENDING');
    const rejected = bookings.filter(b => b.status === 'REJECTED');

    let computedStats = {};

    if (prof?.role === 'kouider') {
      const totalRevenue = accepted.reduce((sum, b) => sum + (Number(b.final_price) * (b.nb_days || 1)), 0);
      const totalProfit = accepted.reduce((sum, b) => sum + (Number(b.profit) * (b.nb_days || 1)), 0);
      computedStats = {
        cards: [
          { label: 'Chiffre d\'affaires', value: `${totalRevenue.toFixed(0)} €`, icon: '💰', color: 'gold' },
          { label: 'Profit net', value: `${totalProfit.toFixed(0)} €`, icon: '📈', color: 'emerald' },
          { label: 'Réservations totales', value: bookings.length, icon: '📅', color: 'blue' },
          { label: 'En attente', value: pending.length, icon: '⏳', color: 'amber' },
        ],
      };
    } else {
      const totalRevenue = accepted.reduce((sum, b) => sum + (Number(b.base_price_snapshot) * (b.nb_days || 1)), 0);
      computedStats = {
        cards: [
          { label: 'Revenu propriétaire', value: `${totalRevenue.toFixed(0)} €`, icon: '💰', color: 'gold' },
          { label: 'Réservations acceptées', value: accepted.length, icon: '✅', color: 'emerald' },
          { label: 'En attente', value: pending.length, icon: '⏳', color: 'amber' },
          { label: 'Refusées', value: rejected.length, icon: '❌', color: 'red' },
        ],
      };
    }

    setStats(computedStats);
    setRecentBookings(bookings.slice(0, 8));
    setLoading(false);
  };

  const colorMap = {
    gold: 'bg-gold-500/15 text-gold-400 border-gold-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const statusBadge = (status) => ({
    PENDING: <span className="badge-pending">En attente</span>,
    ACCEPTED: <span className="badge-accepted">Acceptée</span>,
    REJECTED: <span className="badge-rejected">Refusée</span>,
  }[status] || status);

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
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Bonjour, {profile?.name} 👋
              </h1>
              <p className="text-white/30 mt-1 text-sm">
                Vue d'ensemble de votre activité
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats?.cards.map((card) => (
                <div key={card.label} className={`card-dark p-5 border ${colorMap[card.color]}`}>
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <div className="font-display text-2xl font-bold text-white mb-1">{card.value}</div>
                  <div className="text-white/40 text-xs">{card.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Réservations récentes</h2>
                <a href="/admin/bookings" className="text-gold-500 text-sm hover:underline">
                  Voir tout →
                </a>
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
                          <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Prix</th>
                          <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-white text-sm font-medium">{b.client_name}</p>
                                <p className="text-white/30 text-xs">{b.client_phone}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <span className="text-white/60 text-sm">{b.cars?.name || '—'}</span>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-white/40 text-xs">{b.start_date} → {b.end_date}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-gold-500 font-semibold text-sm">
                                {(Number(b.final_price) * (b.nb_days || 1)).toFixed(0)} €
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {statusBadge(b.status)}
                            </td>
                          </tr>
                        ))}
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