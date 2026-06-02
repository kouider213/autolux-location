import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Car, Fuel, Users, Settings, ArrowLeft, CalendarCheck, MessageCircle, Wind, Star, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { trackPageView } from '../../lib/tracker';

export default function CarDetail({ car, photos: initialPhotos }) {
  const [photos, setPhotos]       = useState(initialPhotos || []);
  const [activePhoto, setActive]  = useState(0);

  useEffect(() => {
    if (car?.id) trackPageView(`/cars/${car.id}`, car.id);
    // Fetch extra photos client-side
    if (car?.id) {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      client.from('car_photos').select('url, position').eq('car_id', car.id).order('position')
        .then(({ data }) => { if (data?.length) setPhotos(data.map(p => p.url)); });
    }
  }, [car?.id]);

  if (!car) {
    return (
      <>
        <div className="grain min-h-screen bg-[#0e0e0e]">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Car size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/50 text-lg mb-2">Véhicule introuvable</p>
              <Link href="/cars" className="text-gold-500 hover:text-gold-400 text-sm transition-colors">← Retour aux véhicules</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Bonjour Fik Conciergerie,\n\nJe suis intéressé(e) par la location du véhicule :\n*${car.name}* - ${car.resale_price ? Number(car.resale_price).toLocaleString('fr-FR') + ' ' + (car.currency === 'EUR' ? '€' : 'DA') + '/jour' : 'Prix sur demande'}\n\nMerci de me confirmer les disponibilités.`
  );
  // Belgian number: +32 466 31 14 69
  const whatsappUrl = `https://wa.me/32466311469?text=${whatsappMsg}`;

  const specs = [
    { icon: Fuel,     label: 'Carburant',    value: car.fuel || 'Essence' },
    { icon: Settings, label: 'Transmission', value: car.transmission || 'Manuelle' },
    { icon: Users,    label: 'Places',       value: `${car.seats || 5} places` },
    { icon: Wind,     label: 'Climatisation',value: car.clim ? 'Oui' : 'Incluse' },
    { icon: Car,      label: 'Catégorie',    value: car.category },
  ].filter(s => s.value);

  const perks = [
    'Sans caution requise',
    'Véhicule nettoyé & vérifié',
    'Confirmation WhatsApp',
    'Service 7j/7 à Oran',
  ];

  return (
    <>
      <Head>
        <title>{car.name} — Fik Conciergerie</title>
        <meta name="description" content={`Louez le ${car.name} à Oran. ${car.resale_price ? Number(car.resale_price).toLocaleString('fr-FR') + ' ' + (car.currency === 'EUR' ? '€' : 'DA') + '/jour' : 'Prix sur demande'}. Sans caution.`} />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Back + Page header */}
        <div className="pt-24 pb-0 px-5 max-w-6xl mx-auto">
          <Link href="/cars" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-body mb-6 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Retour aux véhicules
          </Link>
        </div>

        {/* Sticky CTA mobile — fixe en bas sur mobile uniquement */}
        {car.available !== false && (
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-xs font-body">À partir de</p>
              <p className="font-display font-black text-gold-400 text-xl leading-none tabular-nums">
                {Number(car.resale_price).toLocaleString('fr-FR')} {car.currency === 'EUR' ? '€' : 'DA'}<span className="text-sm font-body text-white/25 ml-1">/jour</span>
              </p>
            </div>
            <div className="flex gap-2 flex-1 justify-end">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/10 text-white/50 hover:text-white transition-all flex-shrink-0">
                <MessageCircle size={18} />
              </a>
              <Link href={`/reservation?car=${car.id}&name=${encodeURIComponent(car.name)}&prix=${car.resale_price||''}`}
                className="btn-gold py-3 px-6 text-sm flex-1 justify-center max-w-[160px]">
                <CalendarCheck size={15} />Réserver
              </Link>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="px-5 pb-36 md:pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left — image gallery */}
            <div className="space-y-3">
              {/* Main photo */}
              {(() => {
                const allPhotos = photos.length > 0 ? photos : (car.image_url ? [car.image_url] : []);
                const src = allPhotos[activePhoto] || null;
                return (
                  <>
                    <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06]" style={{ aspectRatio: '16/10' }}>
                      {src ? (
                        <img src={src} alt={car.name} className="w-full h-full object-cover object-center" loading="eager" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <Car size={56} className="text-white/[0.07]" />
                          <span className="text-white/15 text-xs tracking-widest uppercase font-body">Photo à venir</span>
                        </div>
                      )}
                      <span className="absolute top-4 left-4 tag-category capitalize">{car.category}</span>
                      {car.available === false && (
                        <div className="absolute inset-0 bg-[#0e0e0e]/75 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white/60 text-xs font-medium tracking-widest uppercase border border-white/20 rounded-full px-4 py-2">Indisponible</span>
                        </div>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {allPhotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allPhotos.map((s, i) => (
                          <button key={i} onClick={() => setActive(i)}
                            className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-gold-500' : 'border-white/[0.06] opacity-60 hover:opacity-100'}`}>
                            <img src={s} alt={`${car.name} ${i+1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Perks */}
              <div className="grid grid-cols-2 gap-2">
                {perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-[#141414] border border-white/[0.05] rounded-xl px-4 py-3">
                    <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                    <span className="text-white/55 text-xs font-body">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — details */}
            <div className="flex flex-col gap-6">

              {/* Name + price */}
              <div>
                <p className="text-white/30 text-xs tracking-widest uppercase font-body mb-2">{car.category}</p>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {car.name}
                </h1>
                <div className="flex items-baseline gap-2">
                  {car.resale_price ? (
                    <>
                      <span className="font-display font-black text-gold-gradient leading-none"
                        style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}>
                        {Number(car.resale_price).toLocaleString('fr-FR')} {car.currency === 'EUR' ? '€' : 'DA'}
                      </span>
                      <span className="text-white/30 text-base font-body">/jour</span>
                    </>
                  ) : (
                    <span className="font-display font-black text-gold-gradient text-3xl">Sur demande</span>
                  )}
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                    <Icon size={16} className="text-gold-500 mb-2" />
                    <p className="text-white/30 text-xs font-body mb-0.5">{label}</p>
                    <p className="text-white font-semibold text-sm capitalize font-body">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {car.description && (
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-gold-500 font-semibold text-sm mb-3 font-body tracking-wide uppercase">À propos</h2>
                  <p className="text-white/55 leading-relaxed text-sm font-body">{car.description}</p>
                </div>
              )}

              {/* Rating if any */}
              {car.rating && (
                <div className="flex items-center gap-2">
                  {Array.from({length:5}).map((_,i)=>(
                    <Star key={i} size={14} className={i < Math.round(car.rating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'} />
                  ))}
                  <span className="text-white/30 text-sm font-body">{car.rating}/5</span>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                {car.available !== false ? (
                  <Link
                    href={`/reservation?car=${car.id}&name=${encodeURIComponent(car.name)}&prix=${car.resale_price||''}`}
                    className="btn-gold flex-1 py-4 text-base justify-center">
                    <CalendarCheck size={18} />Réserver ce véhicule
                  </Link>
                ) : (
                  <button disabled className="flex-1 py-4 text-base bg-white/[0.04] text-white/30 rounded-xl cursor-not-allowed font-semibold">
                    Indisponible
                  </button>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex-1 sm:flex-none py-4 px-6 justify-center gap-2 text-base">
                  <MessageCircle size={17} />WhatsApp
                </a>
              </div>

              <p className="text-white/20 text-xs font-body text-center">
                Sans caution · Confirmation immédiate · 7j/7 à Oran
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: car } = await supabaseClient.from('cars').select('*').eq('id', params.id).single();
    return { props: { car: car || null } };
  } catch {
    return { props: { car: null } };
  }
}
