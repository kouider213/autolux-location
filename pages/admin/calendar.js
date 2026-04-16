import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const STATUS_COLOR = {
  ACCEPTED: 'bg-emerald-500',
  PENDING:  'bg-amber-400',
  REJECTED: 'bg-red-500',
};
const STATUS_LABEL = { ACCEPTED: 'Acceptée', PENDING: 'En attente', REJECTED: 'Refusée' };

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const { data } = await supabase
      .from('bookings')
      .select('id, client_name, client_phone, start_date, end_date, nb_days, final_price, status, cars(name)')
      .lte('start_date', toLocalDateStr(lastDay))
      .gte('end_date',   toLocalDateStr(firstDay))
      .neq('status', 'REJECTED')
      .order('start_date');
    setBookings(data || []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  useEffect(() => {
    const sub = supabase
      .channel('calendar-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, loadBookings)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [loadBookings]);

  const firstDow  = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayBookings = (day) => {
    if (!day) return [];
    const ds = year + '-' + String(month + 1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
    return bookings.filter(b => b.start_date <= ds && b.end_date >= ds);
  };

  const todayStr      = toLocalDateStr(today);
  const prevMonth     = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const nextMonth     = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1);
  const goToday       = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); };
  const selBookings   = selected ? dayBookings(selected) : [];

  return (
    <>
      <Head><title>Calendrier — Fik Conciergerie Admin</title></Head>
      <AdminLayout>
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Calendrier</h1>
              <p className="text-white/30 text-sm mt-1">Réservations du mois — temps réel</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-white/50"><span className="w-3 h-3 rounded-full bg-emerald-500"/>Acceptée</span>
              <span className="flex items-center gap-1.5 text-white/50"><span className="w-3 h-3 rounded-full bg-amber-400"/>En attente</span>
              <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-gold-500/40 transition-colors">Aujourd'hui</button>
            </div>
          </div>

          <div className="card-dark p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-11 h-11 rounded-xl bg-white/5 hover:bg-gold-500/20 text-white flex items-center justify-center transition-colors text-2xl">‹</button>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">{MOIS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-11 h-11 rounded-xl bg-white/5 hover:bg-gold-500/20 text-white flex items-center justify-center transition-colors text-2xl">›</button>
            </div>

            <div className="grid grid-cols-7 mb-2 pb-2 border-b border-white/5">
              {JOURS.map(j => (
                <div key={j} className="text-center text-white/25 text-xs font-semibold uppercase tracking-widest py-1">{j}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {cells.map((day, idx) => {
                  if (!day) return <div key={'e' + idx} className="min-h-[64px] sm:min-h-[96px]"/>;
                  const ds  = year + '-' + String(month+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
                  const bks = dayBookings(day);
                  const isToday    = ds === todayStr;
                  const isSelected = selected === day;
                  const hasBks     = bks.length > 0;
                  return (
                    <button key={day} onClick={() => setSelected(isSelected ? null : day)}
                      className={
                        'min-h-[64px] sm:min-h-[96px] rounded-xl p-1.5 sm:p-2 text-left w-full transition-all duration-150 border ' +
                        (isSelected ? 'border-gold-500 bg-gold-500/10 shadow-lg' :
                         hasBks     ? 'border-white/8 hover:border-white/20 hover:bg-white/3' :
                                      'border-transparent hover:border-white/8 hover:bg-white/2') +
                        (isToday && !isSelected ? ' bg-white/4' : '')
                      }
                    >
                      <span className={
                        'text-xs sm:text-sm font-bold block mb-1 leading-none ' +
                        (isToday ? 'text-gold-500' : isSelected ? 'text-gold-400' : 'text-white/60')
                      }>
                        {isToday
                          ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-noir-950 text-xs font-black">{day}</span>
                          : day}
                      </span>
                      <div className="space-y-0.5 overflow-hidden">
                        {bks.slice(0, 3).map((b, i) => (
                          <div key={b.id + i} className={STATUS_COLOR[b.status] + ' rounded text-white px-1 py-0.5 truncate'} style={{fontSize:'9px',lineHeight:'1.2'}}>
                            <span className="hidden sm:inline">{b.cars?.name || b.client_name}</span>
                            <span className="sm:hidden">●</span>
                          </div>
                        ))}
                        {bks.length > 3 && <div className="text-white/30" style={{fontSize:'9px'}}>+{bks.length - 3}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selected && (
            <div className="card-dark p-4 sm:p-6 border border-gold-500/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">{selected} {MOIS[month]} {year}</h3>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-2xl leading-none">×</button>
              </div>
              {selBookings.length === 0 ? (
                <div className="text-center py-10 text-white/20">
                  <p className="text-4xl mb-2">📅</p>
                  <p className="text-sm">Aucune réservation active ce jour</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selBookings.map(b => (
                    <div key={b.id} className="bg-noir-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/5">
                      <div className="flex items-start gap-3">
                        <span className={'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ' + STATUS_COLOR[b.status]}/>
                        <div>
                          <p className="text-white font-semibold text-sm">{b.client_name}</p>
                          <p className="text-white/40 text-xs">{b.cars?.name || '—'} · {b.client_phone}</p>
                          <p className="text-white/25 text-xs mt-0.5">{b.start_date} → {b.end_date}{b.nb_days ? ' · ' + b.nb_days + 'j' : ''}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2">
                        <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (b.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400')}>
                          {STATUS_LABEL[b.status]}
                        </span>
                        {b.final_price > 0 && b.nb_days && (
                          <span className="text-gold-500 font-bold text-sm">{(Number(b.final_price) * (b.nb_days || 1)).toFixed(0)} €</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </AdminLayout>
    </>
  );
}
