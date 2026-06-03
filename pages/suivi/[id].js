import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Car, Calendar, Check, Clock, X, MessageCircle, Home, Phone } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useSettings, waNumber } from '../../lib/settings';

const STEPS = [
  { key: 'PENDING',   label: 'Demande reçue',   icon: Clock },
  { key: 'ACCEPTED',  label: 'Confirmée',        icon: Check },
  { key: 'ACTIVE',    label: 'En cours',         icon: Car },
  { key: 'COMPLETED', label: 'Terminée',         icon: Check },
];

const STATUS_INFO = {
  PENDING:   { label: 'En attente de confirmation', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', step: 0 },
  ACCEPTED:  { label: 'Réservation confirmée',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', step: 1 },
  CONFIRMED: { label: 'Réservation confirmée',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', step: 1 },
  ACTIVE:    { label: 'Location en cours',          color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', step: 2 },
  COMPLETED: { label: 'Location terminée',          color: 'text-white/50', bg: 'bg-white/5 border-white/10', step: 3 },
  REJECTED:  { label: 'Réservation refusée',        color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', step: -1 },
};

export default function SuiviPage() {
  const router   = useRouter();
  const WHATSAPP = waNumber(useSettings());
  const { id }   = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || !supabase) return;
    supabase.from('bookings')
      .select('*, cars(name, image_url, category, seats, fuel)')
      .eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); }
        else setBooking(data);
        setLoading(false);
      });

    // Live update
    const sub = supabase.channel(`suivi-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` },
        (payload) => setBooking(prev => ({ ...prev, ...payload.new }))
      ).subscribe();
    return () => supabase.removeChannel(sub);
  }, [id]);

  if (loading) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-black text-white/10 mb-4">404</p>
      <p className="text-white font-semibold mb-2">Réservation introuvable</p>
      <p className="text-white/30 text-sm mb-8">Vérifiez le lien reçu par WhatsApp.</p>
      <Link href="/" className="btn-gold px-6 py-3"><Home size={15} />Accueil</Link>
    </div>
  );

  const status = STATUS_INFO[booking.status] || STATUS_INFO.PENDING;
  const currentStep = status.step;
  const isRejected = booking.status === 'REJECTED';

  const days = (() => {
    if (!booking.start_date || !booking.end_date) return 0;
    return Math.round((new Date(booking.end_date) - new Date(booking.start_date)) / 86400000);
  })();

  const whatsappMsg = `Bonjour Fik Conciergerie, je souhaite avoir des informations sur ma réservation #${booking.id?.substring(0,8).toUpperCase()}.`;

  return (
    <>
      <Head><title>Suivi réservation — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">Suivi en temps réel</span>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Votre réservation</h1>
            <p className="text-white/30 text-sm font-mono">#{booking.id?.substring(0,8).toUpperCase()}</p>
          </div>

          {/* Status card */}
          <div className={`border rounded-2xl p-5 mb-6 text-center ${status.bg}`}>
            <div className={`text-lg font-bold mb-1 ${status.color}`}>{status.label}</div>
            {booking.status === 'PENDING' && (
              <p className="text-white/40 text-sm">Notre équipe vous contactera sous 24h pour confirmer.</p>
            )}
            {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
              <p className="text-white/40 text-sm">Votre réservation est validée. Bonne location !</p>
            )}
            {booking.status === 'REJECTED' && (
              <p className="text-white/40 text-sm">Nous ne sommes pas disponibles à ces dates. Contactez-nous pour d'autres dates.</p>
            )}
          </div>

          {/* Progress steps */}
          {!isRejected && (
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done    = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-gold-500 border-gold-500' : 'bg-transparent border-white/15'
                    } ${current ? 'ring-2 ring-gold-500/30 ring-offset-2 ring-offset-[#0e0e0e]' : ''}`}>
                      <Icon size={14} className={done ? 'text-noir-950' : 'text-white/20'} />
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${done ? 'text-gold-400' : 'text-white/20'}`}>
                      {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`absolute hidden`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Car */}
          {booking.cars && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
              {booking.cars.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img src={booking.cars.image_url} alt={booking.cars.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-white font-bold text-lg">{booking.cars.name}</h2>
                <p className="text-white/35 text-sm capitalize">{booking.cars.category} · {booking.cars.seats} places · {booking.cars.fuel}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5 space-y-3">
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Détails</p>
            {[
              ['Client',  booking.client_name],
              ['Départ',  booking.start_date],
              ['Retour',  booking.end_date],
              ['Durée',   `${days} jour${days > 1 ? 's' : ''}`],
              ['Total',   booking.final_price ? `${booking.final_price}€` : 'À confirmer'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/35">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
            <MessageCircle size={17} />Contacter Fik Conciergerie
          </a>

          <p className="text-center text-white/20 text-xs mt-4">
            Cette page se met à jour automatiquement en temps réel.
          </p>
        </div>
      </div>
    </>
  );
}
