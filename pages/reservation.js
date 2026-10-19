import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Car, User, Check, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Phone, FileText, Loader2, Home, CalendarDays, Info, Search, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import { trackEvent } from '../lib/tracker';
import { rentalDays } from '../lib/date';
import { getExtras, extrasCost, extrasLines, CHILD_AGES, childAgeLabel, seatForAge, seatKind, seatsWanted, PLACES, placeLabel } from '../lib/extras';
import { format, isWithinInterval, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr, arDZ, enUS } from 'date-fns/locale';

const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

const WHATSAPP_FALLBACK = '32466311469';

const L3 = (lang, frT, enT, arT) => (lang === 'ar' ? arT : lang === 'en' ? enT : frT);

// Ligne d'option à cocher (défini hors de la page : sinon les champs enfants perdent le focus à chaque frappe)
function OptRow({ checked, onChange, icon, title, desc, price, children }) {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${checked ? 'border-gold-500/35 bg-gold-500/[0.05]' : 'border-white/[0.08] bg-white/[0.02]'}`}>
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5 accent-[#e2b614] flex-shrink-0" />
        <span className="text-2xl leading-none">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-white/90 text-sm font-semibold">{title}</span>
          {desc && <span className="block text-white/40 text-xs mt-0.5">{desc}</span>}
          {price && <span className="sm:hidden block text-gold-400/90 text-xs font-semibold mt-1">{price}</span>}
        </span>
        {price && <span className="hidden sm:inline text-gold-400/90 text-xs font-semibold whitespace-nowrap">{price}</span>}
      </label>
      {checked && children}
    </div>
  );
}

const sym = (c) => (c === 'EUR' ? '€' : 'DA');
const fmt = (n) => Number(n).toLocaleString('fr-FR');

function buildWhatsAppUrl(form, car, days, total, bookingId, lang = 'fr', wa = WHATSAPP_FALLBACK, pending = false) {
  const ar = lang === 'ar';
  const en = lang === 'en';
  const lines = en ? [
    `🚗 *New Booking — Fik Conciergerie*`,
    ``,
    `*Vehicle:* ${car.name}`,
    `*Category:* ${car.category || '—'} · ${car.seats || '—'} seats`,
    `*Price/day:* ${fmt(car.resale_price)} ${sym(car.currency)}`,
    ``,
    `*Client:* ${form.name}`,
    `*Phone:* ${form.phone}`,
    `*Age:* ${form.age}`,
    form.email    ? `*Email:* ${form.email}`         : null,
    form.passport ? `*Passport/ID:* ${form.passport}` : null,
    ``,
    `*Pick-up:* ${form.startDate}`,
    `*Return:* ${form.endDate}`,
    `*Duration:* ${days} day${days > 1 ? 's' : ''}`,
    `*Estimated total:* ${fmt(total)} ${sym(car.currency)}${pending ? ' (+ options to confirm)' : ''}`,
    ``,
    ...extrasLines(form, 'en'),
    form.notes ? `*Notes:* ${form.notes}` : null,
    ``,
    bookingId ? `🔗 Tracking: https://fikconciergerie.com/suivi/${bookingId}` : null,
    `_Request sent from the Fik Conciergerie website._`,
  ] : ar ? [
    `🚗 *حجز جديد — فيك كونسيرجري*`,
    ``,
    `*السيارة :* ${car.name}`,
    `*الفئة :* ${car.category || '—'} · ${car.seats || '—'} مقاعد`,
    `*السعر/يوم :* ${fmt(car.resale_price)} ${sym(car.currency)}`,
    ``,
    `*الزبون :* ${form.name}`,
    `*الهاتف :* ${form.phone}`,
    `*العمر :* ${form.age} سنة`,
    form.email    ? `*البريد :* ${form.email}`            : null,
    form.passport ? `*جواز/بطاقة :* ${form.passport}`    : null,
    ``,
    `*الانطلاق :* ${form.startDate}`,
    `*العودة :* ${form.endDate}`,
    `*المدة :* ${days} يوم`,
    `*المجموع التقديري :* ${fmt(total)} ${sym(car.currency)}${pending ? ' (+ خيارات للتأكيد)' : ''}`,
    ``,
    ...extrasLines(form, 'ar'),
    form.notes ? `*ملاحظات :* ${form.notes}` : null,
    ``,
    bookingId ? `🔗 المتابعة: https://fikconciergerie.com/suivi/${bookingId}` : null,
    `_طلب مُرسَل من موقع فيك كونسيرجري._`,
  ] : [
    `🚗 *Nouvelle Réservation — Fik Conciergerie*`,
    ``,
    `*Véhicule :* ${car.name}`,
    `*Catégorie :* ${car.category || '—'} · ${car.seats || '—'} places`,
    `*Prix/jour :* ${fmt(car.resale_price)} ${sym(car.currency)}`,
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
    `*Total estimé :* ${fmt(total)} ${sym(car.currency)}${pending ? ' (+ options à confirmer)' : ''}`,
    ``,
    ...extrasLines(form, 'fr'),
    form.notes ? `*Notes :* ${form.notes}` : null,
    ``,
    bookingId ? `🔗 Suivi: https://fikconciergerie.com/suivi/${bookingId}` : null,
    `_Demande envoyée depuis le site Fik Conciergerie._`,
  ];

  return `https://wa.me/${wa}?text=${encodeURIComponent(lines.filter(l => l !== null).join('\n'))}`;
}

