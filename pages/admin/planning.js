import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import {
  CalendarRange, AlertTriangle, ArrowRightCircle, ArrowLeftCircle, Wallet,
  Phone, ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const DAYS = 30;                       // fenêtre timeline
const ACTIVE = ['PENDING', 'ACCEPTED', 'CONFIRMED', 'ACTIVE'];
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');
const money = (n) => Number(n || 0).toLocaleString('fr-FR');
const iso = (d) => d.toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

const STATUS_BAR = {
  PENDING:   'bg-amber-500/70 border-amber-400',
  ACCEPTED:  'bg-emerald-500/70 border-emerald-400',
  CONFIRMED: 'bg-emerald-500/70 border-emerald-400',
  ACTIVE:    'bg-blue-500/70 border-blue-400',
};

export default function PlanningPage() {
  const [cars, setCars]         = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0);     // décalage fenêtre (semaines)

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [{ data: c }, { data: b }] = await Promise.all([
        supabase.from('cars').select('id, name, image_url').order('name'),
        supabase.from('bookings').select('id, car_id, client_name, client_phone, start_date, end_date, status, final_price, paid_amount, payment_status, currency').in('status', ACTIVE),
      ]);
      setCars(c || []); setBookings(b || []);
      setLoading(false);
    })();
  }, []);

  // Fenêtre de dates
  const start = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + offset * 7); return d; }, [offset]);
  const dates = useMemo(() => Array.from({ length: DAYS }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; }), [start]);
  const windowEnd = dates[DAYS - 1];

  // ── Relances (calculées localement, source = bookings.paid_amount) ──
  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 86400000));
  const reminders = useMemo(() => {
    const departs = [], retours = [], impayes = [], conflits = [];
    for (const b of bookings) {
      if (b.start_date === today || b.start_date === tomorrow) departs.push(b);
      if (b.end_date === today || b.end_date === tomorrow) retours.push(b);
      const paid = Number(b.paid_amount || 0);
      const total = Number(b.final_price || 0);
      // Impayé = voiture remise (départ passé) + statut paiement non soldé + reste > 0
      const unpaidStatus = b.payment_status ? ['PENDING', 'PARTIAL', 'UNPAID'].includes(b.payment_status) : paid < total;
      if (['ACCEPTED', 'CONFIRMED', 'ACTIVE'].includes(b.status) && total > 0 && unpaidStatus && paid < total && b.start_date <= today) {
        impayes.push({ ...b, paid, remaining: total - paid });
      }
    }
    // Double-booking : 2 résas même voiture qui se chevauchent
    const byCar = {};
    for (const b of bookings) (byCar[b.car_id] ||= []).push(b);
    for (const list of Object.values(byCar)) {
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i], c = list[j];
        if (a.start_date <= c.end_date && a.end_date >= c.start_date) conflits.push([a, c]);
      }
    }
    return { departs, retours, impayes, conflits };
  }, [bookings, today, tomorrow]);

  const carName = (id) => cars.find(c => c.id === id)?.name || '—';
  const waLink = (b, kind) => {
    const msg = kind === 'impaye'
      ? `Bonjour ${b.client_name}, petit rappel concernant le solde de votre location ${carName(b.car_id)} : reste ${money(b.remaining)} ${sym(b.currency)}. Merci !`
      : `Bonjour ${b.client_name}, au sujet de votre location ${carName(b.car_id)}.`;
    const phone = (b.client_phone || '').replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) return <AdminLayout title="Planning flotte"><div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout title="Planning flotte">
      <Head><title>Planning flotte — Admin</title></Head>

      {/* ── Relances du jour ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <ReminderCard icon={ArrowRightCircle} color="blue"   label="Départs (auj. + demain)" count={reminders.departs.length} />
        <ReminderCard icon={ArrowLeftCircle}  color="emerald" label="Retours (auj. + demain)" count={reminders.retours.length} />
        <ReminderCard icon={Wallet}           color="amber"  label="Soldes impayés"          count={reminders.impayes.length} />
        <ReminderCard icon={AlertTriangle}    color="red"    label="Conflits de dates"       count={reminders.conflits.length} />
      </div>

      {/* Conflits (alerte forte) */}
      {reminders.conflits.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 mb-6">
          <p className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2"><AlertTriangle size={15} />Double-booking détecté</p>
          {reminders.conflits.map(([a, c], i) => (
            <p key={i} className="text-white/60 text-xs mb-1">
              <span className="text-white font-medium">{carName(a.car_id)}</span> — {a.client_name} ({a.start_date}→{a.end_date}) chevauche {c.client_name} ({c.start_date}→{c.end_date})
            </p>
          ))}
        </div>
      )}

      {/* Impayés avec relance 1-clic */}
      {reminders.impayes.length > 0 && (
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 mb-6">
          <p className="text-amber-400 text-sm font-bold mb-3 flex items-center gap-2"><Wallet size={15} />Soldes à encaisser</p>
          <div className="space-y-2">
            {reminders.impayes.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{b.client_name} · {carName(b.car_id)}</p>
                  <p className="text-white/35 text-xs">Reste <span className="text-amber-400 font-semibold">{money(b.remaining)} {sym(b.currency)}</span> / {money(b.final_price)} {sym(b.currency)}</p>
                </div>
                {b.client_phone && (
                  <a href={waLink(b, 'impaye')} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-[#25D366]/90 hover:bg-[#25D366] text-white text-xs font-semibold px-3 py-2 rounded-lg">
                    <Phone size={12} />Relancer
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline Gantt ────────────────────────────────────── */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <p className="text-white font-semibold text-sm flex items-center gap-2"><CalendarRange size={15} className="text-gold-400" />Calendrier flotte — {DAYS} jours</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setOffset(o => o - 1)} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/60"><ChevronLeft size={15} /></button>
            <button onClick={() => setOffset(0)} className="px-2.5 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/60 text-xs">Auj.</button>
            <button onClick={() => setOffset(o => o + 1)} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/60"><ChevronRight size={15} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* En-tête dates */}
            <div className="flex border-b border-white/[0.06] sticky top-0 bg-[#141414] z-10">
              <div className="w-36 shrink-0 px-3 py-2 text-white/30 text-[10px] uppercase tracking-wider">Véhicule</div>
              <div className="flex-1 flex">
                {dates.map((d, i) => {
                  const we = d.getDay() === 5 || d.getDay() === 6;
                  const isToday = iso(d) === today;
                  return (
                    <div key={i} className={`flex-1 text-center py-2 border-l border-white/[0.04] ${we ? 'bg-white/[0.02]' : ''} ${isToday ? 'bg-gold-500/10' : ''}`}>
                      <div className={`text-[9px] ${isToday ? 'text-gold-400 font-bold' : 'text-white/25'}`}>{d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</div>
                      <div className={`text-[10px] ${isToday ? 'text-gold-400 font-bold' : 'text-white/40'}`}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lignes par voiture */}
            {cars.map(car => {
              const carBookings = bookings.filter(b => b.car_id === car.id);
              return (
                <div key={car.id} className="flex border-b border-white/[0.04] hover:bg-white/[0.015]">
                  <div className="w-36 shrink-0 px-3 py-3 flex items-center gap-2">
                    {car.image_url && <img src={car.image_url} alt="" className="w-7 h-7 rounded object-cover" />}
                    <span className="text-white/70 text-xs font-medium truncate">{car.name}</span>
                  </div>
                  <div className="flex-1 relative" style={{ minHeight: '44px' }}>
                    {/* grille */}
                    <div className="absolute inset-0 flex">
                      {dates.map((d, i) => {
                        const we = d.getDay() === 5 || d.getDay() === 6;
                        return <div key={i} className={`flex-1 border-l border-white/[0.03] ${we ? 'bg-white/[0.015]' : ''}`} />;
                      })}
                    </div>
                    {/* barres résa */}
                    {carBookings.map(b => {
                      const s = Math.max(0, dayDiff(b.start_date, iso(start)));
                      const e = Math.min(DAYS - 1, dayDiff(b.end_date, iso(start)));
                      if (e < 0 || s > DAYS - 1) return null;
                      const left = (s / DAYS) * 100;
                      const width = ((e - s + 1) / DAYS) * 100;
                      return (
                        <Link key={b.id} href="/admin/bookings"
                          title={`${b.client_name} · ${b.start_date}→${b.end_date} · ${b.status}`}
                          className={`absolute top-1.5 h-8 rounded-md border-l-2 ${STATUS_BAR[b.status] || 'bg-white/30 border-white/40'} flex items-center px-1.5 overflow-hidden`}
                          style={{ left: `${left}%`, width: `${width}%` }}>
                          <span className="text-[10px] text-white font-medium truncate drop-shadow">{b.client_name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {cars.length === 0 && <p className="text-white/30 text-sm py-10 text-center">Aucun véhicule.</p>}
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-white/[0.06] text-[10px] text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/70" />En attente</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/70" />Confirmée</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/70" />En cours</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gold-500/20 border border-gold-500/40" />Aujourd'hui</span>
        </div>
      </div>
    </AdminLayout>
  );
}

function ReminderCard({ icon: Icon, color, label, count }) {
  const c = {
    blue:    { icon: 'bg-blue-500/15 text-blue-400',    grad: 'from-blue-300 to-blue-400' },
    emerald: { icon: 'bg-emerald-500/15 text-emerald-400', grad: 'from-emerald-300 to-emerald-400' },
    amber:   { icon: 'bg-amber-500/15 text-amber-400',  grad: 'from-amber-300 to-amber-400' },
    red:     { icon: 'bg-red-500/15 text-red-400',      grad: 'from-red-300 to-red-400' },
  }[color];
  return (
    <div className="relative bg-[#141414] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.icon}`}><Icon size={16} /></div>
      <div className={`font-display text-2xl font-black bg-gradient-to-br ${c.grad} bg-clip-text text-transparent leading-none tabular-nums`}>{count}</div>
      <div className="text-white/45 text-[11px] font-medium mt-1">{label}</div>
    </div>
  );
}
