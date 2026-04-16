import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { generateContract } from '../../lib/pdf';

const STATUS_FILTERS = ['Tous', 'PENDING', 'ACCEPTED', 'REJECTED'];

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [profile, setProfile] = useState(null);

  useEffect(() => {
        loadBookings();
        supabase.auth.getSession().then(({ data: { session } }) => {
                if (session)
                          supabase.from('profiles').select('*').eq('id', session.user.id).single()
                    .then(({ data }) => setProfile(data));
        });
        const sub = supabase.channel('bookings-admin')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadBookings)
          .subscribe();
        return () => supabase.removeChannel(sub);
  }, []);

  const loadBookings = async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, cars(name, base_price, resale_price, category)')
          .order('created_at', { ascending: false });
        if (!error) setBookings(data || []);
        setLoading(false);
  };

  const updateStatus = async (bookingId, status, price) => {
        setActionLoading(true);

        // ✅ Optimistic update IMMEDIAT — la liste se met à jour avant même la réponse API
        setBookings(prev =>
                prev.map(b =>
                          b.id === bookingId
                                   ? { ...b, status, ...(status === 'ACCEPTED' && price ? { final_price: Number(price) } : {}) }
                            : b
                               )
                        );
        if (selected?.id === bookingId) {
                setSelected(prev => ({
                          ...prev,
                          status,
                          ...(status === 'ACCEPTED' && price ? { final_price: Number(price) } : {}),
                }));
        }

        const body = { bookingId, status };
        if (status === 'ACCEPTED' && price !== undefined) body.finalPrice = price;

        const _res = await fetch('/api/update-booking-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
        });
        const _data = await _res.json();

        if (!_res.ok) {
                toast.error('Erreur : ' + (_data.error || 'mise à jour impossible'));
                // Rollback : recharger les vraies données depuis la DB
          await loadBookings();
                setActionLoading(false);
                return;
        }

        toast.success(status === 'ACCEPTED' ? '✅ Réservation acceptée' : '❌ Réservation refusée');

        // Google Calendar si ACCEPTED
        if (status === 'ACCEPTED') {
                const bk = bookings.find(b => b.id === bookingId) || selected;
                if (bk) {
                          fetch('/api/calendar-event', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                                    clientName: bk.client_name,
                                                    clientPhone: bk.client_phone,
                                                    carName: bk.cars?.name || '—',
                                                    startDate: bk.start_date,
                                                    endDate: bk.end_date,
                                                    nbDays: bk.nb_days || 1,
                                                    finalPrice: price || bk.final_price,
                                                    notes: bk.notes || '',
                                      }),
                          })
                            .then(r => r.json())
                            .then(d => {
                                          if (d.success) toast.success('📅 Événement Google Calendar créé');
                                          else if (d.error) console.warn('Calendar:', d.error, d.hint || '');
                            })
                            .catch(() => {});
                }
        }

        // Sync finale avec la DB pour confirmer
        await loadBookings();
        setActionLoading(false);
  };

  const openDetail = (b) => {
        setSelected(b);
        setEditPrice(b.final_price !== null && b.final_price !== undefined ? String(b.final_price) : '');
  };

  const handlePDF = async (booking) => {
        try {
                await generateContract(booking, booking.cars);
                toast.success('Contrat PDF téléchargé');
        } catch (e) {
                toast.error('Erreur génération PDF');
        }
  };

  const handleWhatsApp = (booking) => {
        const car = booking.cars;
        const phone = booking.client_phone?.replace(/\D/g, '');
        let msg;
        if (booking.status === 'REJECTED') {
                msg = `Bonjour ${booking.client_name}, malheureusement nous n'avons pas de disponibilité à ces dates.`;
        } else {
                const total = (Number(booking.final_price) * (booking.nb_days || 1)).toFixed(0);
                msg = `✅ *Confirmation de réservation*\n\nBonjour ${booking.client_name},\n\nVotre réservation a été *confirmée* !\n\n🚗 *Véhicule :* ${car?.name}\n📅 *Du :* ${booking.start_date}\n📅 *Au :* ${booking.end_date}\n⏱ *Durée :* ${booking.nb_days} jour(s)\n💰 *Total :* ${total} €\n\nMerci de votre confiance. À bientôt !`;
        }
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ✅ Filtrage correct : comparaison stricte sur b.status
  const filtered = bookings.filter(b => {
        const statusMatch = filter === 'Tous' || b.status === filter;
        const searchMatch =
                !search ||
                b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                b.client_phone?.includes(search) ||
                b.cars?.name?.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
  });

  // Compteurs par statut pour les badges
  const counts = {
        PENDING: bookings.filter(b => b.status === 'PENDING').length,
        ACCEPTED: bookings.filter(b => b.status === 'ACCEPTED').length,
        REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
  };

  const StatusBadge = ({ status }) => {
        const map = { PENDING: 'badge-pending', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected' };
        const labels = { PENDING: 'En attente', ACCEPTED: 'Acceptée', REJECTED: 'Refusée' };
        return <span className={map[status] || 'badge-pending'}>{labels[status] || status}</span>;
};

  return (
        <>
          <Head><title>Réservations — Fik Conciergerie Admin</title></Head>
          <AdminLayout>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-white">Réservations</h1>
              <p className="text-white/30 text-sm mt-1">{bookings.length} réservation(s) au total</p>
    </div>
    </div>

          <div className="flex flex-col sm:flex-row gap-3">
                <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
                              placeholder="Rechercher un client, véhicule..."
              className="input-dark max-w-xs"
            />
                            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(f => {
                                const label = f === 'Tous' ? 'Tous' : f === 'PENDING' ? 'En attente' : f === 'ACCEPTED' ? 'Acceptées' : 'Refusées';
                                const count = f !== 'Tous' ? counts[f] : bookings.length;
                                return (
                                                    <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                            filter === f
                                                              ? 'bg-gold-500 text-noir-950 border-gold-500'
                                                              : 'border-white/10 text-white/40 hover:border-gold-500/40'
                                    }`}
                                                    >
                                  {label}
                                                      <span className="ml-1 opacity-60">({count})</span>
                                  </button>
                                                  );
})}
  </div>
  </div>

{loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
  </div>
            ) : filtered.length === 0 ? (
              <div className="card-dark p-16 text-center text-white/30">
                <p className="text-4xl mb-3">📭</p>
                <p>Aucune réservation {filter !== 'Tous' ? `avec le statut "${filter === 'PENDING' ? 'En attente' : filter === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}"` : 'correspondante'}</p>
  </div>
           ) : (
                         <div className="card-dark overflow-hidden">
                           <div className="overflow-x-auto">
                             <table className="w-full min-w-[600px]">
                               <thead>
                                 <tr className="border-b border-white/5 bg-noir-800/50">
                                   <th className="text-left px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider">Client</th>
                       <th className="text-left px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Véhicule</th>
                       <th className="text-left px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Dates</th>
                       <th className="text-right px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider">Total</th>
 {profile?.role === 'kouider' && (
                           <th className="text-right px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Profit</th>
                        )}
                       <th className="text-center px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider">Statut</th>
                       <th className="text-right px-5 py-3.5 text-white/30 text-xs font-medium uppercase tracking-wider">Actions</th>
                         </tr>
                         </thead>
                   <tbody className="divide-y divide-white/5">
                       {filtered.map((b) => {
                                               const total = (Number(b.final_price) * (b.nb_days || 1)).toFixed(0);
                                               const profit = (Number(b.profit) * (b.nb_days || 1)).toFixed(0);
                                               return (
                                                                         <tr
                                                   key={b.id}
                                                               className="hover:bg-white/2 transition-colors cursor-pointer"
                           onClick={() => openDetail(b)}
                         >
                                                       <td className="px-5 py-4">
                                                         <div>
                                                           <p className="text-white font-medium text-sm">{b.client_name}</p>
                               <p className="text-white/30 text-xs">{b.client_phone}</p>
                             </div>
                             </td>
                           <td className="px-5 py-4 hidden sm:table-cell">
                                                         <span className="text-white/60 text-sm">{b.cars?.name || '—'}</span>
  </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                              <div className="text-white/40 text-xs">
                                <p>{b.start_date || '—'}</p>
                              <p>{b.end_date || '—'}</p>
  </div>
  </td>
                          <td className="px-5 py-4 text-right">
                              <span className="text-gold-500 font-bold text-sm">{b.final_price ? total + ' €' : 'Sur devis'}</span>
  </td>
{profile?.role === 'kouider' && (
                              <td className="px-5 py-4 text-right hidden md:table-cell">
                                <span className="text-emerald-400 text-sm">+{profit} €</span>
  </td>
                           )}
                          <td className="px-5 py-4 text-center"><StatusBadge status={b.status} /></td>
                                                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1">
                          {b.status === 'PENDING' && (
                                                            <>
                                                              <button
                                    onClick={() => updateStatus(b.id, 'ACCEPTED', b.final_price)}
                                    disabled={actionLoading}
                                    className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400
