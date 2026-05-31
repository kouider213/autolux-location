import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Car, Star, ChevronDown, ArrowRight, ChevronLeft, ChevronRight,
  Users, MapPin, CalendarCheck, Fuel, MessageCircle, Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const BENEFITS = [
  { icon: Shield,        num:'01', title:'Aucune caution',        desc:'Pas de dépôt. Nous vous faisons confiance dès le premier jour.' },
  { icon: Zap,           num:'02', title:'Réservation en 2 min',  desc:'Formulaire rapide, confirmation immédiate. Votre véhicule est bloqué.' },
  { icon: MessageCircle, num:'03', title:'Confirmation WhatsApp', desc:'Recevez la confirmation directement sur votre téléphone.' },
  { icon: Car,           num:'04', title:'Véhicules entretenus',  desc:'Chaque voiture est nettoyée et contrôlée avant chaque location.' },
  { icon: Users,         num:'05', title:'Accueil professionnel', desc:'Notre équipe vous accueille avec le sourire à Oran, 7j/7.' },
  { icon: Sparkles,      num:'06', title:'Large choix',           desc:'Citadines, SUV, utilitaires, premium. Le véhicule fait pour vous.' },
];

function BenefitsCarousel({ benefits }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = benefits[idx];

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % benefits.length), 3000);
    return () => clearInterval(timer);
  }, [paused, benefits.length]);

  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e) => { setTouchStart(e.touches[0].clientX); setPaused(true); };
  const handleTouchEnd = (e) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setIdx(i => diff > 0 ? (i + 1) % benefits.length : (i - 1 + benefits.length) % benefits.length);
    }
    setTimeout(() => setPaused(false), 2000);
  };

  return (
    <div className="relative w-full select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }}>
          <div className="flex items-center justify-center px-4 py-10 md:py-14">
            <div className="max-w-lg text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gold-500/[0.08] border border-gold-500/25 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <slide.icon size={28} className="text-gold-400" />
              </div>
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase font-body mb-3">{slide.num} / 06</p>
              <h2 className="font-display font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}>
                {slide.title}
              </h2>
              <p className="text-white/60 text-base md:text-lg font-body leading-relaxed">{slide.desc}</p>
              <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mt-6" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 pb-2">
        {benefits.map((_, i) => (
          <button key={i}
            onClick={() => { setIdx(i); setPaused(true); setTimeout(() => setPaused(false), 3000); }}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-8 h-2 bg-gold-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
      <p className="text-center text-white/20 text-xs mt-3 pb-4 md:hidden">Glissez pour naviguer</p>
    </div>
  );
}

function AnimCounter({ to, suffix }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / 2000, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, inView]);

  return <span ref={ref}>{v}{suffix}</span>;
}