export default function ReservationPage({ cars: initialCars }) {
  const { lang, t } = useLang();
  const settings = useSettings();
  const wa = waNumber(settings);
  const router = useRouter();
  const { car: preselectedId } = router.query;

  const [cars, setCars]           = useState(initialCars || []);
  const [step, setStep]           = useState(1);
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loadingCal, setLoadingCal]     = useState(false);

  const [dateRange, setDateRange] = useState([null, null]);
  const [picking, setPicking]     = useState(true);
  // Tablette/PC : 2 mois côte à côte
  const [wide, setWide]           = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    const f = () => setWide(m.matches); f();
    m.addEventListener('change', f); return () => m.removeEventListener('change', f);
  }, []);
  const [startDate, endDate]      = dateRange;

  const [form, setForm] = useState({
    carId: '', startDate: '', endDate: '',
    name: '', phone: '', age: '', email: '', passport: '', notes: '', referral: '',
    babySeat: false, babyAges: [''],
    pickup: 'agence', pickupAddress: '', dropoff: 'agence', dropoffAddress: '', flight: '', arrival: '',
    driver2: false, driver2Name: '', driver2Age: '', wifi: false, sim: false, fuel: false,
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
    if (found) { setForm(f => ({ ...f, carId: found.id })); setPicking(false); }
  }, [preselectedId, cars]);

  // Pré-remplit les infos client depuis l'URL (re-réservation : pas besoin de tout retaper)
  useEffect(() => {
    if (!router.isReady) return;
    const { name, phone, email, age, passport } = router.query;
    if (name || phone || email || age || passport) {
      setForm(f => ({
        ...f,
        name: f.name || (name || ''), phone: f.phone || (phone || ''),
        email: f.email || (email || ''), age: f.age || (age || ''),
        passport: f.passport || (passport || ''),
      }));
    }
  }, [router.isReady]);

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
    // Blocs de 24 h : 3→7 nov = 4 jours (même règle que Dzaryx).
    return rentalDays(form.startDate, form.endDate);
  })();
  const carTotal = selectedCar && days > 0 ? selectedCar.resale_price * days : 0;
  const extras = getExtras(settings);
  const cost = extrasCost(form, extras, days, lang);
  const total = carTotal > 0 ? carTotal + cost.sum : 0;

  // Sièges bébé encore libres sur les dates choisies (null = illimité)
  const [seatLeft, setSeatLeft] = useState({});
  useEffect(() => {
    if (!form.babySeat || !form.startDate || !form.endDate) return;
    fetch(`/api/seat-stock?start=${form.startDate}&end=${form.endDate}`)
      .then(r => r.json()).then(d => setSeatLeft(d || {})).catch(() => {});
  }, [form.babySeat, form.startDate, form.endDate]);
  const wanted = seatsWanted(form);
  const seatShort = (kind) => seatLeft[kind] !== null && seatLeft[kind] !== undefined && wanted[kind] > seatLeft[kind];
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
  const ar = lang === 'ar';
  const validateStep1 = () => {
    const E = lang === 'en'
      ? { car: 'Please select a vehicle.', sd: 'Please choose a pickup date.', ed: 'Please choose a return date.', neg: 'Return date must be after pickup.', conf: 'This vehicle is not available on these dates. Please choose other dates.' }
      : ar
      ? { car: 'يرجى اختيار سيارة.', sd: 'يرجى اختيار تاريخ الانطلاق.', ed: 'يرجى اختيار تاريخ العودة.', neg: 'تاريخ العودة يجب أن يكون بعد الانطلاق.', conf: 'السيارة غير متوفّرة في هذه التواريخ. اختر تواريخ أخرى.' }
      : { car: 'Veuillez sélectionner un véhicule.', sd: 'Veuillez choisir une date de départ.', ed: 'Veuillez choisir une date de retour.', neg: 'La date de retour doit être après le départ.', conf: 'Le véhicule n\'est pas disponible sur ces dates. Veuillez choisir d\'autres dates.' };
    if (!form.carId)    { setErr1(E.car); return false; }
    if (!form.startDate){ setErr1(E.sd); return false; }
    if (!form.endDate)  { setErr1(E.ed); return false; }
    if (days <= 0)      { setErr1(E.neg); return false; }
    if (rangeHasConflict()) { setErr1(E.conf); return false; }
    setErr1(''); return true;
  };

  // Validation step 2
  const [err2, setErr2] = useState('');
  const ageNum = Number(form.age);
  const ageTooYoung = form.age && ageNum < 35;

  const validateStep2 = () => {
    const E = lang === 'en'
      ? { name: 'Enter your full name.', phone: 'Enter your phone number.', age: 'Enter your age.', ageInv: 'Invalid age.', ageMin: 'Minimum age 35 required (insurance requirement).' }
      : ar
      ? { name: 'أدخل اسمك الكامل.', phone: 'أدخل رقم هاتفك.', age: 'أدخل عمرك.', ageInv: 'عمر غير صحيح.', ageMin: 'السن الأدنى المطلوب 35 سنة (شرط التأمين).' }
      : { name: 'Entrez votre nom complet.', phone: 'Entrez votre numéro de téléphone.', age: 'Entrez votre âge.', ageInv: 'Âge invalide.', ageMin: 'Âge minimum 35 ans requis (exigence assurance).' };
    if (!form.name.trim()) { setErr2(E.name); return false; }
    if (!form.phone.trim()){ setErr2(E.phone); return false; }
    if (!form.age)         { setErr2(E.age); return false; }
    if (isNaN(ageNum) || ageNum <= 0) { setErr2(E.ageInv); return false; }
    if (ageNum < 35)       { setErr2(E.ageMin); return false; }
    if (form.babySeat && form.babyAges.some(a => a === '')) {
      setErr2(L3(lang, 'Indiquez l\'âge de chaque enfant pour le siège bébé.', 'Select the age of each child for the baby seat.', 'حدّد عمر كل طفل لمقعد الطفل.'));
      return false;
    }
    if (form.pickup === 'aeroport' && !form.flight.trim()) {
      setErr2(L3(lang, 'Indiquez votre numéro de vol pour la prise à l\'aéroport.', 'Enter your flight number for the airport pick-up.', 'أدخل رقم رحلتك للاستلام من المطار.')); return false;
    }
    if ((form.pickup === 'adresse' && !form.pickupAddress.trim()) || (form.dropoff === 'adresse' && !form.dropoffAddress.trim())) {
      setErr2(L3(lang, 'Indiquez l\'adresse de livraison / récupération.', 'Enter the delivery / collection address.', 'أدخل عنوان التوصيل / الاستلام.')); return false;
    }
    if (form.driver2) {
      if (!form.driver2Name.trim() || !form.driver2Age) {
        setErr2(L3(lang, 'Indiquez le nom et l\'âge du 2e conducteur.', 'Enter the 2nd driver\'s name and age.', 'أدخل اسم وعمر السائق الثاني.')); return false;
      }
      if (Number(form.driver2Age) < 35) {
        setErr2(L3(lang, 'Le 2e conducteur doit aussi avoir 35 ans minimum (assurance).', 'The 2nd driver must also be at least 35 (insurance).', 'يجب أن يكون السائق الثاني أيضًا 35 سنة على الأقل (التأمين).')); return false;
      }
    }
    setErr2(''); return true;
  };

  const [bookingId, setBookingId] = useState(null);

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    const extrasFr = extrasLines(form, 'fr');
    const costFr = extrasCost(form, extras, days, 'fr');
    if (costFr.items.some(i => i.amount)) extrasFr.push(`💶 Options : ${costFr.items.filter(i => i.amount !== 0).map(i => `${i.label} ${i.amount === null ? 'à confirmer' : fmt(i.amount) + ' €'}`).join(' ; ')}`);
    const fullNotes = [...extrasFr, form.notes || null].filter(Boolean).join('\n') || null;
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
          client_lang:          lang          || 'fr',
          start_date:           form.startDate,
          end_date:             form.endDate,
          final_price:          total,
          status:               'PENDING',
          notes:                fullNotes,
          client_price_per_day: selectedCar.resale_price || null,
          owner_price_per_day:  selectedCar.base_price   || null,
          rented_by:            'Kouider',
          payment_status:       'UNPAID',
          paid_amount:          0,
        }]).select('id').single();
        newBookingId = inserted?.id || null;
        setBookingId(newBookingId);
      }
      // Conversion tracking (GA4 + Meta Pixel) — non-bloquant
      trackEvent('reservation_complete', {
        value: total, currency: selectedCar?.currency || 'DZD', car: selectedCar?.name || null,
      });
      // Email "demande reçue" (si email) + notif Telegram à Kouider (toujours) — non bloquant
      fetch('/api/booking-received', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_email: form.email, client_name: form.name, client_phone: form.phone, car_name: selectedCar?.name,
          start_date: form.startDate, end_date: form.endDate, total,
          currency: selectedCar?.currency, booking_id: newBookingId, lang, extras: extrasFr,
        }),
      }).catch(() => {});
      // Code parrainage (si saisi) → incrémente le compteur — non bloquant
      if (form.referral && form.referral.trim()) {
        fetch('/api/referral-use', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: form.referral.trim() }),
        }).catch(() => {});
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
            total, notes: fullNotes,
          },
        }),
      }).catch(() => {});
    } catch { /* non-blocking */ }
    setLoading(false);
    setDone(true);
    const url = buildWhatsAppUrl(form, selectedCar, days, total, newBookingId, lang, wa, cost.pending);
    if (typeof window !== 'undefined') setTimeout(() => window.open(url, '_blank'), 300);
  };

  const whatsappUrl = selectedCar ? buildWhatsAppUrl(form, selectedCar, days, total, null, lang, wa, cost.pending) : '#';

  // ── DONE screen
  if (done && selectedCar) {
    return (
      <>
        <Head>
          <title>Réservation confirmée — Fik Conciergerie</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="grain min-h-screen bg-[#0e0e0e]">
          <Navbar />
          <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/30 rounded-full flex items-center justify-center">
                <Check size={40} className="text-gold-400" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-3">{t('res.sent')}</h1>
            <p className="text-white/45 mb-1 max-w-sm">{t('res.wa_open')}</p>
            <p className="text-white/30 text-sm mb-10 max-w-sm">{t('res.wa_not')}</p>
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 max-w-sm w-full mb-8 text-left space-y-2">
              <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-3">{t('res.summary')}</p>
              {[
                [t('res.vehicle').replace(' *',''), selectedCar.name],
                [t('res.depart'),   form.startDate],
                [t('res.retour'),   form.endDate],
                [t('res.duree'),    `${days} ${t('res.days')}`],
                [t('res.total'),    `${fmt(total)} ${sym(selectedCar?.currency)}`],
                [t('res.client'),   form.name],
                [t('res.tel'),      form.phone],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/35">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {/* Suivi de la demande — bouton principal */}
              <Link href={bookingId ? `/suivi/${bookingId}` : '/mes-reservations'}
                className="flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(226,182,20,0.3)]">
                <Search size={17} />{lang === 'ar' ? 'تتبّع طلبي' : lang === 'en' ? 'Track my request' : 'Suivre ma demande'}
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
                <MessageCircle size={17} />{t('res.open_wa')}
              </a>
              <div className="flex gap-3">
                <Link href="/" className="flex-1 flex items-center justify-center gap-2 btn-outline py-3">
                  <Home size={15} />{t('res.home')}
                </Link>
                <Link href="/reviews" className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-xl text-sm font-medium hover:bg-gold-500/15 transition-all">
                  ⭐ {t('res.leave')}
                </Link>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 max-w-sm">
              <div className="flex items-start gap-2 bg-gold-500/[0.06] border border-gold-500/20 rounded-xl p-4 text-left">
                <Search size={15} className="text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/55 text-xs leading-relaxed">
                  {lang === 'ar'
                    ? 'يمكنك متابعة طلبك في أي وقت من صفحة «حجوزاتي» باستخدام رقم هاتفك أو بريدك الإلكتروني. سيصلك أيضاً بريد تأكيد الاستلام.'
                    : lang === 'en'
                    ? 'You can track your request anytime in “My bookings” using your phone or email. A confirmation email has also been sent.'
                    : 'Vous pouvez suivre votre demande à tout moment dans « Mes réservations » avec votre téléphone ou votre email. Un email de confirmation vous a aussi été envoyé.'}
                </p>
              </div>
              <div className="flex items-start gap-2 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 text-left">
                <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-xs leading-relaxed">{t('res.team')}</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const L = (frT, enT, arT) => (lang === 'ar' ? arT : lang === 'en' ? enT : frT);
  const priceTag = (v, unit) => {
    if (v === '' || v === null || v === undefined || isNaN(Number(v))) return L('Prix à confirmer', 'Price to confirm', 'السعر للتأكيد');
    return Number(v) === 0 ? L('Offert', 'Free', 'مجاني') : `+${fmt(v)} €${unit}`;
  };
  const dloc = lang === 'ar' ? arDZ : lang === 'en' ? enUS : fr;
  const nice = (d) => { try { const x = format(parseISO(d), 'EEE d MMM', { locale: dloc }); return x.charAt(0).toUpperCase() + x.slice(1); } catch { return d; } };
  const scrollErr = () => setTimeout(() => document.getElementById('res-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  const goStep2 = () => {
    if (validateStep1()) { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else scrollErr();
  };
  const submit = () => { handleSubmit(); scrollErr(); };
  const selectCar = (id) => {
    setDateRange([null, null]); setErr1('');
    setForm(f => ({ ...f, carId: id, startDate: '', endDate: '' }));
    setPicking(false);
    setTimeout(() => document.getElementById('res-dates')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const showGrid = picking || !selectedCar;
  const SecTitle = ({ n, children, right }) => (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="flex items-center gap-3 text-white font-semibold text-lg">
        <span className="font-display text-2xl text-gold-gradient leading-none">{n}</span>{children}
      </h2>
      {right}
    </div>
  );

  return (
    <>
      <Head>
        <title>{lang === 'ar' ? 'حجز سيارة في وهران — فيك كونسيرجري' : lang === 'en' ? 'Book a Car in Oran — Fik Conciergerie' : 'Réserver une voiture à Oran — Fik Conciergerie'}</title>
        <meta name="description" content={lang === 'ar'
          ? 'احجز سيارتك في وهران بدون كفالة. اختر السيارة والتواريخ، التوصيل والاستلام يُدبَّران لك. 7/7.'
          : lang === 'en'
          ? 'Book your car in Oran without a deposit. Pick your vehicle and dates — delivery and return handled for you. 7/7, fast WhatsApp reply.'
          : 'Réservez votre voiture à Oran sans caution. Choisissez le véhicule et les dates, livraison et retour gérés pour vous. 7j/7, réponse rapide sur WhatsApp.'} />
        <link rel="canonical" href="https://fikconciergerie.com/reservation" />
        <meta property="og:title" content="Réserver une voiture à Oran — Fik Conciergerie" />
        <meta property="og:description" content="Réservation simple, sans caution. Véhicule + dates, on s'occupe du reste." />
        <meta property="og:url" content="https://fikconciergerie.com/reservation" />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e] relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.07] blur-[120px]" />
        <Navbar />
        <div className="relative pt-24 md:pt-28 pb-32 lg:pb-24 px-5">
          <div className="max-w-6xl mx-auto">

            {/* En-tête */}
            <div className="text-center mb-7 md:mb-9">
              <span className="section-badge mb-4 inline-block">{t('res.badge')}</span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">{t('res.title')}</h1>
              <p className="text-white/45 text-sm md:text-base">{t('res.subtitle')}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {[
                  L('Sans caution', 'No deposit', 'بدون كفالة'),
                  L('7j/7', '7/7', '7/7'),
                  L('Livraison & retour', 'Delivery & return', 'توصيل واستلام'),
                  L('Réponse rapide WhatsApp', 'Fast WhatsApp reply', 'ردّ سريع واتساب'),
                ].map((txt) => (
                  <span key={txt} className="inline-flex items-center gap-1.5 text-white/60 text-xs px-3 py-1.5 rounded-full border border-gold-500/15 bg-gold-500/[0.04]">
                    <Check size={12} className="text-gold-400" />{txt}
                  </span>
                ))}
              </div>
            </div>

            {/* Étapes */}
            <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
              {[{ n: 1, l: t('res.step1') }, { n: 2, l: t('res.step2') }].map((s, i) => (
                <Fragment key={s.n}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-9 h-9 rounded-full grid place-items-center text-sm font-bold transition-all duration-500 ${
                      step >= s.n ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-noir-950 shadow-[0_0_24px_rgba(226,182,20,0.35)]' : 'border border-white/15 text-white/35'}`}>
                      {step > s.n ? <Check size={15} /> : s.n}
                    </span>
                    <span className={`text-sm font-medium ${step >= s.n ? 'text-white' : 'text-white/35'}`}>{s.l}</span>
                  </div>
                  {i === 0 && (
                    <div className="w-10 sm:w-24 h-px bg-white/10 relative overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 bg-gold-500 transition-all duration-700 ${step > 1 ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">

              {/* ── Colonne principale ── */}
              <div className="min-w-0">

                {/* ══ ÉTAPE 1 ══ */}
                {step === 1 && (
                  <div className="space-y-10">
                    <section>
                      <SecTitle n="01" right={!showGrid && (
                        <button onClick={() => setPicking(true)} className="text-gold-400 text-sm font-medium hover:text-gold-300 inline-flex items-center gap-1">
                          <RefreshCw size={13} />{L('Changer', 'Change', 'تغيير')}
                        </button>
                      )}>{L('Votre véhicule', 'Your vehicle', 'سيارتك')}</SecTitle>

                      {showGrid ? (
                        <>
                          <div className="snap-row md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
                            {cars.map(car => {
                              const on = car.id === form.carId;
                              return (
                                <button key={car.id} type="button" onClick={() => selectCar(car.id)}
                                  className={`group relative text-left rounded-2xl overflow-hidden border bg-[#111] transition-all duration-300 w-[74%] sm:w-[45%] md:w-auto ${
                                    on ? 'border-gold-500/70 shadow-[0_0_0_1px_rgba(226,182,20,0.45),0_24px_48px_-24px_rgba(226,182,20,0.45)]' : 'border-white/[0.07] hover:border-gold-500/40 hover:-translate-y-1'}`}>
                                  <div className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
                                    {car.image_url
                                      ? <img src={car.image_url} alt={car.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                      : <div className="w-full h-full grid place-items-center"><Car size={28} className="text-gold-500/30" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                                    {car.category && <span className="absolute bottom-2.5 left-3 text-[10px] uppercase tracking-[0.2em] text-gold-300/90">{car.category}</span>}
                                    {on && <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-gold-500 text-noir-950 grid place-items-center"><Check size={15} /></span>}
                                  </div>
                                  <div className="p-3.5">
                                    <p className="text-white font-semibold text-sm truncate">{car.name}</p>
                                    <div className="flex items-baseline justify-between gap-2 mt-1">
                                      <span className="text-white/35 text-xs truncate">{car.seats ? `${car.seats} ${L('places', 'seats', 'مقاعد')}` : ''}{car.fuel ? ` · ${car.fuel}` : ''}</span>
                                      <span className="text-gold-400 font-bold text-sm whitespace-nowrap">{fmt(car.resale_price)} {sym(car.currency)}<span className="text-white/30 font-normal text-[11px]">{t('res.perday')}</span></span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {!cars.length && (
                            <div className="flex items-center gap-3 glass rounded-2xl p-4">
                              <Info size={16} className="text-white/30 flex-shrink-0" />
                              <p className="text-white/40 text-sm">{t('res.select_see')}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="gold-frame rounded-3xl overflow-hidden flex flex-col sm:flex-row">
                          <div className="relative sm:w-64 md:w-72 aspect-[16/9] sm:aspect-auto sm:min-h-[150px] bg-[#1a1a1a] flex-shrink-0">
                            {selectedCar.image_url
                              ? <img src={selectedCar.image_url} alt={selectedCar.name} className="absolute inset-0 w-full h-full object-cover" />
                              : <div className="absolute inset-0 grid place-items-center"><Car size={32} className="text-gold-500/30" /></div>}
                            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-transparent to-black/40" />
                          </div>
                          <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                            <p className="text-gold-400/80 text-[10px] uppercase tracking-[0.25em] mb-1">{selectedCar.category}</p>
                            <p className="font-display text-2xl md:text-3xl text-white font-bold leading-tight">{selectedCar.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {[selectedCar.seats && `${selectedCar.seats} ${L('places', 'seats', 'مقاعد')}`, selectedCar.fuel, selectedCar.transmission, L('Sans caution', 'No deposit', 'بدون كفالة')].filter(Boolean).map(x => (
                                <span key={x} className="text-[11px] text-white/60 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07]">{x}</span>
                              ))}
                            </div>
                            <p className="mt-3 text-gold-400 font-bold text-xl">{fmt(selectedCar.resale_price)} {sym(selectedCar.currency)}<span className="text-white/35 text-sm font-normal">{t('res.perday')}</span></p>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Dates */}
                    {selectedCar && !picking && (
                      <section id="res-dates" className="scroll-mt-28">
                        <SecTitle n="02" right={loadingCal && <span className="text-white/30 text-xs animate-pulse">{t('res.loading')}</span>}>
                          {L('Vos dates', 'Your dates', 'تواريخك')}
                        </SecTitle>
                        <div className="flex items-center gap-4 mb-3">
                          {[['bg-gold-500', t('res.selected')], ['bg-red-500/30 border border-red-500/20', t('res.indispo')], ['bg-white/10', t('res.dispo')]].map(([c, l]) => (
                            <span key={l} className="flex items-center gap-1.5 text-white/40 text-xs"><span className={`w-3 h-3 rounded-sm ${c}`} />{l}</span>
                          ))}
                        </div>
                        <div className={`w-full overflow-hidden rounded-2xl ${wide ? 'dp-two' : ''}`}>
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
                            locale={dloc}
                            inline
                            monthsShown={wide ? 2 : 1}
                            calendarStartDay={1}
                          />
                        </div>

                        {form.startDate && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {[[t('res.depart'), nice(form.startDate)], [t('res.retour'), form.endDate ? nice(form.endDate) : '—'], [t('res.duree'), days > 0 ? `${days} ${t('res.days')}` : '—']].map(([l, v]) => (
                              <div key={l} className="glass rounded-xl px-3 py-2.5 text-center">
                                <p className="text-white/35 text-[11px] mb-0.5">{l}</p>
                                <p className="text-white font-semibold text-sm">{v}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {rangeHasConflict() && (
                          <div className="mt-3 flex items-start gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400/80 text-sm">{t('res.conflict')}</p>
                          </div>
                        )}
                      </section>
                    )}

                    {err1 && (
                      <div id="res-err" className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400/80 text-sm">{err1}</p>
                      </div>
                    )}

                    <div className="hidden lg:block">
                      <button onClick={goStep2} className="btn-gold w-full py-4 text-base">
                        {t('res.continue')} <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ══ ÉTAPE 2 ══ */}
                {step === 2 && (
                  <div className="gold-frame rounded-3xl p-5 md:p-8 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setStep(1)} aria-label={L('Retour', 'Back', 'رجوع')}
                        className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronLeft size={16} />
                      </button>
                      <div>
                        <h2 className="flex items-center gap-3 text-white font-semibold text-lg leading-tight">
                          <span className="font-display text-2xl text-gold-gradient leading-none">03</span>{t('res.s2t')}
                        </h2>
                        <p className="text-white/30 text-xs mt-0.5">{t('res.required')}</p>
                      </div>
                    </div>

                    {router.isReady && (router.query.name || router.query.phone) && (
                      <div className="flex items-start gap-2 bg-gold-500/[0.06] border border-gold-500/20 rounded-xl p-3.5">
                        <RefreshCw size={14} className="text-gold-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/55 text-xs leading-relaxed">
                          {L('Vos infos sont pré-remplies depuis votre précédente réservation. Vérifiez-les et modifiez-les si besoin (âge, n° passeport…).',
                             'Your details are pre-filled from your previous booking. Check and edit them if needed (age, passport number…).',
                             'تم ملء معلوماتك مسبقاً من حجزك السابق. تحقّق منها وعدّلها إذا لزم (العمر، رقم الجواز…).')}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-dark">{t('res.fullname')}</label>
                        <div className="relative">
                          <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                          <input type="text" value={form.name} onChange={set('name')}
                            placeholder={t('res.ph_name')} className="input-dark" style={{ paddingLeft: '2.75rem' }} autoComplete="name" />
                        </div>
                      </div>
                      <div className="grid grid-cols-[1fr_96px] gap-3">
                        <div>
                          <label className="label-dark">{t('res.phone')}</label>
                          <div className="relative">
                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                            <input type="tel" value={form.phone} onChange={set('phone')}
                              placeholder={t('res.ph_phone')} className="input-dark" style={{ paddingLeft: '2.75rem' }} autoComplete="tel" />
                          </div>
                        </div>
                        <div>
                          <label className="label-dark">{t('res.age')}</label>
                          <input type="number" value={form.age} onChange={set('age')}
                            placeholder={t('res.ph_age')} min="18" max="99" className="input-dark" />
                        </div>
                      </div>
                    </div>

                    {ageTooYoung && (
                      <div className="flex items-start gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-4">
                        <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-semibold text-sm mb-1.5">{t('res.agemin')}</p>
                          <p className="text-red-400/70 text-xs leading-relaxed">{t('res.age_expl')}</p>
                          <p className="text-red-400/45 text-xs mt-2">{t('res.agemin_d')}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-dark">{t('res.email')}</label>
                        <input type="email" value={form.email} onChange={set('email')}
                          placeholder={t('res.ph_email')} className="input-dark" autoComplete="email" />
                        <p className="text-gold-400/60 text-[11px] mt-1.5">
                          {L('Pour recevoir votre n° de réservation et le suivi', 'To receive your booking number & tracking', 'لاستلام رقم الحجز والمتابعة')}
                        </p>
                      </div>
                      <div>
                        <label className="label-dark">{t('res.passport')}</label>
                        <div className="relative">
                          <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                          <input type="text" value={form.passport} onChange={set('passport')}
                            placeholder={t('res.ph_passport')} className="input-dark" style={{ paddingLeft: '2.75rem' }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-white/35 text-xs leading-relaxed -mt-1">
                      {L('📸 Les photos du passeport et du permis vous seront demandées à l\'étape du contrat — assurez-vous que vos documents sont valides (non périmés).',
                         '📸 Passport & licence photos will be requested at the contract step — make sure your documents are valid (not expired).',
                         '📸 ستُطلب منك صور جواز السفر والرخصة في خطوة العقد — احرص على أن تكون الوثائق سارية (غير منتهية).')}
                    </p>

                    {/* ── Prise & retour du véhicule */}
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
                      <p className="text-white/90 text-sm font-semibold">📍 {L('Prise & retour du véhicule', 'Vehicle pick-up & return', 'استلام وإرجاع السيارة')}</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[['pickup', L('Prise du véhicule', 'Pick-up', 'الاستلام')], ['dropoff', L('Retour du véhicule', 'Return', 'الإرجاع')]].map(([k, lbl]) => (
                          <div key={k}>
                            <label className="label-dark">{lbl}</label>
                            <select value={form[k]} onChange={set(k)} className="input-dark">
                              {PLACES.map(p => <option key={p} value={p}>{placeLabel(p, lang)}</option>)}
                            </select>
                            {form[k] !== 'agence' && <p className="text-gold-400/70 text-[11px] mt-1.5">{priceTag(form[k] === 'aeroport' ? extras.delivery_airport : extras.delivery_address, L(' / trajet', ' / trip', ' / رحلة'))}</p>}
                            {form[k] === 'adresse' && (
                              <input value={form[k + 'Address']} onChange={set(k + 'Address')} className="input-dark mt-2"
                                placeholder={L('Adresse (hôtel, domicile…) à Oran', 'Address (hotel, home…) in Oran', 'العنوان (فندق، منزل…) في وهران')} />
                            )}
                          </div>
                        ))}
                      </div>
                      {form.pickup === 'aeroport' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label-dark">{L('N° de vol', 'Flight number', 'رقم الرحلة')}</label>
                            <input value={form.flight} onChange={e => setForm(f => ({ ...f, flight: e.target.value.toUpperCase() }))} placeholder="AH 1234" className="input-dark" />
                          </div>
                          <div>
                            <label className="label-dark">{L('Heure d\'arrivée', 'Arrival time', 'وقت الوصول')}</label>
                            <input type="time" value={form.arrival} onChange={set('arrival')} className="input-dark" />
                          </div>
                          <p className="col-span-2 text-white/35 text-[11px] -mt-2">{L('Nous suivons votre vol : en cas de retard, on vous attend.', 'We track your flight: if it is late, we wait for you.', 'نتابع رحلتك: في حال التأخير ننتظرك.')}</p>
                        </div>
                      )}
                    </div>

                    {/* ── Options */}
                    <OptRow checked={form.driver2} onChange={v => setForm(f => ({ ...f, driver2: v }))} icon="👤"
                      title={L('Conducteur supplémentaire', 'Additional driver', 'سائق إضافي')}
                      desc={L('35 ans minimum, permis valide.', 'At least 35, valid licence.', '35 سنة على الأقل، رخصة سارية.')}
                      price={priceTag(extras.driver2_day, L(' / jour', ' / day', ' / يوم'))}>
                      <div className="mt-4 grid grid-cols-[1fr_110px] gap-3">
                        <input value={form.driver2Name} onChange={set('driver2Name')} placeholder={L('Nom complet', 'Full name', 'الاسم الكامل')} className="input-dark" />
                        <input type="number" value={form.driver2Age} onChange={set('driver2Age')} placeholder={L('Âge', 'Age', 'العمر')} min="18" max="99" className="input-dark" />
                      </div>
                    </OptRow>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <OptRow checked={form.wifi} onChange={v => setForm(f => ({ ...f, wifi: v }))} icon="📶"
                        title={L('Wi-Fi 4G dans la voiture', '4G Wi-Fi in the car', 'واي فاي 4G في السيارة')}
                        desc={L('Internet pour toute la famille.', 'Internet for the whole family.', 'إنترنت لكل العائلة.')}
                        price={priceTag(extras.wifi_day, L(' / jour', ' / day', ' / يوم'))} />
                      <OptRow checked={form.sim} onChange={v => setForm(f => ({ ...f, sim: v }))} icon="📱"
                        title={L('Carte SIM algérienne', 'Algerian SIM card', 'شريحة SIM جزائرية')}
                        desc={L('Prête à votre arrivée.', 'Ready when you land.', 'جاهزة عند وصولك.')}
                        price={priceTag(extras.sim, '')} />
                    </div>
                    <OptRow checked={form.fuel} onChange={v => setForm(f => ({ ...f, fuel: v }))} icon="⛽"
                      title={L('Rendre sans faire le plein', 'Return without refuelling', 'الإرجاع دون تعبئة الوقود')}
                      desc={L('On s\'en occupe : le carburant manquant est facturé au prix de la pompe.', 'We refuel for you: missing fuel is charged at pump price.', 'نتكفّل بالتعبئة: يُحتسب الوقود الناقص بسعر المحطة.')}
                      price={priceTag(extras.fuel_fee, L(' + carburant', ' + fuel', ' + وقود'))} />

                    <OptRow checked={form.babySeat} onChange={v => setForm(f => ({ ...f, babySeat: v }))} icon="👶"
                      title={L('Siège bébé / enfant', 'Baby / child seat', 'مقعد رضيع / طفل')}
                      desc={L('Indiquez l\'âge de l\'enfant, nous vous apportons le siège adapté avec le véhicule.', 'Tell us the child\'s age and we bring the right seat with the car.', 'حدّد عمر الطفل وسنحضر لك المقعد المناسب مع السيارة.')}
                      price={L('Offert', 'Free', 'مجاني')}>
                        <div className="mt-4 space-y-3">
                          {form.babyAges.map((a, i) => (
                            <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[200px_1fr_auto] gap-x-3 gap-y-1.5 items-center">
                              <select value={a} className="input-dark"
                                aria-label={L(`Âge de l'enfant ${i + 1}`, `Child ${i + 1} age`, `عمر الطفل ${i + 1}`)}
                                onChange={e => setForm(f => ({ ...f, babyAges: f.babyAges.map((x, j) => (j === i ? e.target.value : x)) }))}>
                                <option value="">{L(`Âge de l'enfant${form.babyAges.length > 1 ? ' ' + (i + 1) : ''}`, `Child${form.babyAges.length > 1 ? ' ' + (i + 1) : ''} age`, `عمر الطفل${form.babyAges.length > 1 ? ' ' + (i + 1) : ''}`)}</option>
                                {CHILD_AGES.map(m => <option key={m} value={m}>{childAgeLabel(m, lang)}</option>)}
                              </select>
                              <span className="order-3 sm:order-none col-span-2 sm:col-span-1 text-xs text-gold-400/80">
                                {a !== '' && <>→ {seatForAge(Number(a), lang)}</>}
                                {a !== '' && seatShort(seatKind(Number(a))) && (
                                  <span className="block text-amber-400/90 mt-0.5">{L('Plus assez de ce siège en stock sur ces dates — nous vous recontactons pour une solution.', 'Not enough of this seat in stock on these dates — we will contact you with a solution.', 'لا يتوفر عدد كافٍ من هذا المقعد في هذه التواريخ — سنتصل بك لإيجاد حل.')}</span>
                                )}
                              </span>
                              {form.babyAges.length > 1 ? (
                                <button type="button" className="text-white/35 hover:text-red-400 text-xs px-2 py-2"
                                  onClick={() => setForm(f => ({ ...f, babyAges: f.babyAges.filter((_, j) => j !== i) }))}>
                                  {L('Retirer', 'Remove', 'حذف')}
                                </button>
                              ) : <span />}
                            </div>
                          ))}
                          {form.babyAges.length < 3 && (
                            <button type="button" className="text-gold-400 hover:text-gold-300 text-xs font-medium"
                              onClick={() => setForm(f => ({ ...f, babyAges: [...f.babyAges, ''] }))}>
                              + {L('Un autre enfant', 'Another child', 'طفل آخر')}
                            </button>
                          )}
                        </div>
                    </OptRow>

                    <div className="grid md:grid-cols-[1fr_220px] gap-4">
                      <div>
                        <label className="label-dark">{t('res.notes')}</label>
                        <textarea value={form.notes} onChange={set('notes')} rows={3}
                          placeholder={t('res.ph_notes')} className="input-dark resize-none" />
                      </div>
                      <div>
                        <label className="label-dark">{L('Code parrainage (optionnel)', 'Referral code (optional)', 'رمز الإحالة (اختياري)')}</label>
                        <input value={form.referral} onChange={set('referral')}
                          placeholder={L('Si vous avez un code', 'If you have a code', 'إن كان لديك رمز')} className="input-dark" />
                      </div>
                    </div>

                    {err2 && (
                      <div id="res-err" className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400/80 text-sm">{err2}</p>
                      </div>
                    )}

                    <div className="hidden lg:block pt-1">
                      <button onClick={submit} disabled={loading || ageTooYoung}
                        className="btn-gold w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                        {loading ? <><Loader2 size={16} className="animate-spin" />{t('res.sending')}</> : <><MessageCircle size={17} />{t('res.send_wa')}</>}
                      </button>
                    </div>
                    <p className="text-center text-white/25 text-xs">{t('res.wa_auto')}</p>
                  </div>
                )}
              </div>

              {/* ── Récapitulatif (PC) / sous le formulaire (tablette) ── */}
              <aside className="hidden md:block lg:sticky lg:top-28">
                <div className="gold-frame rounded-3xl overflow-hidden">
                  <div className="relative h-44 bg-[#151515]">
                    {selectedCar?.image_url
                      ? <img src={selectedCar.image_url} alt={selectedCar.name} className="absolute inset-0 w-full h-full object-cover" />
                      : <div className="absolute inset-0 grid place-items-center"><Car size={40} className="text-gold-500/20" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-gold-400/80 text-[10px] uppercase tracking-[0.25em]">{t('res.recap')}</p>
                      <p className="font-display text-2xl text-white font-bold truncate">{selectedCar ? selectedCar.name : L('Choisissez un véhicule', 'Choose a vehicle', 'اختر سيارة')}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      [t('res.depart'), form.startDate ? nice(form.startDate) : '—'],
                      [t('res.retour'), form.endDate ? nice(form.endDate) : '—'],
                      [t('res.duree'),  days > 0 ? `${days} ${t('res.days')}` : '—'],
                      [L('Prix / jour', 'Price / day', 'السعر / يوم'), selectedCar ? `${fmt(selectedCar.resale_price)} ${sym(selectedCar.currency)}` : '—'],
                      ...cost.items.map(i => [i.label, i.amount === null ? L('à confirmer', 'to confirm', 'للتأكيد') : i.amount === 0 ? L('Offert', 'Free', 'مجاني') : `${fmt(i.amount)} €`]),
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-white/40">{l}</span>
                        <span className="text-white/85 font-medium">{v}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent my-1" />
                    <div className="flex items-end justify-between">
                      <span className="text-white/50 text-sm">{t('res.total')}</span>
                      {total > 0
                        ? <span className="font-display text-4xl font-bold text-gold-gradient leading-none">{fmt(total)}<span className="text-lg ml-1">{sym(selectedCar?.currency)}</span></span>
                        : <span className="text-white/30 text-sm">{L('Choisissez vos dates', 'Pick your dates', 'اختر تواريخك')}</span>}
                    </div>
                    {total > 0 && cost.pending && <p className="text-right text-white/35 text-[11px] -mt-1">{L('+ options au prix à confirmer', '+ options, price to confirm', '+ خيارات بسعر للتأكيد')}</p>}
                    <ul className="pt-3 space-y-2">
                      {[L('Sans caution', 'No deposit', 'بدون كفالة'), L('Kilométrage illimité', 'Unlimited mileage', 'كيلومترات غير محدودة'), L('Assurance incluse', 'Insurance included', 'التأمين مشمول'), L('Livraison possible à l\'aéroport', 'Airport delivery available', 'توصيل ممكن إلى المطار')].map(x => (
                        <li key={x} className="flex items-center gap-2 text-white/55 text-xs"><Check size={13} className="text-gold-400" />{x}</li>
                      ))}
                    </ul>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 text-xs text-white/50 hover:text-gold-400 py-2.5 rounded-xl border border-white/[0.07] transition-colors">
                      <MessageCircle size={14} />{L('Une question ? Écrivez-nous', 'A question? Message us', 'سؤال؟ راسلنا')}
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'action fixe (téléphone + tablette) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gold-500/20 bg-[#0b0b0b]/90 backdrop-blur-xl px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {total > 0 ? (
              <>
                <p className="text-white/40 text-[11px] truncate">{selectedCar?.name} · {days} {t('res.days')}</p>
                <p className="font-display text-2xl font-bold text-gold-gradient leading-tight">{fmt(total)} {sym(selectedCar?.currency)}</p>
              </>
            ) : (
              <p className="text-white/55 text-sm truncate">
                {selectedCar ? L('Choisissez vos dates', 'Pick your dates', 'اختر تواريخك') : L('Choisissez un véhicule', 'Choose a vehicle', 'اختر سيارة')}
              </p>
            )}
          </div>
          {step === 1 ? (
            <button onClick={goStep2} className="btn-gold px-6 py-3.5 flex-shrink-0">{t('res.continue')} <ChevronRight size={15} /></button>
          ) : (
            <button onClick={submit} disabled={loading || ageTooYoung} className="btn-gold px-5 py-3.5 flex-shrink-0 disabled:opacity-40">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}{L('Envoyer', 'Send', 'إرسال')}
            </button>
          )}
        </div>
      </div>
      <Footer />
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
