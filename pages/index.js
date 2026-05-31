import Head from 'next/head';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
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
  { icon: MessageCircle, num:'03', title:'Confirmation WhatsApp', desc:'Reçevez la confirmation directement sur votre téléphone.' },
  { icon: Car,           num:'04', title:'Véhicules entretenus',  desc:'Chaque voiture est nettoyée et contrôlée avant chaque location.' },
  { icon: Users,         num:'05', title:'Accueil professionnel', desc:'Notre équipe vous accueille avec le sourire à Oran, 7j/7.' },
  { icon: Sparkles,      num:'06', title:'Large choix',           desc:'Citadines, SUV, utilitaires, premium. Le véhicule fait pour vous.' },
];

/* ── Animated counter ── */
function AnimCounter({ to, suffix }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / 2200, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}{suffix}</>;
}

/* ── Interactive car carousel ── */
function CarCarousel({ cars }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const total = cars.length;

  const goTo = (next) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => goTo(idx === 0 ? total - 1 : idx - 1);
  const next = () => goTo(idx === total - 1 ? 0 : idx + 1);

  const car = cars[idx];
  if (!car) return null;

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="relative" style={{ height: '90vh', maxHeight: 700 }}>
      {/* Car slides */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {/* Background image */}
            {car.image_url ? (
              <motion.img
                src={car.image_url}
                alt={car.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#080808] flex items-center justify-center">
                <Car size={100} className="text-white/[0.05]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

            {/* Car info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Category + index */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="tag-category capitalize">{car.category}</span>
                  <span className="text-white/25 text-xs font-body tracking-widest">
                    {String(idx + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-display font-black text-white leading-[0.9] mb-3"
                  style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}>
                  {car.name}
                </h3>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
                    <Fuel size={12} className="text-gold-500/60" />{car.fuel}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
                    <Users size={12} className="text-gold-500/60" />{car.seats} places
                  </span>
                  {car.transmission && (
                    <><span className="text-white/20">·</span>
                    <span className="text-white/50 text-sm capitalize font-body">{car.transmission}</span></>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-white/30 text-xs tracking-widest uppercase font-body block mb-1">À partir de</span>
                    <span className="font-display font-black text-gold-gradient leading-none"
                      style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
                      {car.resale_price}€
                    </span>
                    <span className="text-white/30 text-sm font-body ml-1">/jour</span>
                  </div>
                  <Link
                    href={`/reservation?car=${car.id}`}
                    className="btn-gold px-6 py-3 text-sm md:text-base whitespace-nowrap"
                  >
                    <CalendarCheck size={15} />Réserver
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all duration-200">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all duration-200">
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {cars.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-1.5 bg-gold-500' : 'w-1.5 h-1.5 bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Home({ cars, reviews }) {
  const statsRef   = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });
  const benefitsRef = useRef(null);

  const heroCar = (
    cars?.find(c => c.name?.toLowerCase().includes('mercedes')) ||
    cars?.find(c => c.name?.toLowerCase().includes('alpine'))   ||
    cars?.find(c => c.name?.toLowerCase().includes('clio 5'))   ||
    cars?.find(c => c.image_url) || null
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  /* GSAP: ONLY for hero car zoom + benefits scroll (no initial opacity changes) */
  useEffect(() => {
    let ctx;
    const init = async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        /* Car Ken Burns — pure enhancement, no opacity manipulation */
        gsap.to('.gsap-hero-car', {
          scale: 1.25, ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
        });

        /* Hero content slides up on scroll */
        gsap.to('.gsap-hero-content', {
          y: -50, opacity: 0, ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: '30% top',
            end: '55% top',
            scrub: 1.5,
          },
        });

        /* Benefits: set invisible then reveal per scrub */
        const slides = gsap.utils.toArray('.gsap-benefit-slide');
        gsap.set(slides, { opacity: 0, y: 50, scale: 0.94 });

        slides.forEach((slide, i) => {
          const n    = slides.length;
          const step = 1 / n;
          const s    = i * step * 100;
          const peak = (i * step + step * 0.40) * 100;
          const hold = (i * step + step * 0.60) * 100;
          const end  = (i + 1) * step * 100;

          gsap.to(slide, {
            opacity: 1, y: 0, scale: 1, ease: 'none',
            scrollTrigger: { trigger: '.gsap-benefits-scene', start: `${s}% top`, end: `${peak}% top`, scrub: 1.5 },
          });
          if (i < n - 1) {
            gsap.to(slide, {
              opacity: 0, y: -50, scale: 0.94, ease: 'none',
              scrollTrigger: { trigger: '.gsap-benefits-scene', start: `${hold}% top`, end: `${end}% top`, scrub: 1.5 },
            });
          }
        });
      });
    };
    init();
    return () => ctx?.revert();
  }, []);

  const ease = [0.16, 1, 0.3, 1];

  return (
    <>
      <Head>
        <title>Fik Conciergerie — Location de Véhicules Premium Oran</title>
        <meta name="description" content="Fik Conciergerie — Location premium à Oran. Sans caution. Réservation rapide." />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══ HERO — CSS animated, instant ══ */}
        <div className="gsap-hero-scene relative" style={{ height: '400vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden">

            {/* Background image — CSS zoom in */}
            <div className="absolute inset-0 overflow-hidden">
              {heroCar?.image_url ? (
                <img src={heroCar.image_url} alt={heroCar.name}
                  className="gsap-hero-car hero-css-img absolute inset-0 w-full h-full object-cover origin-center"
                  style={{ willChange: 'transform' }} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#050505]" />
              )}
            </div>

            {/* Overlays */}
            <div className="hero-css-overlay absolute inset-0 bg-black" style={{ opacity: 0.52 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

            {/* ── Hero content ── */}
            <div className="gsap-hero-content absolute inset-0">

              {/* Brand badge — center, CSS animated */}
              <div className="hero-css-brand absolute inset-0 flex items-center justify-center flex-col gap-3 pointer-events-none" style={{ paddingBottom: '20%' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(226,182,20,0.55)]">
                  <span className="font-black text-noir-950 text-xl">FK</span>
                </div>
                <p className="font-display text-xl font-bold text-white tracking-wide">Fik Conciergerie</p>
                <p className="text-white/35 text-xs tracking-[0.25em] uppercase font-body">Location Premium · Oran</p>
              </div>

              {/* Headline bottom-left — CSS animated */}
              <div className="absolute left-5 md:left-12 bottom-[30%] right-5 pointer-events-none">
                <div className="overflow-hidden">
                  <h1 className="hero-css-line1 font-display font-black text-hero-gradient leading-[0.88]"
                    style={{ fontSize: 'clamp(50px, 9vw, 116px)' }}>
                    La Route,
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1 className="hero-css-line2 font-display font-black text-gold-gradient italic leading-[0.88]"
                    style={{ fontSize: 'clamp(50px, 9vw, 116px)' }}>
                    Votre Style
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <div className="hero-css-sub absolute left-5 md:left-12 bottom-[20%] right-5 pointer-events-none">
                <p className="text-white/60 text-base md:text-xl font-body max-w-md leading-relaxed">
                  Location de véhicules premium à Oran.
                  <span className="block text-white/35 text-sm md:text-base mt-0.5">Sans caution · Réservation rapide · 7j/7</span>
                </p>
              </div>

              {/* CTAs */}
              <div className="hero-css-cta absolute left-5 md:left-12 bottom-[8%] flex gap-3 flex-wrap">
                <Link href="/reservation" className="btn-gold text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  <CalendarCheck size={16} />Réserver
                </Link>
                <Link href="/cars" className="btn-outline text-sm md:text-base px-5 md:px-7 py-3 md:py-4">
                  <Car size={15} />La flotte
                </Link>
              </div>

              {/* Car badge */}
              {heroCar && (
                <div className="hero-css-sub absolute bottom-6 right-5 text-right pointer-events-none">
                  <p className="text-white/20 text-[10px] tracking-widest uppercase font-body">{heroCar.category}</p>
                  <p className="text-white/55 font-display font-bold text-sm">{heroCar.name}</p>
                  <p className="text-gold-400 font-display font-bold text-lg">{heroCar.resale_price}€<span className="text-white/25 text-xs font-body">/j</span></p>
                </div>
              )}

              {/* Scroll hint */}
              <div className="hero-css-hint absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25 pointer-events-none">
                <span className="text-[8px] tracking-[0.3em] uppercase font-body">Défiler</span>
                <ChevronDown size={12} className="animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* ══ BENEFITS SCENE — 700vh ══ */}
        <div className="gsap-benefits-scene relative" style={{ height: '700vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 opacity-[0.018]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />

            {BENEFITS.map((b, i) => (
              <div key={i} className="gsap-benefit-slide absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-lg text-center">
                  <div className="w-18 h-18 w-[72px] h-[72px] bg-gold-500/[0.08] border border-gold-500/25 rounded-2xl flex items-center justify-center mx-auto mb-7">
                    <b.icon size={30} className="text-gold-400" />
                  </div>
                  <p className="text-white/20 text-xs tracking-[0.3em] uppercase font-body mb-4">{b.num} / 06</p>
                  <h2 className="font-display font-black text-white mb-5 leading-tight"
                    style={{ fontSize: 'clamp(30px, 5vw, 60px)' }}>
                    {b.title}
                  </h2>
                  <p className="text-white/45 text-base md:text-xl font-body leading-relaxed">{b.desc}</p>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mt-7" />
                </div>
              </div>
            ))}

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
              {BENEFITS.map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* ══ VÉHICULES INTERACTIFS ══ */}
        <section className="py-20 px-5 relative overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div className="mb-10"
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.7, ease }}>
              <span className="section-badge mb-5 inline-block">Notre flotte</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                  Choisissez votre <span className="text-gold-gradient italic">véhicule</span>
                </h2>
                <Link href="/cars" className="btn-outline text-sm py-2.5 self-start">
                  Tous les véhicules <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>

            {cars && cars.length > 0 && (
              <motion.div
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.7, delay:0.15, ease }}>
                <CarCarousel cars={cars.filter(c => c.available !== false)} />
              </motion.div>
            )}
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} className="relative py-24 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}>
              <span className="section-badge mb-5 inline-block">Fik Conciergerie en chiffres</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mt-5">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {[
                { val:cars?.length||14, suffix:'',  label:'Véhicules',         desc:'dans notre flotte' },
                { val:500,             suffix:'+', label:'Clients satisfaits',  desc:"depuis l'ouverture" },
                { val:0,               suffix:'€', label:'Caution',             desc:'confiance totale' },
                { val:98,              suffix:'%', label:'Satisfaction',        desc:'avis vérifiés' },
              ].map((s, i) => (
                <motion.div key={i} className="text-center"
                  initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.1, ease }}>
                  <div className="font-display font-black text-gold-gradient leading-none mb-3"
                       style={{ fontSize:'clamp(44px,6vw,80px)' }}>
                    {statsInView ? <AnimCounter to={s.val} suffix={s.suffix}/> : `0${s.suffix}`}
                  </div>
                  <div className="text-white font-semibold text-sm md:text-base font-body mb-1">{s.label}</div>
                  <div className="text-white/30 text-xs md:text-sm font-body">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        {reviews?.length > 0 && (
          <section className="py-24 px-5 relative overflow-hidden bg-[#080808]">
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background:'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />
            <div className="relative z-10 max-w-7xl mx-auto">
              <motion.div className="text-center mb-14"
                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.7 }}>
                <span className="section-badge mb-5 inline-block">Témoignages</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  Ils nous font <span className="text-gold-gradient italic">confiance</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <Star key={i} size={14} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500':'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}/5 · {reviews.length} avis</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0,3).map((review,i) => (
                  <motion.div key={review.id} className="card-dark p-6 relative overflow-hidden"
                    initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }} transition={{ duration:0.65, delay:i*0.12, ease }}
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
        <section className="relative py-28 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
               style={{ background:'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.8, ease }}>
              <motion.div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y:[0,-10,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}>
                <Car size={32} className="text-gold-400" />
              </motion.div>
              <h2 className="font-display text-4xl md:text-7xl font-bold text-white mb-6 leading-[0.9]">
                Prêt à prendre<br /><span className="text-gold-gradient italic">la route ?</span>
              </h2>
              <p className="text-white/35 text-lg md:text-xl mb-12 font-body leading-relaxed">
                Réservez dès maintenant votre véhicule à Oran.<br />Simple, rapide, sans caution.
              </p>
              <Link href="/reservation" className="btn-gold text-base md:text-lg px-10 md:px-14 py-4 md:py-5 animate-pulse-gold">
                <CalendarCheck size={18} />Réserver maintenant
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-white/[0.05] bg-[#050505] py-7 px-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <span className="text-noir-950 font-black text-xs">FK</span>
              </div>
              <span className="font-display font-bold text-white">Fik <span className="text-gold-500">Conciergerie</span></span>
            </div>
            <div className="flex gap-5 text-white/25 text-sm font-body">
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
    const { data: cars }    = await supabase.from('cars').select('*').order('resale_price');
    const { data: reviews } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6);
    return { props: { cars: cars||[], reviews: reviews||[] }, revalidate: 60 };
  } catch {
    return { props: { cars: [], reviews: [] }, revalidate: 30 };
  }
}