function CarCarousel({ cars }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const total = cars.length;

  const goTo = (next) => { setDir(next > idx ? 1 : -1); setIdx(next); };
  const prev = () => goTo(idx === 0 ? total - 1 : idx - 1);
  const next = () => goTo(idx === total - 1 ? 0 : idx + 1);

  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  const car = cars[idx];
  if (!car) return null;

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 'min(90vh, 680px)' }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={idx} custom={dir} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          className="absolute inset-0">

          {car.image_url ? (
            <img src={car.image_url} alt={car.name}
              className="w-full h-full object-cover object-center"
              loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#080808] flex items-center justify-center">
              <Car size={80} className="text-white/[0.05]" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <motion.div className="absolute bottom-0 left-0 right-0 p-5 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="tag-category capitalize">{car.category}</span>
              <span className="text-white/25 text-xs font-body tracking-widest">
                {String(idx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
              </span>
            </div>
            <h3 className="font-display font-black text-white leading-[0.9] mb-3"
              style={{ fontSize: 'clamp(32px, 6vw, 68px)' }}>
              {car.name}
            </h3>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
                <Fuel size={12} className="text-gold-500/70" />{car.fuel}
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
                <Users size={12} className="text-gold-500/70" />{car.seats} places
              </span>
              {car.transmission && (
                <><span className="text-white/20">·</span>
                <span className="text-white/50 text-sm capitalize font-body">{car.transmission}</span></>
              )}
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-white/30 text-xs tracking-widest uppercase font-body block mb-1">À partir de</span>
                <span className="font-display font-black text-gold-gradient leading-none"
                  style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                  {car.resale_price}€
                </span>
                <span className="text-white/30 text-sm font-body ml-1">/jour</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/cars/${car.id}`}
                  className="btn-outline text-sm py-2.5 px-4 whitespace-nowrap">
                  Détails
                </Link>
                <Link href={`/reservation?car=${car.id}`}
                  className="btn-gold text-sm py-2.5 px-5 whitespace-nowrap">
                  <CalendarCheck size={14} />Réserver
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all duration-200">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all duration-200">
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {cars.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-gold-500' : 'w-1.5 h-1.5 bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home({ cars: initialCars, reviews: initialReviews }) {
  const statsRef = useRef(null);
  const [cars, setCars] = useState(initialCars || []);
  const [reviews, setReviews] = useState(initialReviews || []);

  // Client-side refresh: always get fresh Supabase data (bypasses ISR cache)
  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('cars').select('*').order('resale_price'),
      supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6),
    ]).then(([{ data: carsData }, { data: reviewsData }]) => {
      if (carsData?.length > 0) setCars(carsData);
      if (reviewsData?.length > 0) setReviews(reviewsData);
    }).catch(() => {});
  }, []);

  const heroCar = (
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('mercedes')) ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('alpine'))   ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('clio'))     ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('duster'))   ||
    cars?.find(c => c.image_url) || null
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const ease = [0.16, 1, 0.3, 1];

  return (
    <>
      <Head>
        <title>Fik Conciergerie — Location de Véhicules Premium Oran</title>
        <meta name="description" content="Fik Conciergerie — Location premium à Oran. Sans caution. Réservation rapide 7j/7." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══ HERO ══ */}
        <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">

          {/* Background image — always visible */}
          {heroCar?.image_url ? (
            <img
              src={heroCar.image_url}
              alt={heroCar.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
              fetchpriority="high"
              style={{ zIndex: 0 }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1200] via-[#0d0d0d] to-[#050505]" style={{ zIndex: 0 }} />
          )}

          {/* Overlays for readability */}
          <div className="absolute inset-0 bg-black/45" style={{ zIndex: 1 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" style={{ zIndex: 1 }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" style={{ zIndex: 2 }} />

          {/* Content */}
          <div className="relative flex flex-col min-h-[100dvh] pt-20 pb-8 px-5 md:px-12" style={{ zIndex: 2 }}>

            {/* Brand badge — top center */}
            <div className="flex flex-col items-center gap-2 mt-4 mb-auto hero-css-brand">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(226,182,20,0.5)] animate-float">
                <span className="font-black text-noir-950 text-xl">FK</span>
              </div>
              <p className="font-display text-lg font-bold text-white tracking-wide">Fik Conciergerie</p>
              <p className="text-white/35 text-[10px] tracking-[0.25em] uppercase font-body">Location Premium · Oran</p>
            </div>

            {/* Headline — bottom */}
            <div className="mt-auto">
              <div className="overflow-hidden mb-1">
                <h1 className="hero-css-line1 font-display font-black text-white leading-[0.88]"
                  style={{ fontSize: 'clamp(44px, 10vw, 108px)' }}>
                  La Route,
                </h1>
              </div>
              <div className="overflow-hidden mb-4">
                <h1 className="hero-css-line2 font-display font-black text-gold-gradient italic leading-[0.88]"
                  style={{ fontSize: 'clamp(44px, 10vw, 108px)' }}>
                  Votre Style
                </h1>
              </div>

              <p className="hero-css-sub text-white/65 text-base md:text-xl font-body max-w-md leading-relaxed mb-2">
                Location de véhicules premium à Oran.
              </p>
              <p className="hero-css-sub text-white/35 text-sm md:text-base font-body mb-6">
                Sans caution · Réservation rapide · 7j/7
              </p>

              <div className="hero-css-cta flex items-center gap-3 flex-wrap mb-6">
                <Link href="/reservation" className="btn-gold text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  <CalendarCheck size={16} />Réserver
                </Link>
                <Link href="/cars" className="btn-outline text-sm md:text-base px-5 md:px-7 py-3 md:py-4">
                  <Car size={14} />La flotte
                </Link>
              </div>

              <div className="flex items-center justify-between">
                {heroCar && (
                  <div className="hero-css-sub">
                    <p className="text-white/20 text-[9px] tracking-widest uppercase font-body">{heroCar.category}</p>
                    <p className="text-white/55 font-display font-semibold text-sm">{heroCar.name}</p>
                    <p className="text-gold-400 font-display font-bold">{heroCar.resale_price}€<span className="text-white/25 text-xs font-body">/j</span></p>
                  </div>
                )}
                <div className="hero-css-hint flex flex-col items-center gap-1 text-white/25">
                  <span className="text-[8px] tracking-[0.3em] uppercase font-body">Défiler</span>
                  <ChevronDown size={12} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BENEFITS ══ */}
        <section className="relative py-14 md:py-20 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 opacity-[0.018] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.06) 0%,transparent 65%)' }} />
          <div className="relative max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">Avantages</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-3">
                Pourquoi <span className="text-gold-gradient italic">nous choisir</span>
              </h2>
            </div>
            <BenefitsCarousel benefits={BENEFITS} />
          </div>
        </section>

        {/* ══ FLOTTE ══ */}
        <section className="py-14 md:py-20 px-5 relative overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="mb-8 md:mb-10">
              <span className="section-badge mb-4 inline-block">Notre flotte</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
                  Choisissez votre <span className="text-gold-gradient italic">véhicule</span>
                </h2>
                <Link href="/cars" className="btn-outline text-sm py-2.5 self-start whitespace-nowrap">
                  Tous les véhicules <ArrowRight size={13} />
                </Link>
              </div>
            </div>
            {cars && cars.length > 0 && (
              <CarCarousel cars={cars.filter(c => c.available !== false)} />
            )}
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} className="relative py-14 md:py-24 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="section-badge mb-4 inline-block">En chiffres</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-3">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { val: cars?.length||14, suffix:'',  label:'Véhicules',        desc:'dans notre flotte' },
                { val: 500,              suffix:'+', label:'Clients satisfaits', desc:"depuis l'ouverture" },
                { val: 0,                suffix:'€', label:'Caution',            desc:'confiance totale' },
                { val: 98,               suffix:'%', label:'Satisfaction',       desc:'avis vérifiés' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display font-black text-gold-gradient leading-none mb-2"
                       style={{ fontSize:'clamp(40px,6vw,72px)' }}>
                    <AnimCounter to={s.val} suffix={s.suffix}/>
                  </div>
                  <div className="text-white font-semibold text-sm md:text-base font-body mb-1">{s.label}</div>
                  <div className="text-white/30 text-xs font-body">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        {reviews?.length > 0 && (
          <section className="py-14 md:py-24 px-5 relative overflow-hidden bg-[#080808]">
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background:'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="section-badge mb-4 inline-block">Témoignages</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-3">
                  Ils nous font <span className="text-gold-gradient italic">confiance</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <Star key={i} size={14} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500':'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}/5 · {reviews.length} avis</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0,3).map((review,i) => (
                  <motion.div key={review.id} className="card-dark p-6 relative overflow-hidden"
                    initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }} transition={{ duration:0.55, delay:i*0.1, ease }}
                    whileHover={{ y:-4, transition:{duration:0.2} }}>
                    <span className="absolute top-3 right-4 font-display text-8xl text-gold-500/[0.05] leading-none select-none pointer-events-none">"</span>
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({length:5}).map((_,j)=>(
                        <Star key={j} size={12} className={j < review.rating ? 'text-gold-500 fill-gold-500':'text-white/10'} />
                      ))}
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed italic mb-5 font-body">"{review.comment}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="w-9 h-9 bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <p className="text-white font-medium text-sm font-body">{review.client_name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/reviews" className="btn-ghost text-sm text-white/35 hover:text-white font-body">
                  Voir tous les avis <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══ CTA ══ */}
        <section className="relative py-20 md:py-28 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
               style={{ background:'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <motion.div className="w-16 h-16 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8"
              animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}>
              <Car size={28} className="text-gold-400" />
            </motion.div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-5 leading-[0.9]">
              Prêt à prendre<br /><span className="text-gold-gradient italic">la route ?</span>
            </h2>
            <p className="text-white/35 text-base md:text-lg mb-10 font-body leading-relaxed">
              Réservez dès maintenant votre véhicule à Oran.<br />Simple, rapide, sans caution.
            </p>
            <Link href="/reservation" className="btn-gold text-base md:text-lg px-10 py-4 animate-pulse-gold">
              <CalendarCheck size={18} />Réserver maintenant
            </Link>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-white/[0.05] bg-[#050505] py-6 px-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <span className="text-noir-950 font-black text-xs">FK</span>
              </div>
              <span className="font-display font-bold text-white">Fik <span className="text-gold-500">Conciergerie</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-white/25 text-sm font-body">
              {[{h:'/cars',l:'Véhicules'},{h:'/conditions',l:'Conditions'},{h:'/reviews',l:'Avis'},{h:'/reservation',l:'Réserver'}].map(x=>(
                <Link key={x.h} href={x.h} className="hover:text-gold-400 transition-colors">{x.l}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-white/20 text-xs font-body">
              <MapPin size={10}/><span>Oran, Algérie · © {new Date().getFullYear()} Fik Conciergerie</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { cars: [], reviews: [] }, revalidate: 30 };
    const [{ data: cars }, { data: reviews }] = await Promise.all([
      supabase.from('cars').select('*').order('resale_price'),
      supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6),
    ]);
    return { props: { cars: cars||[], reviews: reviews||[] }, revalidate: 30 };
  } catch {
    return { props: { cars: [], reviews: [] }, revalidate: 30 };
  }
}
