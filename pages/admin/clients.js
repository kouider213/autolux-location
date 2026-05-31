import Head from 'next/head';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Phone, Search, X } from 'lucide-react';

export default function ClientsPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('bookings')
      .select('*, cars(name, resale_price, image_url)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAllBookings(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build client list from bookings (group by phone)
  const clients = Object.values(
    allBookings.reduce((acc, b) => {
      const key = b.client_phone || b.client_name;
      if (!acc[key]) {
        acc[key] = {
          name:     b.client_name,
          phone:    b.client_phone,
          email:    b.client_email,
          age:      b.client_age,
          passport: b.client_passport,
          bookings: [],
          total:    0,
        };
      }
      acc[key].bookings.push(b);
      acc[key].total += Number(b.final_price || 0);
      // Update with latest info
      if (b.client_email) acc[key].email = b.client_email;
      if (b.client_passport) acc[key].passport = b.client_passport;
      return acc;
    }, {})
  ).sort((a, b) => b.bookings.length - a.bookings.length);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const totalClients    = clients.length;
  const repeatClients   = clients.filter(c => c.bookings.length > 1).length;
  const totalRevenue    = clients.reduce((s, c) => s + c.total, 0);

  const statusColor = (s) => ({
    PENDING:   'text-amber-400 bg-amber-500/10',
    CONFIRMED: 'text-emerald-400 bg-emerald-500/10',
    ACTIVE:    'text-emerald-400 bg-emerald-500/10',
    COMPLETED: 'text-blue-400 bg-blue-500/10',
    REJECTED:  'text-red-400 bg-red-500/10',
  }[s] || 'text-white/40 bg-white/5');

  return (
    <>
      <Head><title>Clients — Fik Admin</title></Head>
      <AdminLayout title="Clients">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Clients total',   value: totalClients,                   icon: '👥' },
            { label: 'Clients fidèles', value: repeatClients,                  icon: '⭐' },
            { label: 'CA clients',      value: `${totalRevenue.toFixed(0)}€`,  icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display font-black text-2xl text-gold-400">{value}</div>
              <div className="text-white/30 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email..."
            className="input-dark pl-10 py-2.5 text-sm w-full" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Client list */}
            <div className="space-y-2.5">
              <p className="text-white/30 text-xs mb-3">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
              {filtered.length === 0 && (
                <p className="text-white/20 text-sm text-center py-10">Aucun client trouvé.</p>
              )}
              {filtered.map((client) => (
                <button key={client.phone || client.name}
                  onClick={() => setSelected(selected?.phone === client.phone ? null : client)}
                  className={`w-full text-left bg-[#141414] border rounded-2xl p-4 transition-all hover:border-gold-500/20 ${
                    selected?.phone === client.phone ? 'border-gold-500/30 bg-gold-500/[0.04]' : 'border-white/[0.06]'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{client.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{client.name}</p>
                        <p className="text-white/35 text-xs">{client.phone}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-gold-400 font-bold text-sm">{client.total.toFixed(0)}€</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {client.bookings.length > 1 && (
                          <span className="text-emerald-400/80 text-[9px] font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            Fidèle
                          </span>
                        )}
                        <span className="text-white/25 text-xs">{client.bookings.length} rés.</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Client detail */}
            <div>
              {selected ? (
                <div className="bg-[#141414] border border-gold-500/20 rounded-2xl p-5 sticky top-24">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                      <p className="text-white/35 text-sm">{selected.phone}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Âge',        value: selected.age ? `${selected.age} ans` : '—' },
                      { label: 'Email',       value: selected.email || '—' },
                      { label: 'Passeport',   value: selected.passport || '—' },
                      { label: 'Réservations', value: selected.bookings.length },
                      { label: 'Total dépensé', value: `${selected.total.toFixed(0)}€` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                        <p className="text-white/30 text-xs mb-0.5">{label}</p>
                        <p className="text-white font-semibold text-sm">{value}</p>
                      </div>
                    ))}
                    <a href={`tel:${selected.phone}`}
                      className="flex items-center justify-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl p-3 text-gold-400 text-sm font-medium hover:bg-gold-500/15 transition-all col-span-2">
                      <Phone size={14} />Appeler
                    </a>
                  </div>

                  <h3 className="text-white/40 text-xs uppercase tracking-widest mb-3">Historique</h3>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {selected.bookings.map((b) => (
                      <div key={b.id} className="bg-white/[0.03] rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-medium text-sm">{b.cars?.name || 'Véhicule'}</p>
                            <p className="text-white/35 text-xs mt-0.5">{b.start_date} → {b.end_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gold-400 font-semibold text-sm">{b.final_price}€</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-8 text-center text-white/20">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Cliquez sur un client pour voir son historique</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
