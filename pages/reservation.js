import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Car, CalendarCheck, User, Check, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Phone, FileText, Loader2, Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const WHATSAPP = '32466311469';

function buildWhatsAppUrl(form, car, days, total) {
  const lines = [
    `🚗 *Nouvelle Réservation — Fik Conciergerie*`,
    ``,
    `*Véhicule :* ${car.name}`,
    `*Catégorie :* ${car.category || '—'}`,
    `*Prix/jour :* ${car.resale_price}€`,
    ``,
    `*Client :* ${form.name}`,
    `*Téléphone :* ${form.phone}`,
    `*Âge :* ${form.age} ans`,
    form.email    ? `*Email :* ${form.email}`        : null,
    form.passport ? `*Passeport :* ${form.passport}` : null,
    ``,
    `*Départ :* ${form.startDate}`,
    `*Retour :* ${form.endDate}`,
    `*Durée :* ${days} jour${days > 1 ? 's' : ''}`,
    `*Total estimé :* ${total}€`,
    form.notes    ? `*Notes :* ${form.notes}`        : null,
    ``,
    `_Demande envoyée depuis le site Fik Conciergerie. Merci de confirmer la disponibilité._`,
  ].filter(l => l !== null).join('\n');

  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines)}`;
}

export default function ReservationPage({ cars: initialCars }) {
  const router = useRouter();
  const { car: preselectedId } = router.query;

  const [cars, setCars]   = useState(initialCars || []);
  const [step, setStep]   = useState(1);
  const [done, setDone]   = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    carId: '', startDate: '', endDate: '',
    name: '', phone: '', age: '', email: '', passport: '', notes: '',
  });

  // Refresh cars client-side (bypass ISR cache)
  useEffect(() => {
    if (!supabase) return;
    supabase.from('cars').select('*').eq('available', true).order('resale_price')
      .then(({ data }) => { if (data?.length > 0) setCars(data); })
      .catch(() => {});
  }, []);

  // Pre-select car from URL param
  useEffect(() => {
    if (preselectedId && cars.length > 0) {
      const found = cars.find(c => c.id === preselectedId || String(c.id) === String(preselectedId));
      if (found) setForm(f => ({ ...f, carId: found.id }));
    }
  }, [preselectedId, cars]);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const selectedCar = cars.find(c => c.id === form.carId) || null;
  const days = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const d = Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000);
    return d > 0 ? d : 0;
  })();
  const total = selectedCar && days > 0 ? selectedCar.resale_price * days : 0;

  const today = new Date().toISOString().split('T')[0];

  // ── Validation step 1
  const [err1, setErr1] = useState('');
  const validateStep1 = () => {
    if (!form.carId)       { setErr1('Veuillez sélectionner un véhicule.'); return false; }
    if (!form.startDate)   { setErr1('Veuillez choisir une date de départ.'); return false; }
    if (!form.endDate)     { setErr1('Veuillez choisir une date de retour.'); return false; }
    if (days <= 0)         { setErr1('La date de retour doit être après le départ.'); return false; }
    setErr1(''); return true;
  };

  // ── Validation step 2
  const [err2, setErr2] = useState('');
  const ageNum = Number(form.age);
  const ageTooYoung = form.age && ageNum < 35;

  const validateStep2 = () => {
    if (!form.name.trim()) { setErr2('Entrez votre nom complet.'); return false; }
    if (!form.phone.trim()){ setErr2('Entrez votre numéro de téléphone.'); return false; }
    if (!form.age)         { setErr2('Entrez votre âge.'); return false; }
    if (isNaN(ageNum))     { setErr2('Âge invalide.'); return false; }
    if (ageNum < 35)       { setErr2('Âge minimum 35 ans requis.'); return false; }
    setErr2(''); return true;
  };

  // ── Submit: save to Supabase (optional) then open WhatsApp
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);

    // Try to save booking to Supabase (non-blocking — WhatsApp opens regardless)
    try {
      if (supabase && selectedCar) {
        await supabase.from('bookings').insert([{
          car_id:           form.carId,
          client_name:      form.name,
          client_phone:     form.phone,
          client_age:       ageNum,
          client_email:     form.email || null,
          client_passport:  form.passport || null,
          start_date:       form.startDate,
          end_date:         form.endDate,
          final_price:      total,
          status:           'PENDING',
          notes:            form.notes || null,
        }]);
      }
    } catch { /* non-blocking */ }

    setLoading(false);
    setDone(true);

    // Open WhatsApp automatically
    const url = buildWhatsAppUrl(form, selectedCar, days, total);
    if (typeof window !== 'undefined') {
      setTimeout(() => { window.open(url, '_blank'); }, 300);
    }
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
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Demande envoyée !</h1>
            <p className="text-white/45 mb-1 max-w-sm">Votre demande a bien été reçue.</p>
            <p className="text-white/30 text-sm mb-10 max-w-sm">WhatsApp s'est ouvert automatiquement. Si ce n'est pas le cas, cliquez ci-dessous.</p>

            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 max-w-sm w-full mb-8 text-left space-y-2">
              <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-3">Résumé</p>
              {[
                ['Véhicule',  selectedCar.name],
                ['Départ',    form.startDate],
                ['Retour',    form.endDate],
                ['Durée',     `${days} jour${days > 1 ? 's' : ''}`],
                ['Total',     `${total}€`],
                ['Client',    form.name],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/35">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
                <MessageCircle size={17} />WhatsApp
              </a>
              <Link href="/" className="flex-1 flex items-center justify-center gap-2 btn-outline py-3.5">
                <Home size={15} />Accueil
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-2 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 max-w-sm text-left">
              <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-xs leading-relaxed">Notre équipe confirmera votre réservation par téléphone ou WhatsApp dans les plus brefs délais.</p>
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
              <p className="text-white/35 text-sm">Remplissez le formulaire — WhatsApp s'ouvrira automatiquement</p>
            </div>

            {/* Step indicator */}
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
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-white font-semibold text-lg mb-1">Choisir votre véhicule</h2>
                      <p className="text-white/30 text-xs mb-5">Sélectionnez le véhicule et les dates souhaitées.</p>
                    </div>

                    {/* Car selector */}
                    <div>
                      <label className="label-dark">Véhicule *</label>
                      <div className="relative">
                        <Car size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                        <select value={form.carId} onChange={set('carId')} className="input-dark pl-10 appearance-none cursor-pointer">
                          <option value="">— Sélectionnez un véhicule —</option>
                          {cars.map(car => (
                            <option key={car.id} value={car.id}>
                              {car.name} — {car.resale_price}€/jour
                            </option>
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
                            : <div className="w-full h-full flex items-center justify-center"><Car size={20} className="text-gold-500/40" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{selectedCar.name}</p>
                          <p className="text-white/35 text-xs capitalize mt-0.5">{selectedCar.category} · {selectedCar.seats} places · {selectedCar.fuel}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-gold-400 font-bold">{selectedCar.resale_price}€</div>
                          <div className="text-white/25 text-xs">/jour</div>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-dark">Départ *</label>
                        <input type="date" value={form.startDate} min={today}
                          onChange={set('startDate')} className="input-dark" />
                      </div>
                      <div>
                        <label className="label-dark">Retour *</label>
                        <input type="date" value={form.endDate}
                          min={form.startDate || today}
                          onChange={set('endDate')} className="input-dark" />
                      </div>
                    </div>

                    {/* Price recap */}
                    {days > 0 && selectedCar && (
                      <div className="bg-gold-500/[0.06] border border-gold-500/15 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/45 text-sm">{selectedCar.resale_price}€ × {days} jour{days > 1 ? 's' : ''}</span>
                          <div className="text-right">
                            <span className="text-gold-400 font-bold text-2xl">{total}€</span>
                            <span className="text-white/25 text-xs block">total estimé</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {err1 && (
                      <div className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-3">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400/80 text-sm">{err1}</p>
                      </div>
                    )}

                    <button
                      onClick={() => { if (validateStep1()) setStep(2); }}
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

                    {/* Age warning — full explanation */}
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
                        placeholder="Informations complémentaires, lieu de livraison, etc."
                        className="input-dark resize-none" />
                    </div>

                    {/* Recap */}
                    {selectedCar && (
                      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-2">
                        <p className="text-white/25 text-xs uppercase tracking-widest font-medium mb-2">Récapitulatif</p>
                        {[
                          ['Véhicule', selectedCar.name],
                          ['Dates', `${form.startDate} → ${form.endDate}`],
                          ['Durée', `${days} jour${days > 1 ? 's' : ''}`],
                          ['Total estimé', `${total}€`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="text-white/35">{label}</span>
                            <span className="text-white/80 font-medium">{value}</span>
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
                        ? <><Loader2 size={16} className="animate-spin" />Envoi en cours...</>
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
