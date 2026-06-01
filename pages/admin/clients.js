import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Search, Users, Repeat2, TrendingUp, Phone, X, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

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

  // Build clients from bookings
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
  const avgValue        = totalClients > 0 ? totalRevenue / totalClients : 0;

  const statusColor = (s) => ({
    PENDING:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CONFIRMED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    ACTIVE:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    COMPLETED: 'text-white/40 bg-white/5 border-white/10',
    REJECTED:  'text-red-400 bg-red-500/10 border-red-500/20',
  }[s] || 'text-white/40 bg-white/5 border-white/10');

  return (
    <>
      <Head><title>Clients — Fik Admin</title></Head>
      <AdminLayout title="Clients">
        <div className="space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { Icon: Users,     color: 'blue',    val: totalClients,                                label: 'Total clients',   glow: 'bg-blue-500/8',    icon: 'bg-blue-500/15 text-blue-400',    line: 'from-blue-500/0 via-blue-500 to-blue-500/0',    grad: 'from-blue-300 to-blue-400' },
              { Icon: Repeat2,   color: 'emerald', val: repeatClients,                               label: 'Clients fidèles', glow: 'bg-emerald-500/8', icon: 'bg-emerald-500/15 text-emerald-400', line: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0', grad: 'from-emerald-300 to-emerald-400' },
              { Icon: TrendingUp,color: 'gold',    val: `${Math.round(totalRevenue).toLocaleString('fr-FR')} €`, label: 'CA total',        glow: 'bg-gold-500/8',    icon: 'bg-gold-500/15 text-gold-400',    line: 'from-gold-500/0 via-gold-500 to-gold-500/0',    grad: 'from-gold-300 to-gold-500' },
              { Icon: Users,     color: 'gold',    val: `${Math.round(avgValue).toLocaleString('fr-FR')} €`,    label: 'Valeur moy.',     glow: 'bg-gold-500/8',    icon: 'bg-gold-500/15 text-gold-400',    line: 'from-gold-500/0 via-gold-500 to-gold-500/0',    grad: 'from-gold-300 to-gold-500' },
            ].map(({ Icon, val, label, glow, icon, line, grad }) => (
              <div key={label} className="relative bg-[#141414] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${line}`} />
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${glow} blur-3xl pointer-events-none`} />
                <div className="relative">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${icon}`}>
                    <Icon size={15} />
                  </div>
                  <div className={`font-display text-2xl font-black bg-gradient-to-br ${grad} bg-clip-text text-transparent tabular-nums leading-none mb-1`}>{val}</div>
                  <div className="text-white/35 text-[11px] font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Nom, téléphone, email..."
              className="input-dark pl-10 py-3 text-sm w-full" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Clients list */}
              <div className="lg:col-span-1 space-y-2">
                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-3">
                  {filtered.length} client{filtered.length !== 1 ? 's' : ''}
                </p>
                {filtered.length === 0 ? (
                  <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-8 text-center text-white/20">
                    <p className="text-sm">Aucun client trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filtered.map((client) => (
                      <button key={client.phone || client.name}
                        onClick={() => setSelected(selected?.phone === client.phone ? null : client)}
                        className={`w-full text-left bg-[#141414] border rounded-2xl p-4 transition-all ${
                          selected?.phone === client.phone
                            ? 'border-gold-500/30 bg-gold-500/[0.04]'
                            : 'border-white/[0.06] hover:border-white/15'
                        }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gold-400 font-bold text-sm">{client.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-sm truncate">{client.name}</p>
                            <p className="text-white/25 text-xs truncate">{client.phone}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-gold-400 font-bold text-xs tabular-nums">
                              {Math.round(client.total).toLocaleString('fr-FR')} €
                            </p>
                            {client.bookings.length > 1 && (
                              <span className="inline-block text-emerald-400/70 text-[9px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-0.5">
                                FIDÈLE
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Client detail */}
              <div className="lg:col-span-2">
                {selected ? (
                  <div className="bg-[#141414] border border-gold-500/20 rounded-2xl p-5 sticky top-24 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20 rounded-full flex items-center justify-center">
                          <span className="text-gold-400 font-bold">{selected.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                          <p className="text-white/35 text-sm">{selected.phone}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white/60">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Âge',         value: selected.age ? `${selected.age} ans` : '—' },
                        { label: 'Email',       value: selected.email ? <a href={`mailto:${selected.email}`} className="text-gold-400 hover:underline">{selected.email}</a> : '—' },
                        { label: 'Passeport',   value: selected.passport || '—' },
                        { label: 'Réservations', value: selected.bookings.length, highlight: true },
                        { label: 'Total dépensé', value: `${Math.round(selected.total).toLocaleString('fr-FR')} €`, highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className={`rounded-xl p-3 ${highlight ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                          <p className="text-white/40 text-xs mb-1">{label}</p>
                          <p className={`text-sm font-semibold ${highlight ? 'text-gold-300' : 'text-white'}`}>{value}</p>
                        </div>
                      ))}
                      <a href={`tel:${selected.phone}`}
                        className="col-span-2 flex items-center justify-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl p-3 text-gold-400 text-sm font-semibold hover:bg-gold-500/15 transition-all">
                        <Phone size={14} /> Appeler
                      </a>
                    </div>

                    {/* Bookings history */}
                    <div className="space-y-3">
                      <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest">Historique réservations</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selected.bookings.map((b) => (
                          <div key={b.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-white font-semibold text-sm">{b.cars?.name || 'Véhicule'}</p>
                                <p className="text-white/25 text-xs mt-0.5">{b.start_date} → {b.end_date}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-gold-400 font-bold text-sm tabular-nums">
                                  {Math.round(b.final_price).toLocaleString('fr-FR')} €
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border font-semibold ${statusColor(b.status)}`}>
                              {b.status === 'COMPLETED' ? <CheckCircle2 size={10} /> : null}
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <Users size={32} className="text-white/15 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Clique sur un client pour voir détails</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
