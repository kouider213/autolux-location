import Head from 'next/head';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield, Zap, Car, Star, ChevronDown, ArrowRight,
  Users, MapPin, CalendarCheck, Fuel, MessageCircle, Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const BENEFITS = [
  { icon: Shield,        num: '01', title: 'Aucune caution',        desc: 'Pas de dépôt. Nous vous faisons confiance dès le premier jour.' },
  { icon: Zap,           num: '02', title: 'Réservation en 2 min',  desc: 'Formulaire rapide, confirmation immédiate. Votre véhicule est bloqué.' },
  { icon: MessageCircle, num: '03', title: 'Confirmation WhatsApp', desc: 'Reçevez la confirmation directement sur votre téléphone. Simple et direct.' },
  { icon: Car,           num: '04', title: 'Véhicules entretenus',  desc: 'Chaque voiture est nettoyée et contrôlée avant chaque location.' },
  { icon: Users,         num: '05', title: 'Accueil professionnel', desc: 'Notre équipe vous accueille avec le sourire à Oran, 7j/7.' },
  { icon: Sparkles,      num: '06', title: 'Large choix',           desc: 'Citadines, SUV, utilitaires, premium. Le véhicule fait pour vous.' },
];

/* ── Animated counter ── */
function AnimCounter({ to, suffix }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = Date.now();
    const dur = 2200;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}{suffix}</>;
}

