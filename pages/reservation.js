import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { createBooking, calcDays, generateWhatsAppMessage } from '../lib/booking';

export default function ReservationPage({ cars }) {
  const router = useRouter();
  const { car: preselectedCarId } = router.query;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const [form, setForm] = useState({
    carId: preselectedCarId || '',
    startDate: '',
    endDate: '',
    name: '',
    phone: '',
    email: '',
    age: '',
    passport: '',
    notes: '',
  });

  useEffect(() => {
    if (preselectedCarId) setForm(f => ({ ...f, carId: preselectedCarId }));
  }, [preselectedCarId]);

  const selectedCar = cars.find(c => c.id === form.carId);
  const nbDays = calcDays(form.startDate, form.endDate);
  const totalPrice = selectedCar && nbDays > 0 ? selectedCar.resale_price * nbDays : 0;

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.carId) { toast.error('Choisissez un vÃ©hicule'); return false; }
    if (!form.startDate || !form.endDate) { toast.error('SÃ©lectionnez les dates'); return false; }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('La date de retour doit Ãªtre aprÃ¨s la date de dÃ©part');
      return false;
    }
    if (new Date(form.startDate) < new Date().setHours(0,0,0,0)) {
      toast.error('La date de dÃ©part ne peut pas Ãªtre dans le passÃ©');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.name.trim()) { toast.error('Entrez votre nom complet'); return false; }
    if (!form.phone.trim()) { toast.error('Entrez votre numÃ©ro de tÃ©lÃ©phone'); return false; }
    if (!form.age || isNaN(form.age)) { toast.error('Entrez votre Ã¢ge'); return false; }
    if (Number(form.age) < 35) {
      toast.error('Nous sommes dÃ©solÃ©s, nos assurances exigent un Ã¢ge minimum de 35 ans.', { duration: 5000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);

    const result = await createBooking({
      carId: form.carId,
      userId: null,
      userRole: 'public',
      clientInfo: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        age: Number(form.age),
        passport: form.passport,
        notes: form.notes,
      },
      startDate: form.startDate,
      endDate: form.endDate,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setBooking(result.booking);
    setStep(3);
    toast.success('RÃ©servation envoyÃ©e avec succÃ¨s !');
  };

  const whatsappUrl = booking && selectedCar
    ? generateWhatsAppMessage(booking, selectedCar)
    : '#';

  return (
    <>
      <Head>
        <title>RÃ©servation â Fik Conciergerie</title>
      </Head>

      <div className="grain min-h-screen bg-noir-950">
        <Navbar />

        <div className="pt-28 pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl font-bold text-white mb-2">RÃ©servation</h1>
              <p className="text-white/40">Remplissez le formulaire ci-dessous</p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-gold-500 text-noir-950' : 'bg-white/10 text-white/30'}`}>
                    {step > s ? 'â' : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-px transition-all duration-300 ${step > s ? 'bg-gold-500' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>

            <div className="card-dark p-6 md:p-8">
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-white font-semibold text-lg mb-6">Choisir un vÃ©hicule et les dates</h2>
                  <div>
                    <label className="label-dark">VÃ©hicule *</label>
                    <select value={form.carId} onChange={update('carId')} className="input-dark">
                      <option value="">â SÃ©lectionnez un vÃ©hicule â</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.name} â {car.resale_price} â¬/jour
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCar && (
                    <div className="bg-noir-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-noir-700 rounded-lg flex items-center justify-center text-3xl">ð</div>
                      <div>
                        <p className="text-white font-semibold">{selectedCar.name}</p>
                        <p className="text-gold-500 font-bold">{selectedCar.resale_price} â¬ / jour</p>
                        <p className="text-white/30 text-xs capitalize">{selectedCar.category} â¢ {selectedCar.seats} places</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-dark">Date de dÃ©part *</label>
                      <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={update('startDate')} className="input-dark" />
                    </div>
                    <div>
                      <label className="label-dark">Date de retour *</label>
                      <input type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]} onChange={update('endDate')} className="input-dark" />
                    </div>
                  </div>

                  {nbDays > 0 && selectedCar && (
                    <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">{selectedCar.resale_price} â¬ Ã {nbDays} jour{nbDays > 1 ? 's' : ''}</span>
                        <span className="text-gold-500 font-bold text-xl">{totalPrice} â¬</span>
                      </div>
                    </div>
                  )}

                  <button onClick={() => { if (validateStep1()) setStep(2); }} className="btn-gold w-full py-3 mt-2">
                    Continuer â
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep(1)} className="text-white/40 hover:text-white transition-colors">â Retour</button>
                    <h2 className="text-white font-semibold text-lg">Vos informations</h2>
                  </div>

                  <div>
                    <label className="label-dark">Nom complet *</label>
                    <input type="text" value={form.name} onChange={update('name')} placeholder="Ex: Ahmed Benali" className="input-dark" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-dark">TÃ©lÃ©phone *</label>
                      <input type="tel" value={form.phone} onChange={update('phone')} placeholder="06 XX XX XX XX" className="input-dark" />
                    </div>
                    <div>
                      <label className="label-dark">Ãge *</label>
                      <input type="number" value={form.age} onChange={update('age')} placeholder="35+" min="18" max="99" className="input-dark" />
                    </div>
                  </div>

                  {form.age && Number(form.age) < 35 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                      â ï¸ Nos assurances exigent un Ã¢ge minimum de 35 ans.
                    </div>
                  )}

                  <div>
                    <label className="label-dark">Email (optionnel)</label>
                    <input type="email" value={form.email} onChange={update('email')} placeholder="votre@email.com" className="input-dark" />
                  </div>

                  <div>
                    <label className="label-dark">NÂ° Passeport</label>
                    <input type="text" value={form.passport} onChange={update('passport')} placeholder="Votre numÃ©ro de passeport" className="input-dark" />
                  </div>

                  <div>
                    <label className="label-dark">Notes / Demandes spÃ©ciales</label>
                    <textarea value={form.notes} onChange={update('notes')} rows={3} placeholder="Informations complÃ©mentaires..." className="input-dark resize-none" />
                  </div>

                  <div className="bg-noir-800 rounded-xl p-4 space-y-2">
                    <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">RÃ©capitulatif</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">VÃ©hicule</span>
                      <span className="text-white">{selectedCar?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Dates</span>
                      <span className="text-white">{form.startDate} â {form.endDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">DurÃ©e</span>
                      <span className="text-white">{nbDays} jour{nbDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2">
                      <span className="text-white">Total estimÃ©</span>
                      <span className="text-gold-500">{totalPrice} â¬</span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading} className="btn-gold w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              )}

              {step === 3 && booking && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">â</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white mb-3">Demande envoyÃ©e !</h2>
                  <p className="text-white/50 mb-2">Votre demande de rÃ©servation a Ã©tÃ© reÃ§ue.</p>
                  <p className="text-white/30 text-sm mb-8">NÂ° de rÃ©servation : <span className="text-gold-500 font-mono">{booking.id?.substring(0, 8).toUpperCase()}</span></p>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
                    <p className="text-amber-400 text-sm font-medium mb-1">â³ En attente de confirmation</p>
                    <p className="text-white/40 text-sm">Notre Ã©quipe va confirmer votre rÃ©servation dans les plus brefs dÃ©lais. Vous serez contactÃ© par tÃ©lÃ©phone ou WhatsApp.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                      <span>ð¬</span> Confirmer via WhatsApp
                    </a>
                    <Link href="/" className="btn-outline py-3">
                      Retour Ã  l'accueil
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  if (!supabase) return { props: { cars: [] } };
  const { data: cars } = await supabase.from('cars').select('*').eq('available', true).order('resale_price');
  return { props: { cars: cars || [] } };
}
