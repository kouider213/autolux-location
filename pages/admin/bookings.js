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
  const [actionLoading, setActionLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadBookings();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) supabase.from('profiles').select('*').eq('id', session.user.id).single()
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

  const updateStatus = async (bookingId, status) => {
    setActionLoading(true);
    const _res = await fetch('/api/update-booking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status })
    });
    const _data = await _res.json();
    const error = !_res.ok ? _data.error : null;
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(status === 'ACCEPTED' ? '✅ Réservation acceptée' : '❌ Réservation refusée');
      if (selected?.id === bookingId) setSelected(prev => ({ ...prev, status }));
      // Switch to 'Tous' after rejection so the booking stays visible
      if (status === 'REJECTED') setFilter('Tous');
      loadBookings();
    }
    setActionLoading(false);
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
    const total = (Number(booking.final_price) * (booking.nb_days || 1)).toFixed(0);
    const msg = `✅ *Confirmation de réservation*\n\nBonjour ${booking.client_name},\n\nVotre réservation a été *confirmée* !\n\n🚗 *Véhicule :* ${car?.name}\n📅 *Du :* ${booking.start_date}\n📅 *Au :* ${booking.end_date}\n⏱ *Durée :* ${booking.nb_days} jour(s)\n💰 *Total :* ${total} €\n\nMerci de votre confiance. À bientôt !`;
    const phone = booking.client_phone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = bookings.filter(b => {
    const statusMatch = filter === 'Tous' || b.status === filter;
    const searchMatch = !search ||
      b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.client_phone?.includes(search) ||
      b.cars?.name?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

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
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client, véhicule..."
              className="input-dark max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filter === f
                      ? 'bg-gold-500 text-noir-950 border-gold-500'
                      : 'border-white/10 text-white/40 hover:border-gold-500/40'
                  }`}
                >
                  {f === 'Tous' ? 'Tous' : f === 'PENDING' ? 'En attente' : f === 'ACCEPTED' ? 'Acceptées' : 'Refusées'}
                  {f !== 'Tous' && (
                    <span className="ml-1 opacity-60">
                      ({bookings.filter(b => b.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-dark p-16 text-center text-white/30">
              <p className="text-4xl mb-3">📭</p>
              <p>Aucune réservation correspondante</p>
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
                        <tr key={b.id} className="hover:bg-white/2 transition-colors cursor-pointer"
                          onClick={() => setSelected(b)}>
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
                            <span className="text-gold-500 font-bold text-sm">
                              {b.final_price ? total + ' €' : 'Sur devis'}
                            </span>
                          </td>
                          {profile?.role === 'kouider' && (
                            <td className="px-5 py-4 text-right hidden md:table-cell">
                              <span className="text-emerald-400 text-sm">+{profit} €</span>
                            </td>
                          )}
                          <td className="px-5 py-4 text-center">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {b.status === 'PENDING' && (
                                <>
                                  <button onClick={() => updateStatus(b.id, 'ACCEPTED')} disabled={actionLoading}
                                    className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    title="Accepter">✓</button>
                                  <button onClick={() => updateStatus(b.id, 'REJECTED')} disabled={actionLoading}
                                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    title="Refuser">✕</button>
                                </>
                              )}
                              <button onClick={() => handleWhatsApp(b)}
                                className="bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                                title="WhatsApp">💬</button>
                              {b.status === 'ACCEPTED' && (
                                <button onClick={() => handlePDF(b)}
                                  className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                                  title="Télécharger PDF">📄</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <div className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Détail réservation</h2>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xl">×</button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selected.status} />
                  <span className="text-white/30 text-xs font-mono">#{selected.id?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Client</p>
                  <div className="space-y-2">
                    {[
                      ['Nom', selected.client_name],
                      ['Téléphone', selected.client_phone],
                      ['Email', selected.client_email || '—'],
                      ['Âge', `${selected.client_age} ans`],
                      ['Passeport', selected.client_passport || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-white/40">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Réservation</p>
                  <div className="space-y-2">
                    {[
                      ['Véhicule', selected.cars?.name || '—'],
                      ['Départ', selected.start_date || '—'],
                      ['Retour', selected.end_date || '—'],
                      ['Durée', selected.nb_days ? `${selected.nb_days} jour(s)` : '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-white/40">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-noir-800 rounded-xl p-4">
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Tarification</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Prix / jour</span>
                      <span className="text-white">{selected.final_price ? selected.final_price + ' €' : 'Sur devis'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Durée</span>
                      <span className="text-white">{selected.nb_days || '—'} j</span>
                    </div>
                    {selected.final_price && (
                      <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-gold-500">{(selected.final_price * (selected.nb_days || 1)).toFixed(0)} €</span>
                      </div>
                    )}
                    {profile?.role === 'kouider' && (
                      <div className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-emerald-400/60">Profit</span>
                        <span className="text-emerald-400 font-bold">+{(selected.profit * (selected.nb_days || 1)).toFixed(0)} €</span>
                      </div>
                    )}
                  </div>
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-white/50 text-sm bg-noir-800 rounded-lg p-3">{selected.notes}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-2">
                  {selected.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => updateStatus(selected.id, 'ACCEPTED')} disabled={actionLoading}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                        ✓ Accepter
                      </button>
                      <button onClick={() => updateStatus(selected.id, 'REJECTED')} disabled={actionLoading}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                        ✕ Refuser
                      </button>
                    </div>
                  )}
                  <button onClick={() => handleWhatsApp(selected)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                    💬 Contacter via WhatsApp
                  </button>
                  {selected.status === 'ACCEPTED' && (
                    <button onClick={() => handlePDF(selected)}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      📄 Télécharger le contrat PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
