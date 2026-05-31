import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Car, Calendar, User, Check, MessageCircle, Home, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { createBooking, calcDays, generateWhatsAppMessage } from '../lib/booking';

const STEPS = [
  { n: 1, label: 'Véhicule & dates', icon: Car },
  { n: 2, label: 'Vos informations', icon: User },
  { n: 3, label: 'Confirmation',     icon: Check },
];

export default function ReservationPage({ cars }) {
  const router = useRouter();
  const { car: preselectedCarId } = router.query;

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const [form, setForm] = useState({
    carId: '', startDate: '', endDate: '',
    name: '', phone: '', email: '', age: '', passport: '', notes: '',
  });

  useEffect(() => {
    if (preselectedCarId) setForm(f => ({ ...f, carId: preselectedCarId }));
  }, [preselectedCarId]);

  const selectedCar  = cars.find(c => c.id === form.carId);
  const nbDays       = calcDays(form.startDate, form.endDate);
  const totalPrice   = selectedCar && nbDays > 0 ? selectedCar.resale_price * nbDays : 0;
  const update       = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.carId) { toast.error('Choisissez un véhicule'); return false; }
    if (!form.startDate || !form.endDate) { toast.error('Sélectionnez les dates'); return false; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { toast.error('Date de retour invalide'); return false; }
    if (new Date(form.startDate) < new Date().setHours(0,0,0,0)) { toast.error('Date de départ dans le passé'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.name.trim())      { toast.error('Entrez votre nom complet'); return false; }
    if (!form.phone.trim())     { toast.error('Entrez votre téléphone'); return false; }
    if (!form.age || isNaN(form.age)) { toast.error('Entrez votre âge'); return false; }
    if (Number(form.age) < 35) {
      toast.error('Âge minimum requis : 35 ans', { duration: 5000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    const result = await createBooking({
      carId: form.carId, userId: null, userRole: 'public',
      clientInfo: { name: form.name, phone: form.phone, email: form.email, age: Number(form.age), passport: form.passport, notes: form.notes },
      startDate: form.startDate, endDate: form.endDate,
    });
    setLoading(false);
    if (!result.success) { toast.error(result.error); return; }
    setBooking(result.booking);
    setStep(3);
    toast.success('Demande envoyée !');
  };

  const whatsappUrl = booking && selectedCar ? generateWhatsAppMessage(booking, selectedCar) : '#';

  return (
    <>
      <Head><title>Réservation — AutoLux Location</title></Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        <div className="pt-28 pb-24 px-5">
          <div className="max-w-xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl font-bold text-white mb-2">Réservation</h1>
              <p className="text-white/35">Quelques étapes pour réserver votre véhicule</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-10">
              {STEPS.map((s, idx) => {
                const done    = step > s.n;
                const current = step === s.n;
                const Icon    = s.icon;
                return (
                  <div key={s.n} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        done    ? 'bg-gold-500 text-noir-950 shadow-[0_4px_12px_rgba(226,182,20,0.4)]' :
                        current ? 'bg-gold-500/20 border-2 border-gold-500 text-gold-400' :
                                  'bg-white/[0.05] border border-white/10 text-white/25'
                      }`}>
                        {done ? <Check size={16} /> : <Icon size={15} />}
                      </div>
                      <span className={`text-[10px] tracking-wide font-medium whitespace-nowrap ${current ? 'text-gold-400' : 'text-white/25'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-3 mb-4 transition-all duration-500 ${step > s.n ? 'bg-gold-500/60' : 'bg-white/[0.08]'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card */}
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/10 via-white/[0.03] to-transparent" />
              <div className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-6 md:p-8">

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-white font-semibold text-lg mb-1">Choisir votre véhicule</h2>
                    <p className="text-white/30 text-sm mb-6">Sélectionnez le véhicule et les dates de location.</p>

                    <div>
                      <label className="label-dark">Véhicule *</label>
                      <div className="relative">
                        <Car size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                        <select value={form.carId} onChange={update('carId')} className="input-dark pl-10 appearance-none">
                          <option value="">— Sélectionnez un véhicule —</option>
                          {cars.map(car => (
                            <option key={car.id} value={car.id}>{car.name} — {car.resale_price} €/jour</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedCar && (
                      <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gold-500/15 rounded-xl p-4">
                        <div className="w-14 h-14 bg-[#252525] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {selectedCar.image_url
                            ? <img src={selectedCar.image_url} alt={selectedCar.name} className="w-full h-full object-cover" />
                            : <Car size={22} className="text-gold-500/50" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{selectedCar.name}</p>
                          <p className="text-white/35 text-xs capitalize mt-0.5">{selectedCar.category} • {selectedCar.seats} places</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-gold-400 font-bold text-lg">{selectedCar.resale_price}€</div>
                          <div className="text-white/25 text-xs">/jour</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-dark">
                          <span className="flex items-center gap-1.5"><Calendar size={11} /> Départ *</span>
                        </label>
                        <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={update('startDate')} className="input-dark" />
                      </div>
                      <div>
                        <label className="label-dark">
                          <span className="flex items-center gap-1.5"><Calendar size={11} /> Retour *</span>
                        </label>
                        <input type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]} onChange={update('endDate')} className="input-dark" />
                      </div>
                    </div>

                    {nbDays > 0 && selectedCar && (
                      <div className="bg-gold-500/[0.06] border border-gold-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white/50 text-sm">{selectedCar.resale_price}€ × {nbDays} jour{nbDays > 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-gold-400 font-bold text-2xl">{totalPrice}€</div>
                            <div className="text-white/25 text-xs">total estimé</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={() => { if (validateStep1()) setStep(2); }} className="btn-gold w-full py-3.5">
                      Continuer
                      <ChevronLeft size={15} className="rotate-180" />
                    </button>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-1">
                      <button onClick={() => setStep(1)} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                        <ChevronLeft size={15} />
                      </button>
                      <div>
                        <h2 className="text-white font-semibold text-lg leading-tight">Vos informations</h2>
                        <p className="text-white/30 text-xs">Tous les champs * sont requis</p>
                      </div>
                    </div>

                    <div>
                      <label className="label-dark">Nom complet *</label>
                      <input type="text" value={form.name} onChange={update('name')} placeholder="Ex: Ahmed Benali" className="input-dark" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-dark">Téléphone *</label>
                        <input type="tel" value={form.phone} onChange={update('phone')} placeholder="06 XX XX XX XX" className="input-dark" />
                      </div>
                      <div>
                        <label className="label-dark">Âge *</label>
                        <input type="number" value={form.age} onChange={update('age')} placeholder="35+" min="18" max="99" className="input-dark" />
                      </div>
                    </div>

                    {form.age && Number(form.age) < 35 && (
                      <div className="flex items-start gap-3 bg-red-500/[0.07] border border-red-500/20 rounded-xl p-4">
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400/80 text-sm">Âge minimum requis : <strong className="text-red-400">35 ans</strong>. Nos assurances l'exigent.</p>
                      </div>
                    )}

                    <div>
                      <label className="label-dark">Email (optionnel)</label>
                      <input type="email" value={form.email} onChange={update('email')} placeholder="votre@email.com" className="input-dark" />
                    </div>

                    <div>
                      <label className="label-dark">N° Passeport</label>
                      <input type="text" value={form.passport} onChange={update('passport')} placeholder="Votre numéro de passeport" className="input-dark" />
                    </div>

                    <div>
                      <label className="label-dark">Notes / Demandes spéciales</label>
                      <textarea value={form.notes} onChange={update('notes')} rows={3} placeholder="Informations complémentaires..." className="input-dark resize-none" />
                    </div>

                    {/* Recap */}
                    <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                      <p className="text-white/30 text-xs uppercase tracking-widest font-medium mb-3">Récapitulatif</p>
                      {[
                        { label: 'Véhicule', value: selectedCar?.name },
                        { label: 'Dates', value: `${form.startDate} → ${form.endDate}` },
                        { label: 'Durée', value: `${nbDays} jour${nbDays > 1 ? 's' : ''}` },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between text-sm">
                          <span className="text-white/40">{item.label}</span>
                          <span className="text-white/80 font-medium">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold border-t border-white/[0.08] pt-3 mt-1">
                        <span className="text-white/60">Total estimé</span>
                        <span className="text-gold-400 text-lg">{totalPrice}€</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-gold w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                      ) : (
                        <>Envoyer la demande <Check size={15} /></>
                      )}
                    </button>
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && booking && (
                  <div className="text-center py-4">
                    <div className="relative inline-block mb-8">
                      <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-xl" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/30 rounded-full flex items-center justify-center">
                        <Check size={32} className="text-gold-400" />
                      </div>
                    </div>

                    <h2 className="font-display text-3xl font-bold text-white mb-3">Demande envoyée !</h2>
                    <p className="text-white/45 mb-2">Votre demande de réservation a bien été reçue.</p>
                    <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
                      <span className="text-white/35 text-xs">Réservation</span>
                      <span className="text-gold-400 font-mono font-semibold text-sm">#{booking.id?.substring(0, 8).toUpperCase()}</span>
                    </div>

                    <div className="flex items-start gap-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
                      <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-400 text-sm font-medium mb-1">En attente de confirmation</p>
                        <p className="text-white/35 text-xs leading-relaxed">Notre équipe confirmera votre réservation dans les plus brefs délais par téléphone ou WhatsApp.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.3)]"
                      >
                        <MessageCircle size={16} />
                        Confirmer via WhatsApp
                      </a>
                      <Link href="/" className="btn-outline py-3">
                        <Home size={15} />
                        Retour à l'accueil
                      </Link>
                    </div>
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

export async function getServerSideProps() {
  const { data: cars } = await supabase.from('cars').select('*').eq('available', true).order('resale_price');
  return { props: { cars: cars || [] } };
}
