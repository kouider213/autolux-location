import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import { createClient } from '@supabase/supabase-js';
import { Calendar, User, Phone, Mail, MessageSquare, Car, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

registerLocale('fr', fr);

export default function Reservation() {
  const router = useRouter();
  const { car: carId, name: carName, prix, demande } = router.query;

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', age: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState('');

  useEffect(() => {
    if (carId) setSelectedCar(carId);
  }, [carId]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data } = await supabase.from('cars').select('id,name,resale_price').eq('available', true).order('name');
      if (data) setCars(data);
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const totalJours = startDate && endDate
    ? Math.max(1, Math.ceil((endDate - startDate) / 86400000))
    : null;

  const totalPrix = totalJours && prix ? totalJours * Number(prix) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.telephone || !form.email || !form.age) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (Number(form.age) < 21) {
      toast.error('Âge minimum requis : 21 ans.');
      return;
    }
    if (!demande && (!startDate || !endDate)) {
      toast.error('Veuillez sélectionner vos dates.');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const booking = {
        car_id: selectedCar || null,
        client_name: form.nom,
        client_phone: form.telephone,
        client_email: form.email,
        client_age: Number(form.age),
        message: form.message || null,
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        status: 'pending',
      };
      await supabase.from('bookings').insert(booking);
      setSuccess(true);
    } catch (err) {
      toast.error('Erreur lors de la réservation. Réessayez.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-gold-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Demande envoyée !</h1>
          <p className="text-white/60 mb-8">Nous vous contactons sous 24h au {form.telephone} pour confirmer votre réservation.</p>
          <button onClick={() => router.push('/cars')} className="bg-gold-500 text-noir-950 font-bold px-8 py-3 rounded-xl hover:bg-gold-400 transition-colors">
            Voir nos véhicules
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Réservation — Fik Conciergerie</title>
        <meta name="description" content="Réservez votre véhicule en ligne chez Fik Conciergerie." />
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-noir-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-gold-500 text-sm font-semibold uppercase tracking-widest">Réservation</span>
            <h1 className="font-display text-4xl font-bold text-white mt-2">
              {carName ? decodeURIComponent(carName) : 'Réserver un véhicule'}
            </h1>
            {prix && <p className="text-gold-500 text-xl mt-2 font-semibold">{prix} €/jour</p>}
            {demande && <p className="text-gold-500 mt-2 font-semibold">Tarif sur devis</p>}
          </div>

          <form onSubmit={handleSubmit} className="bg-noir-800 rounded-2xl p-8 space-y-6">

            {/* Véhicule selector si pas de carId */}
            {!carId && (
              <div>
                <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><Car size={16}/> Véhicule *</label>
                <select
                  value={selectedCar}
                  onChange={e => setSelectedCar(e.target.value)}
                  className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  required
                >
                  <option value="">Choisir un véhicule...</option>
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.resale_price ? '— ' + c.resale_price + ' €/j' : '— Sur demande'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Calendrier dates */}
            {!demande && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><Calendar size={16}/> Date de début *</label>
                  <DatePicker
                    selected={startDate}
                    onChange={d => { setStartDate(d); if(endDate && d > endDate) setEndDate(null); }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Choisir une date"
                    className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><Calendar size={16}/> Date de fin *</label>
                  <DatePicker
                    selected={endDate}
                    onChange={d => setEndDate(d)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Choisir une date"
                    className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            )}

            {/* Récap prix */}
            {totalJours && totalPrix && (
              <div className="bg-noir-900 rounded-xl p-4 flex justify-between items-center border border-gold-500/20">
                <span className="text-white/60">{totalJours} jour{totalJours > 1 ? 's' : ''}</span>
                <span className="text-gold-500 font-bold text-xl">{totalPrix} €</span>
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><User size={16}/> Nom complet *</label>
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Votre nom et prénom" required
                className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><Phone size={16}/> Téléphone *</label>
              <input name="telephone" type="tel" value={form.telephone} onChange={handleChange} placeholder="+213 6XX XXX XXX" required
                className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><Mail size={16}/> Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required
                className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
            </div>

            {/* Âge */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><User size={16}/> Âge * <span className="text-white/30">(min. 21 ans)</span></label>
              <input name="age" type="number" min="21" max="80" value={form.age} onChange={handleChange} placeholder="Votre âge" required
                className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
            </div>

            {/* Message */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2"><MessageSquare size={16}/> Message (optionnel)</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                placeholder="Précisions sur votre demande, lieu de livraison, options souhaitées..."
                className="w-full bg-noir-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-500 resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-noir-950 font-bold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? 'Envoi en cours...' : (demande ? 'Envoyer ma demande de devis' : 'Confirmer ma réservation')}
            </button>

            <p className="text-white/30 text-xs text-center">
              Nous vous rappelons sous 24h pour confirmer la disponibilité et finaliser la réservation.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
