import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { generateContract } from '../../lib/pdf';
import { Search, MessageCircle, FileText, Check, X, ChevronRight, User, Car, Calendar, Phone, CreditCard, Tag, CalendarCheck } from 'lucide-react';

const STATUS_LABELS = {
  PENDING:   { label: 'En attente',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ACCEPTED:  { label: 'Acceptée',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CONFIRMED: { label: 'Confirmée',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  ACTIVE:    { label: 'En cours',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  COMPLETED: { label: 'Terminée',    cls: 'bg-white/10 text-white/50 border-white/10' },
  REJECTED:  { label: 'Refusée',     cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status, cls: 'bg-white/10 text-white/40 border-white/10' };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls} whitespace-nowrap`}>{s.label}</span>;
}

function calcDays(b) {
  if (b.nb_days && Number(b.nb_days) > 0) return Number(b.nb_days);
  if (b.start_date && b.end_date) {
    const d = Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000);
    return d > 0 ? d : 1;
  }
  return 1;
}

export default function BookingsPage() {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('Tous');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [editPrice, setEditPrice]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [profile, setProfile]         = useState(null);

  useEffect(() => {
    loadBookings();
    if (!supabase) return;
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
    if (!supabase) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(name, base_price, resale_price, category, image_url)')
      .order('created_at', { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (bookingId, status, price) => {
    setActionLoading(true);
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status, ...(status === 'ACCEPTED' && price ? { final_price: Number(price) } : {}) } : b
    ));
    if (selected?.id === bookingId) setSelected(prev => ({ ...prev, status }));

    const body = { bookingId, status };
    if (status === 'ACCEPTED' && price !== undefined) body.finalPrice = price;

    const res = await fetch('/api/update-booking-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { toast.error('Erreur : ' + (data.error || 'impossible')); await loadBookings(); setActionLoading(false); return; }
    toast.success(status === 'ACCEPTED' ? 'Réservation acceptée' : 'Réservation refusée');

    // Auto WhatsApp quand acceptée
    if (status === 'ACCEPTED') {
      const bk = bookings.find(b => b.id === bookingId) || selected;
      if (bk) {
        const phone = bk.client_phone?.replace(/\D/g, '');
        const msg = `✅ *Confirmation de réservation — Fik Conciergerie*\n\nBonjour ${bk.client_name},\n\nVotre réservation est *confirmée* !\n\n🚗 *Véhicule :* ${bk.cars?.name || '—'}\n📅 *Départ :* ${bk.start_date}\n📅 *Retour :* ${bk.end_date}\n💰 *Total :* ${bk.final_price || editPrice}€\n\nMerci de votre confiance — Fik Conciergerie 🙏`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    }

    // Notify Dzaryx
    fetch('/api/notify-dzaryx', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'booking_status', data: { id: bookingId, status, car_name: selected?.cars?.name, client_name: selected?.client_name } }),
    }).catch(() => {});

    if (status === 'ACCEPTED') {
      const bk = bookings.find(b => b.id === bookingId) || selected;
      if (bk) fetch('/api/calendar-event', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: bk.client_name, clientPhone: bk.client_phone, carName: bk.cars?.name || '—', startDate: bk.start_date, endDate: bk.end_date, nbDays: bk.nb_days || 1, finalPrice: price || bk.final_price, notes: bk.notes || '' }),
      }).then(r => r.json()).then(d => { if (d.success) toast.success('Google Calendar mis à jour'); }).catch(() => {});
    }

    await loadBookings();
    setActionLoading(false);
  };

  const setRentedBy = async (bookingId, rentedBy) => {
    if (!supabase) return;
    await supabase.from('bookings').update({ rented_by: rentedBy }).eq('id', bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, rented_by: rentedBy } : b));
    if (selected?.id === bookingId) setSelected(prev => ({ ...prev, rented_by: rentedBy }));
    toast.success(`Géré par ${rentedBy}`);
  };

  const handleWhatsApp = (b) => {
    const phone = b.client_phone?.replace(/\D/g, '');
    const msg = b.status === 'REJECTED'
      ? `Bonjour ${b.client_name}, malheureusement nous n'avons pas de disponibilité à ces dates. Fik Conciergerie`
      : `✅ *Confirmation — Fik Conciergerie*\n\nBonjour ${b.client_name},\n\nVotre réservation est *confirmée* !\n\n🚗 ${b.cars?.name}\n📅 ${b.start_date} → ${b.end_date}\n💰 ${b.final_price}€\n\nMerci de votre confiance !`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePDF = async (b) => {
    try { await generateContract(b, b.cars); toast.success('Contrat PDF téléchargé'); }
    catch { toast.error('Erreur PDF'); }
  };

  const filters = [
    { key: 'Tous',     label: 'Tous' },
    { key: 'PENDING',  label: 'En attente' },
    { key: 'ACCEPTED', label: 'Acceptées' },
    { key: 'REJECTED', label: 'Refusées' },
  ];

  const filtered = bookings.filter(b => {
    const statusMatch = filter === 'Tous' || b.status === filter;
    const q = search.toLowerCase();
    const searchMatch = !search || b.client_name?.toLowerCase().includes(q) || b.client_phone?.includes(q) || b.cars?.name?.toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const counts = {
    Tous: bookings.length,
    PENDING:  bookings.filter(b => b.status === 'PENDING').length,
    ACCEPTED: bookings.filter(b => ['ACCEPTED','CONFIRMED','ACTIVE','COMPLETED'].includes(b.status)).length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <>
      <Head><title>Réservations — Fik Admin</title></Head>
      <AdminLayout title="Réservations">
        <div className="space-y-5">

          {/* Search + filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher client, véhicule, téléphone..."
                className="input-dark pl-10 w-full py-2.5 text-sm" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={14} /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filter === f.key
                      ? 'bg-gold-500 text-noir-950'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'
                  }`}>
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${filter === f.key ? 'bg-black/20 text-noir-950/70' : 'bg-white/10 text-white/40'}`}>
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 text-center">
              <CalendarCheck size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucune réservation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => {
                const days   = calcDays(b);
                const total  = Number(b.final_price || 0);
                const pC     = Number(b.cars?.resale_price || 0);
                const pH     = Number(b.cars?.base_price   || 0);
                const profit = (pC - pH) * days;
                const isKouider = profile?.role === 'kouider';

                return (
                  <div key={b.id}
                    className="bg-[#141414] border border-white/[0.06] hover:border-gold-500/20 rounded-2xl p-4 cursor-pointer transition-all"
                    onClick={() => { setSelected(b); setEditPrice(b.final_price ? String(b.final_price) : ''); }}>

                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Client */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gold-400 font-bold text-sm">{b.client_name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{b.client_name || '—'}</p>
                          <p className="text-white/35 text-xs">{b.client_phone || '—'}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={b.status} />
                        {b.rented_by && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.rented_by === 'Kouider' ? 'bg-gold-500/10 text-gold-500' : 'bg-blue-500/10 text-blue-400'}`}>
                            {b.rented_by}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vehicle + dates */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white/[0.03] rounded-xl p-2.5">
                        <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Véhicule</p>
                        <p className="text-white text-sm font-medium truncate">{b.cars?.name || '—'}</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-2.5">
                        <p className="text-white/25 text-[10px] uppercase tracking-wider mb-0.5">Dates</p>
                        <p className="text-white text-xs">{b.start_date} → {b.end_date}</p>
                        <p className="text-white/40 text-[10px]">{days} jour{days > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-white/25 text-[10px]">Total client</p>
                          <p className="text-gold-400 font-bold text-base">{total > 0 ? `${total}€` : '—'}</p>
                        </div>
                        {isKouider && profit > 0 && (
                          <div>
                            <p className="text-white/25 text-[10px]">Ton bénéfice</p>
                            <p className="text-emerald-400 font-semibold text-sm">+{profit.toFixed(0)}€</p>
                          </div>
                        )}
                        {isKouider && pH > 0 && (
                          <div>
                            <p className="text-white/25 text-[10px]">Part Houari</p>
                            <p className="text-blue-400 text-sm">{(pH * days).toFixed(0)}€</p>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>

                    {/* Quick actions for PENDING */}
                    {b.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.05]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => updateStatus(b.id, 'ACCEPTED', b.final_price)} disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-semibold py-2 rounded-xl transition-all disabled:opacity-50 border border-emerald-500/20">
                          <Check size={14} />Accepter
                        </button>
                        <button onClick={() => updateStatus(b.id, 'REJECTED')} disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold py-2 rounded-xl transition-all disabled:opacity-50 border border-red-500/20">
                          <X size={14} />Refuser
                        </button>
                        <button onClick={() => handleWhatsApp(b)}
                          className="flex items-center justify-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-sm font-semibold px-3 py-2 rounded-xl transition-all border border-[#25D366]/20">
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelected(null)}>
            <div className="bg-[#141414] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.status} />
                  <span className="text-white/25 text-xs font-mono">#{selected.id?.substring(0,8).toUpperCase()}</span>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-all">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* Client */}
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium mb-3">Client</p>
                  <div className="bg-[#1e1e1e] rounded-xl p-4 space-y-2.5">
                    {[
                      [User, 'Nom',        selected.client_name],
                      [Phone, 'Téléphone', selected.client_phone],
                      [CreditCard, 'Âge', selected.client_age ? `${selected.client_age} ans` : '—'],
                      [FileText, 'Passeport', selected.client_passport || '—'],
                      [Tag, 'Email', selected.client_email || '—'],
                    ].map(([Icon, label, val]) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-white/35 text-sm"><Icon size={13} />{label}</div>
                        <span className="text-white text-sm font-medium text-right max-w-[60%] truncate">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Réservation */}
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium mb-3">Réservation</p>
                  <div className="bg-[#1e1e1e] rounded-xl p-4 space-y-2.5">
                    {[
                      [Car,      'Véhicule',  selected.cars?.name || '—'],
                      [Calendar, 'Départ',    selected.start_date || '—'],
                      [Calendar, 'Retour',    selected.end_date   || '—'],
                      [Tag,      'Durée',     `${calcDays(selected)} jour(s)`],
                    ].map(([Icon, label, val]) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-white/35 text-sm"><Icon size={13} />{label}</div>
                        <span className="text-white text-sm font-medium">{val}</span>
                      </div>
                    ))}
                    {selected.notes && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-white/35 text-xs mb-1">Notes</p>
                        <p className="text-white/60 text-sm">{selected.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Finances */}
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium mb-3">Finances</p>
                  <div className="bg-[#1e1e1e] rounded-xl p-4 space-y-3">
                    {selected.status === 'PENDING' ? (
                      <div>
                        <label className="text-white/40 text-xs mb-1.5 block">Prix total (modifiable)</label>
                        <div className="flex items-center gap-2 bg-[#252525] border border-gold-500/30 rounded-xl px-4 py-2.5">
                          <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                            min="0" step="1" placeholder={selected.final_price || '0'}
                            className="bg-transparent text-white text-base w-full outline-none font-semibold" />
                          <span className="text-gold-400 font-bold">€</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Total client</span>
                        <span className="text-gold-400 font-black text-xl">{selected.final_price ? `${selected.final_price}€` : '—'}</span>
                      </div>
                    )}

                    {profile?.role === 'kouider' && (() => {
                      const days = calcDays(selected);
                      const pC   = Number(selected.cars?.resale_price || 0);
                      const pH   = Number(selected.cars?.base_price   || 0);
                      const ben  = (pC - pH) * days;
                      return (
                        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Prix client/jour</span>
                            <span className="text-gold-400 font-semibold">{pC}€/j</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">Part Houari/jour</span>
                            <span className="text-blue-400">−{pH}€/j × {days}j = {(pH*days).toFixed(0)}€</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/[0.06]">
                            <span className="text-emerald-400">Ton bénéfice</span>
                            <span className="text-emerald-400 text-base">+{ben.toFixed(0)}€</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Géré par */}
                <div>
                  <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium mb-3">Géré par</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Kouider', 'Houari', null].map((person) => (
                      <button key={String(person)}
                        onClick={() => setRentedBy(selected.id, person)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          selected.rented_by === person
                            ? person === 'Kouider' ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                            : person === 'Houari' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/10 border-white/20 text-white/50'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60'
                        }`}>
                        {person || 'Non défini'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  {selected.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => updateStatus(selected.id, 'ACCEPTED', editPrice || selected.final_price)}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                        <Check size={15} />{actionLoading ? '...' : 'Accepter'}
                      </button>
                      <button onClick={() => updateStatus(selected.id, 'REJECTED')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold py-3 rounded-xl border border-red-500/20 transition-all disabled:opacity-50">
                        <X size={15} />{actionLoading ? '...' : 'Refuser'}
                      </button>
                    </div>
                  )}
                  <button onClick={() => handleWhatsApp(selected)}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
                    <MessageCircle size={16} />Contacter via WhatsApp
                  </button>
                  {(selected.status === 'ACCEPTED' || selected.status === 'CONFIRMED' || selected.status === 'COMPLETED') && (
                    <button onClick={() => handlePDF(selected)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 font-bold py-3 rounded-xl border border-blue-500/20 transition-all">
                      <FileText size={15} />Télécharger contrat PDF
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