export default function Home({ cars, reviews }) {
  const statsRef    = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

  /* Hero car: Mercedes > Alpine > Clio 5 > any with image */
  const heroCar = (
    cars?.find(c => c.name?.toLowerCase().includes('mercedes')) ||
    cars?.find(c => c.name?.toLowerCase().includes('alpine'))   ||
    cars?.find(c => c.name?.toLowerCase().includes('clio 5'))   ||
    cars?.find(c => c.image_url) || null
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  /* ── GSAP ── */
  useEffect(() => {
    let ctx;
    const init = async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* ── 1. ENTRY animation (time-based, runs on load) ── */
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl
          .from('.hero-img-wrap',    { scale: 1.08, duration: 1.8 }, 0)
          .from('.gsap-overlay',     { opacity: 0.2, duration: 1 }, 0)
          .from('.gsap-brand',       { opacity: 0, y: 30, scale: 0.92, duration: 1 }, 0.4)
          .from('.gsap-line1',       { opacity: 0, y: 70, duration: 0.85 }, 0.75)
          .from('.gsap-line2',       { opacity: 0, y: 90, duration: 0.85 }, 0.95)
          .from('.gsap-subtitle',    { opacity: 0, y: 30, duration: 0.7 }, 1.25)
          .from('.gsap-cta',         { opacity: 0, y: 20, duration: 0.6 }, 1.55)
          .from('.gsap-scroll-hint', { opacity: 0, duration: 0.5 }, 1.9);

        /* ── 2. SCROLL: car Ken Burns zoom ── */
        gsap.to('.gsap-hero-car', {
          scale: 1.3, ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
        });

        /* ── 3. SCROLL: hero content fades out as user scrolls ── */
        gsap.to('.gsap-hero-content', {
          opacity: 0, y: -40, ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: '25% top',
            end: '50% top',
            scrub: 1.5,
          },
        });

        /* ── 4. BENEFITS: set all hidden, then reveal one by one ── */
        const slides = gsap.utils.toArray('.gsap-benefit-slide');
        gsap.set(slides, { opacity: 0, y: 60, scale: 0.93 });

        slides.forEach((slide, i) => {
          const n    = slides.length;
          const step = 1 / n;
          const s    = i * step * 100;
          const peak = (i * step + step * 0.38) * 100;
          const hold = (i * step + step * 0.62) * 100;
          const end  = (i + 1) * step * 100;

          gsap.to(slide, {
            opacity: 1, y: 0, scale: 1, ease: 'none',
            scrollTrigger: {
              trigger: '.gsap-benefits-scene',
              start: `${s}% top`,
              end:   `${peak}% top`,
              scrub: 1.5,
            },
          });

          if (i < n - 1) {
            gsap.to(slide, {
              opacity: 0, y: -60, scale: 0.93, ease: 'none',
              scrollTrigger: {
                trigger: '.gsap-benefits-scene',
                start: `${hold}% top`,
                end:   `${end}% top`,
                scrub: 1.5,
              },
            });
          }

          const icon = slide.querySelector('.benefit-icon');
          if (icon) {
            gsap.set(icon, { scale: 0.4, opacity: 0 });
            gsap.to(icon, {
              scale: 1, opacity: 1, ease: 'none',
              scrollTrigger: {
                trigger: '.gsap-benefits-scene',
                start: `${s + 1}% top`,
                end:   `${peak - 3}% top`,
                scrub: 1.2,
              },
            });
          }
        });

        /* ── 5. FLEET: stagger reveal ── */
        gsap.utils.toArray('.gsap-fleet-card').forEach((card) => {
          gsap.fromTo(card,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.7,
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        /* ── 6. Section titles ── */
        gsap.utils.toArray('.gsap-reveal').forEach(el => {
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7,
              scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        /* ── 7. Review cards ── */
        gsap.utils.toArray('.gsap-review').forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.65, delay: i * 0.1,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

      });
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <>
      <Head>
        <title>Fik Conciergerie — Location de Véhicules Premium Oran</title>
        <meta name="description" content="Fik Conciergerie — Location premium à Oran. Large gamme sans caution. Réservation rapide." />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══ HERO SCENE — 450vh ══ */}
        <div className="gsap-hero-scene relative" style={{ height: '450vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden">

            {/* Car image — starts visible, GSAP zooms it */}
            <div className="hero-img-wrap absolute inset-0 overflow-hidden" style={{ willChange: 'transform' }}>
              {heroCar?.image_url ? (
                <img
                  src={heroCar.image_url}
                  alt={heroCar.name}
                  className="gsap-hero-car absolute inset-0 w-full h-full object-cover origin-center"
                  style={{ willChange: 'transform' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
              )}
            </div>

            {/* Overlays */}
            <div className="gsap-overlay absolute inset-0 bg-black" style={{ opacity: 0.55 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />

            {/* ── ALL HERO CONTENT (GSAP animates from invisible via tl) ── */}
            <div className="gsap-hero-content absolute inset-0">

              {/* Brand — center at start */}
              <div className="gsap-brand absolute inset-0 flex items-center justify-center flex-col gap-3 pointer-events-none">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(226,182,20,0.6)]">
                  <span className="font-black text-noir-950 text-xl">FK</span>
                </div>
                <p className="font-display text-2xl font-bold text-white tracking-wide">Fik Conciergerie</p>
                <p className="text-white/40 text-sm tracking-[0.25em] uppercase font-body">Location Premium · Oran</p>
              </div>

              {/* Main headline — bottom left */}
              <div className="absolute left-6 md:left-14 bottom-[28%] right-6 pointer-events-none">
                <div className="overflow-hidden">
                  <h1 className="gsap-line1 font-display font-black text-hero-gradient leading-[0.88]"
                    style={{ fontSize: 'clamp(52px, 9.5vw, 120px)' }}>
                    La Route,
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1 className="gsap-line2 font-display font-black text-gold-gradient italic leading-[0.88]"
                    style={{ fontSize: 'clamp(52px, 9.5vw, 120px)' }}>
                    Votre Style
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <div className="gsap-subtitle absolute left-6 md:left-14 bottom-[18%] pointer-events-none">
                <p className="text-white/60 text-base md:text-xl font-body max-w-md leading-relaxed">
                  Location de véhicules premium à Oran.<br />
                  <span className="text-white/40 text-sm md:text-base">Sans caution · Réservation rapide · 7j/7</span>
                </p>
              </div>

              {/* CTAs */}
              <div className="gsap-cta absolute left-6 md:left-14 bottom-[7%] flex gap-3 flex-wrap">
                <Link href="/reservation" className="btn-gold text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  <CalendarCheck size={16} />Réserver
                </Link>
                <Link href="/cars" className="btn-outline text-sm md:text-base px-5 md:px-7 py-3 md:py-4">
                  <Car size={15} />La flotte
                </Link>
              </div>

              {/* Car name badge */}
              {heroCar && (
                <div className="absolute bottom-7 right-6 text-right pointer-events-none">
                  <p className="text-white/20 text-xs tracking-widest uppercase font-body">{heroCar.category}</p>
                  <p className="text-white/60 font-display font-bold text-sm md:text-base">{heroCar.name}</p>
                  <p className="text-gold-400 font-display font-bold text-lg">{heroCar.resale_price}€<span className="text-white/30 text-xs font-body font-normal">/jour</span></p>
                </div>
              )}

              {/* Scroll hint */}
              <div className="gsap-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25 pointer-events-none">
                <span className="text-[8px] tracking-[0.3em] uppercase font-body">Défiler pour explorer</span>
                <ChevronDown size={12} className="animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* ══ BENEFITS SCENE — 700vh ══ */}
        <div className="gsap-benefits-scene relative" style={{ height: '700vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />

            {BENEFITS.map((b, i) => (
              <div key={i} className="gsap-benefit-slide absolute inset-0 flex items-center justify-center px-8">
                <div className="max-w-xl text-center">
                  <div className="benefit-icon w-20 h-20 bg-gold-500/[0.08] border border-gold-500/25 rounded-2xl flex items-center justify-center mx-auto mb-7">
                    <b.icon size={32} className="text-gold-400" />
                  </div>
                  <p className="text-white/20 text-xs tracking-[0.3em] uppercase font-body mb-4">{b.num} / 06</p>
                  <h2 className="font-display font-black text-white mb-5 leading-tight"
                    style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
                    {b.title}
                  </h2>
                  <p className="text-white/45 text-lg md:text-xl font-body leading-relaxed">{b.desc}</p>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mt-7" />
                </div>
              </div>
            ))}

            {/* Progress indicator */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
              {BENEFITS.map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* ══ FLEET GRID ══ */}
        <section className="py-28 px-5 relative overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="gsap-reveal mb-14">
              <span className="section-badge mb-5 inline-block">Notre flotte</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                  Choisissez votre <span className="text-gold-gradient italic">véhicule</span>
                </h2>
                <Link href="/cars" className="btn-outline text-sm py-2.5 self-start">
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {(cars || []).slice(0, 8).map((car) => (
                <div key={car.id} className="gsap-fleet-card group relative overflow-hidden rounded-xl md:rounded-2xl"
                  style={{ aspectRatio: '3/4' }}>
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] flex items-center justify-center">
                      <Car size={40} className="text-white/[0.05]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-2 left-2 md:top-3 md:left-3">
                    <span className="tag-category capitalize text-[10px] md:text-xs">{car.category}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    <h3 className="font-display font-bold text-white text-sm md:text-lg mb-1 leading-tight">{car.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <div className="text-gold-400 font-display font-bold text-base md:text-xl">{car.resale_price}€</div>
                        <div className="text-white/30 text-[10px] md:text-xs font-body">/ jour</div>
                      </div>
                      <Link href={`/reservation?car=${car.id}`}
                        className="bg-gold-500 hover:bg-gold-400 text-noir-950 font-semibold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 flex items-center gap-1 font-body"
                        onClick={e => e.stopPropagation()}>
                        <CalendarCheck size={11} />Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} className="relative py-28 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="gsap-reveal text-center mb-20">
              <span className="section-badge mb-5 inline-block">Fik Conciergerie en chiffres</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mt-5">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {[
                { val: cars?.length||14, suffix:'',  label:'Véhicules',          desc:'dans notre flotte' },
                { val: 500,              suffix:'+', label:'Clients satisfaits',  desc:'depuis l\'ouverture' },
                { val: 0,               suffix:'€', label:'Caution',             desc:'confiance totale' },
                { val: 98,              suffix:'%', label:'Satisfaction',        desc:'avis vérifiés' },
              ].map((s, i) => (
                <div key={i} className="gsap-reveal text-center">
                  <div className="font-display font-black text-gold-gradient leading-none mb-3"
                       style={{ fontSize: 'clamp(44px, 6vw, 80px)' }}>
                    {statsInView ? <AnimCounter to={s.val} suffix={s.suffix} /> : `0${s.suffix}`}
                  </div>
                  <div className="text-white font-semibold text-sm md:text-base font-body mb-1">{s.label}</div>
                  <div className="text-white/30 text-xs md:text-sm font-body">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        {reviews?.length > 0 && (
          <section className="py-28 px-5 relative overflow-hidden bg-[#080808]">
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />
            <div className="relative z-10 max-w-7xl mx-auto">
              <div className="gsap-reveal text-center mb-14">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0, 3).map((review, i) => (
                  <div key={review.id} className="gsap-review card-dark p-6 relative overflow-hidden">
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
                  </div>
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
        <section className="relative py-28 md:py-32 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="gsap-reveal">
              <motion.div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
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
            </div>
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
              <MapPin size={10} /><span>Oran, Algérie · © {new Date().getFullYear()} Fik Conciergerie</span>
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
    return { props: { cars: cars || [], reviews: reviews || [] }, revalidate: 60 };
  } catch {
    return { props: { cars: [], reviews: [] }, revalidate: 30 };
  }
}
