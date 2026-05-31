import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Car, User, Check, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Phone, FileText, Loader2, Home, CalendarDays, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { format, isWithinInterval, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

const WHATSAPP = '32466311469';

function buildWhatsAppUrl(form, car, days, total, bookingId) {
  const lines = [
    `🚗 *Nouvelle Réservation — Fik Conciergerie*`,
    ``,
    `*Véhicule :* ${car.name}`,
    `*Catégorie :* ${car.category || '—'} · ${car.seats || '—'} places`,
    `*Prix/jour :* ${car.resale_price}€`,
    ``,
    `*Client :* ${form.name}`,
    `*Téléphone :* ${form.phone}`,
    `*Âge :* ${form.age} ans`,
    form.email    ? `*Email :* ${form.email}`         : null,
    form.passport ? `*Passeport/CIN :* ${form.passport}` : null,
    ``,
    `*Départ :* ${form.startDate}`,
    `*Retour :* ${form.endDate}`,
    `*Durée :* ${days} jour${days > 1 ? 's' : ''}`,
    `*Total estimé :* ${total}€`,
    form.notes ? `*Notes :* ${form.notes}` : null,
    ``,
    bookingId ? `🔗 Suivi: https://autolux-location.vercel.app/suivi/${bookingId}` : null,
    `_Demande envoyée depuis le site Fik Conciergerie._`,
  ].filter(l => l !== null).join('\n');

  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines)}`;
}

export default function ReservationPage({ cars: initialCars }) {
  const router = useRouter();
  const { car: preselectedId } = router.query;

  const [cars, setCars]           = useState(initialCars || []);
  const [step, setStep]           = useState(1);
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loadingCal, setLoadingCal]     = useState(false);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate]      = dateRange;

  const [form, setForm] = useState({
    carId: '', startDate: '', endDate: '',
    name: '', phone: '', age: '', email: '', passport: '', notes: '',
  });

  // Refresh cars
  useEffect(() => {
    if (!supabase) return;
    supabase.from('cars').select('*').eq('available', true).order('resale_price')
      .then(({ data }) => { if (data?.length > 0) setCars(data); })
      .catch(() => {});
  }, []);

  // Pre-select car from URL
  useEffect(() => {
    if (!preselectedId || !cars.length) return;
    const found = cars.find(c => String(c.id) === String(preselectedId));
    if (found) setForm(f => ({ ...f, carId: found.id }));
  }, [preselectedId, cars]);

  // Fetch booked dates when car changes
  useEffect(() => {
    if (!form.carId || !supabase) { setBookedRanges([]); return; }
    setLoadingCal(true);
    supabase.from('bookings')
      .select('start_date, end_date')
      .eq('car_id', form.carId)
      .in('status', ['PENDING', 'CONFIRMED', 'ACTIVE', 'ACCEPTED'])
      .then(({ data }) => { setBookedRanges(data || []); setLoadingCal(false); })
      .catch(() => setLoadingCal(false));
  }, [form.carId]);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const selectedCar = cars.find(c => c.id === form.carId) || null;
  const days = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const d = Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000);
    return d > 0 ? d : 0;
  })();
  const total = selectedCar && days > 0 ? selectedCar.resale_price * days : 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Check if a date is in a booked range
  const isDateBooked = useCallback((date) => {
    return bookedRanges.some(b => {
      try {
        const s = parseISO(b.start_date);
        const e = parseISO(b.end_date);
        return isWithinInterval(date, { start: s, end: e }) || isSameDay(date, s) || isSameDay(date, e);
      } catch { return false; }
    });
  }, [bookedRanges]);

  // Check if selected range overlaps booked dates
  const rangeHasConflict = useCallback(() => {
    if (!startDate || !endDate) return false;
    return bookedRanges.some(b => {
      try {
        const bs = parseISO(b.start_date);
        const be = parseISO(b.end_date);
        return !(isAfter(startDate, be) || isBefore(endDate, bs));
      } catch { return false; }
    });
  }, [startDate, endDate, bookedRanges]);

  // Day class for calendar
  const getDayClass = useCallback((date) => {
    if (isDateBooked(date)) return 'day-booked';
    return undefined;
  }, [isDateBooked]);

  // Filter: disable past + booked dates
  const filterDate = useCallback((date) => {
    return !isBefore(date, today) && !isDateBooked(date);
  }, [today, isDateBooked]);

  // Validation step 1
  const [err1, setErr1] = useState('');
  const validateStep1 = () => {
    if (!form.carId)    { setErr1('Veuillez sélectionner un véhicule.'); return false; }
    if (!form.startDate){ setErr1('Veuillez choisir une date de départ.'); return false; }
    if (!form.endDate)  { setErr1('Veuillez choisir une date de retour.'); return false; }
    if (days <= 0)      { setErr1('La date de retour doit être après le départ.'); return false; }
    if (rangeHasConflict()) { setErr1('Le véhicule n\'est pas disponible sur ces dates. Veuillez choisir d\'autres dates.'); return false; }
    setErr1(''); return true;
  };

  // Validation step 2
  const [err2, setErr2] = useState('');
  const ageNum = Number(form.age);
  const ageTooYoung = form.age && ageNum < 35;

  const validateStep2 = () => {
    if (!form.name.trim()) { setErr2('Entrez votre nom complet.'); return false; }
    if (!form.phone.trim()){ setErr2('Entrez votre numéro de téléphone.'); return false; }
    if (!form.age)         { setErr2('Entrez votre âge.'); return false; }
    if (isNaN(ageNum) || ageNum <= 0) { setErr2('Âge invalide.'); return false; }
    if (ageNum < 35)       { setErr2('Âge minimum 35 ans requis (exigence assurance).'); return false; }
    setErr2(''); return true;
  };

  const [bookingId, setBookingId] = useState(null);

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    let newBookingId = null;
    try {
      if (supabase && selectedCar) {
        const { data: inserted } = await supabase.from('bookings').insert([{
          car_id:               form.carId,
          client_name:          form.name,
          client_phone:         form.phone,
          client_age:           ageNum,
          client_email:         form.email    || null,
          client_passport:      form.passport || null,
          start_date:           form.startDate,
          end_date:             form.endDate,
          final_price:          total,
          status:               'PENDING',
          notes:                form.notes    || null,
          client_price_per_day: selectedCar.resale_price || null,
          owner_price_per_day:  selectedCar.base_price   || null,
          rented_by:            'Kouider',
          payment_status:       'UNPAID',
          paid_amount:          0,
        }]).select('id').single();
        newBookingId = inserted?.id || null;
        setBookingId(newBookingId);
      }
      // Notify Dzaryx
      fetch('/api/notify-dzaryx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_booking',
          data: {
            car_name: selectedCar?.name, client_name: form.name,
            client_phone: form.phone, client_age: form.age,
            start_date: form.startDate, end_date: form.endDate,
            total, notes: form.notes,
          },
        }),
      }).catch(() => {});
    } catch { /* non-blocking */ }
    setLoading(false);
    setDone(true);
    const url = buildWhatsAppUrl(form, selectedCar, days, total);
    if (typeof window !== 'undefined') setTimeout(() => window.open(url, '_blank'), 300);
  };

  const whatsappUrl = selectedCar ? buildWhatsAppUrl(form, selectedCar, days, total) : '#';

  // ── DONE screen
  if (done && selectedCar) {
    return (
      <>
        <Head><title>Réservation confirmée — Fik Conciergerie</title></Head>
        <div className="grain min-h-screen bg-[#0e0e0e]">
          <Navbar />
          <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/30 rounded-full flex items-center justify-center">
                <Check size={40} className="text-gold-400" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-3">Demande envoyée !</h1>
            <p className="text-white/45 mb-1 max-w-sm">WhatsApp s'est ouvert automatiquement.</p>
            <p className="text-white/30 text-sm mb-10 max-w-sm">Si ce n'est pas le cas, cliquez sur le bouton vert ci-dessous.</p>
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 max-w-sm w-full mb-8 text-left space-y-2">
              <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-3">Résumé</p>
              {[
                ['Véhicule', selectedCar.name],
                ['Départ',   form.startDate],
                ['Retour',   form.endDate],
                ['Durée',    `${days} jour${days > 1 ? 's' : ''}`],
                ['Total',    `${total}€`],
                ['Client',   form.name],
                ['Tél',      form.phone],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/35">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
                <MessageCircle size={17} />Ouvrir WhatsApp
              </a>
              <div className="flex gap-3">
                <Link href="/" className="flex-1 flex items-center justify-center gap-2 btn-outline py-3">
                  <Home size={15} />Accueil
                </Link>
                <Link href="/reviews" className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-xl text-sm font-medium hover:bg-gold-500/15 transition-all">
                  ⭐ Laisser un avis
                </Link>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-2 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 max-w-sm text-left">
              <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-xs leading-relaxed">Notre équipe confirmera votre réservation par WhatsApp dans les plus brefs délais.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Réservation — Fik Conciergerie</title></Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-24 pb-24 px-5">
          <div className="max-w-lg mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
              <span className="section-badge mb-4 inline-block">Location</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Réservation</h1>
              <p className="text-white/35 text-sm">Choisissez votre véhicule et vos dates disponibles</p>
            </div>

            {/* Step pills */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[{n:1,l:'Véhicule & dates'},{n:2,l:'Vos infos'}].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    step === s.n ? 'bg-gold-500/20 border border-gold-500/40 text-gold-400' :
                    step > s.n  ? 'bg-gold-500/10 text-gold-600 border border-gold-500/20' :
                                  'bg-white/[0.04] text-white/25 border border-white/[0.08]'
                  }`}>
                    {step > s.n ? <Check size={11} /> : <span>{s.n}</span>}
                    <span className="hidden sm:inline">{s.l}</span>
                  </div>
                  {i === 0 && <div className={`w-8 h-px ${step > 1 ? 'bg-gold-500/40' : 'bg-white/[0.08]'}`} />}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/10 via-white/[0.02] to-transparent pointer-events-none" />
              <div className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-6">

                {/* ══ STEP 1 ══ */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-white font-semibold text-lg mb-1">Véhicule & disponibilités</h2>
                      <p className="text-white/30 text-xs">Sélectionnez un véhicule pour voir son calendrier de disponibilités.</p>
                    </div>

                    {/* Car selector */}
                    <div>
                      <label className="label-dark">Véhicule *</label>
                      <div className="relative">
                        <Car size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                        <select value={form.carId} onChange={e => { set('carId')(e); setDateRange([null, null]); setForm(f => ({ ...f, carId: e.target.value, startDate: '', endDate: '' })); }}
                          className="input-dark pl-10 appearance-none cursor-pointer">
                          <option value="">— Sélectionnez un véhicule —</option>
                          {cars.map(car => (
                            <option key={car.id} value={car.id}>{car.name} — {car.resale_price}€/jour</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selected car preview */}
                    {selectedCar && (
                      <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gold-500/15 rounded-xl p-4">
                        <div className="w-16 h-12 bg-[#252525] rounded-lg overflow-hidden flex-shrink-0">
                          {selectedCar.image_url
                            ? <img src={selectedCar.image_url} alt={selectedCar.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Car size={18} className="text-gold-500/40" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{selectedCar.name}</p>
                          <p className="text-white/35 text-xs capitalize mt-0.5">{selectedCar.category} · {selectedCar.seats}p · {selectedCar.fuel}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-gold-400 font-bold">{selectedCar.resale_price}€</div>
                          <div className="text-white/25 text-xs">/jour</div>
                        </div>
                      </div>
                    )}

                    {/* Calendar — shown when car selected */}
                    {selectedCar && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="label-dark mb-0 flex items-center gap-2">
                            <CalendarDays size={13} />Choisir vos dates *
                          </label>
                          {loadingCal && <span className="text-white/30 text-xs animate-pulse">Chargement...</span>}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-gold-500 rounded-sm" />
                            <span className="text-white/40 text-xs">Sélectionné</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-red-500/30 rounded-sm border border-red-500/20" />
                            <span className="text-white/40 text-xs">Indisponible</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-white/10 rounded-sm" />
                            <span className="text-white/40 text-xs">Disponible</span>
                          </div>
                        </div>

                        {/* DatePicker inline range */}
                        <div className="w-full overflow-hidden rounded-2xl">
                          <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                              setDateRange(update);
                              const [s, e] = update;
                              setForm(f => ({
                                ...f,
                                startDate: s ? format(s, 'yyyy-MM-dd') : '',
                                endDate:   e ? format(e, 'yyyy-MM-dd') : '',
                              }));
                            }}
                            filterDate={filterDate}
                            dayClassName={getDayClass}
                            minDate={today}
                            locale={fr}
                            inline
                            calendarStartDay={1}
                          />
                        </div>

                        {/* Selected range display */}
                        {form.startDate && (
                          <div className="mt-3 bg-[#1e1e1e] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-white/30 text-xs mb-0.5">Départ</p>
                              <p className="text-gold-400 font-semibold text-sm">{form.startDate}</p>
                            </div>
                            <ChevronRight size={14} className="text-white/20" />
                            <div className="text-center">
                              <p className="text-white/30 text-xs mb-0.5">Retour</p>
                              <p className={`font-semibold text-sm ${form.endDate ? 'text-gold-400' : 'text-white/25'}`}>
                                {form.endDate || '—'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-white/30 text-xs mb-0.5">Durée</p>
                              <p className="text-white font-semibold text-sm">{days > 0 ? `${days}j` : '—'}</p>
                            </div>
                            {days > 0 && (
                              <div className="text-center">
                                <p className="text-white/30 text-xs mb-0.5">Total</p>
                                <p className="text-gold-400 font-bold text-sm">{total}€</p>
                              </div>
                            )}
                          </div>
                        )}

                        {rangeHasConflict() && (
                          <div className="mt-3 flex items-start gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400/80 text-sm">Ce véhicule est déjà réservé sur une partie de ces dates. Veuillez choisir d'autres dates.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedCar && (
                      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <Info size={16} className="text-white/20 flex-shrink-0" />
                        <p className="text-white/30 text-sm">Sélectionnez un véhicule pour afficher son calendrier de disponibilités.</p>
                      </div>
                    )}

                    {err1 && (
                      <div className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400/80 text-sm">{err1}</p>
                      </div>
                    )}

                    <button onClick={() => { if (validateStep1()) setStep(2); }}
                      className="btn-gold w-full py-3.5">
                      Continuer <ChevronRight size={15} />
                    </button>
                  </div>
                )}

                {/* ══ STEP 2 ══ */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                      <button onClick={() => setStep(1)}
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronLeft size={15} />
                      </button>
                      <div>
                        <h2 className="text-white font-semibold text-lg leading-tight">Vos informations</h2>
                        <p className="text-white/30 text-xs">Champs * obligatoires</p>
                      </div>
                    </div>

                    <div>
                      <label className="label-dark">Nom complet *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                        <input type="text" value={form.name} onChange={set('name')}
                          placeholder="Ex: Ahmed Benali" className="input-dark pl-10" autoComplete="name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-dark">Téléphone *</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                          <input type="tel" value={form.phone} onChange={set('phone')}
                            placeholder="+213 6XX" className="input-dark pl-10" autoComplete="tel" />
                        </div>
                      </div>
                      <div>
                        <label className="label-dark">Âge *</label>
                        <input type="number" value={form.age} onChange={set('age')}
                          placeholder="35+" min="18" max="99" className="input-dark" />
                      </div>
                    </div>

                    {ageTooYoung && (
                      <div className="flex items-start gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-4">
                        <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-semibold text-sm mb-1.5">Âge minimum requis : 35 ans</p>
                          <p className="text-red-400/70 text-xs leading-relaxed">
                            En raison de nos contrats d'assurance, nous ne sommes pas autorisés à louer nos véhicules aux personnes de moins de 35 ans. Cette règle nous permet de protéger nos clients et notre société en cas de contrôle, d'accident ou de litige avec les assurances.
                          </p>
                          <p className="text-red-400/45 text-xs mt-2">Merci pour votre compréhension.</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="label-dark">Email (optionnel)</label>
                      <input type="email" value={form.email} onChange={set('email')}
                        placeholder="votre@email.com" className="input-dark" autoComplete="email" />
                    </div>

                    <div>
                      <label className="label-dark">N° Passeport / CIN</label>
                      <div className="relative">
                        <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                        <input type="text" value={form.passport} onChange={set('passport')}
                          placeholder="Numéro de document" className="input-dark pl-10" />
                      </div>
                    </div>

                    <div>
                      <label className="label-dark">Notes / Demandes spéciales</label>
                      <textarea value={form.notes} onChange={set('notes')} rows={3}
                        placeholder="Lieu de livraison, demandes particulières..."
                        className="input-dark resize-none" />
                    </div>

                    {selectedCar && (
                      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-2">
                        <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-2">Récapitulatif</p>
                        {[
                          ['Véhicule', selectedCar.name],
                          ['Dates',    `${form.startDate} → ${form.endDate}`],
                          ['Durée',    `${days} jour${days > 1 ? 's' : ''}`],
                          ['Total',    `${total}€`],
                        ].map(([l, v]) => (
                          <div key={l} className="flex justify-between text-sm">
                            <span className="text-white/35">{l}</span>
                            <span className="text-white/80 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {err2 && (
                      <div className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400/80 text-sm">{err2}</p>
                      </div>
                    )}

                    <button onClick={handleSubmit} disabled={loading || ageTooYoung}
                      className="btn-gold w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" />Envoi...</>
                        : <><MessageCircle size={17} />Envoyer via WhatsApp</>
                      }
                    </button>
                    <p className="text-center text-white/20 text-xs">
                      WhatsApp s'ouvrira automatiquement avec toutes vos informations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { cars: [] }, revalidate: 60 };
    const { data } = await supabase.from('cars').select('*').eq('available', true).order('resale_price');
    return { props: { cars: data || [] }, revalidate: 60 };
  } catch {
    return { props: { cars: [] }, revalidate: 60 };
  }
}
