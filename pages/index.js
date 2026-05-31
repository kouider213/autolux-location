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
  { icon: Shield,        num: '01', title: 'Aucune caution',       desc: 'Pas de dépôt. Pas de stress. Nous vous faisons confiance dès le premier jour.' },
  { icon: Zap,           num: '02', title: 'Réservation en 2 min', desc: 'Formulaire rapide, confirmation immédiate. Votre véhicule est bloqué.' },
  { icon: MessageCircle, num: '03', title: 'Confirmation WhatsApp', desc: 'Reçevez la confirmation directement sur votre téléphone. Simple et direct.' },
  { icon: Car,           num: '04', title: 'Véhicules entretenus', desc: 'Chaque voiture est nettoyée et contrôlée avant chaque location.' },
  { icon: Users,         num: '05', title: 'Accueil professionnel', desc: 'Notre équipe vous accueille avec le sourire à Oran, 7j/7.' },
  { icon: Sparkles,      num: '06', title: 'Large choix',          desc: 'Citadines, SUV, utilitaires, premium. Trouvez le véhicule fait pour vous.' },
];

export default function Home({ cars, reviews }) {
  const statsRef   = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 });

  const heroCar   = cars?.find(c => c.image_url) || null;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  /* ─────────────────────────────────────────
     GSAP ScrollTrigger — client side only
  ───────────────────────────────────────── */
  useEffect(() => {
    let ctx;

    const init = async () => {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        /* ── HERO: car zoom + text reveals ── */
        // Car Ken Burns zoom throughout hero scroll
        gsap.to('.gsap-hero-car', {
          scale: 1.35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          },
        });

        // Overlay darkens
        gsap.to('.gsap-hero-overlay', {
          opacity: 0.8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero-scene',
            start: 'top top',
            end: '50% top',
            scrub: 2,
          },
        });

        // Gold line expands 0-12%
        gsap.fromTo('.gsap-gold-line',
          { scaleX: 0 },
          { scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '0% top', end: '12% top', scrub: 1.5 } });

        // Brand logo in: 0-10%
        gsap.fromTo('.gsap-brand',
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '0% top', end: '10% top', scrub: 1.5 } });

        // Brand logo out: 14-24%
        gsap.to('.gsap-brand', {
          opacity: 0, y: -40, scale: 0.9, ease: 'none',
          scrollTrigger: { trigger: '.gsap-hero-scene', start: '14% top', end: '24% top', scrub: 1.5 },
        });

        // Headline "La Route," 22-36%
        gsap.fromTo('.gsap-line1',
          { opacity: 0, y: 90 },
          { opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '22% top', end: '34% top', scrub: 1.5 } });

        // Headline "Votre Style" 30-44%
        gsap.fromTo('.gsap-line2',
          { opacity: 0, y: 110 },
          { opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '30% top', end: '42% top', scrub: 1.5 } });

        // Subtitle 42-54%
        gsap.fromTo('.gsap-subtitle',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '42% top', end: '54% top', scrub: 1.5 } });

        // CTAs 52-64%
        gsap.fromTo('.gsap-cta',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: '.gsap-hero-scene', start: '52% top', end: '64% top', scrub: 1.5 } });

        // Scroll hint fades out immediately
        gsap.to('.gsap-scroll-hint', {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: '.gsap-hero-scene', start: '2% top', end: '8% top', scrub: 1 },
        });

        /* ── BENEFITS: one by one ── */
        const slides   = gsap.utils.toArray('.gsap-benefit-slide');
        const n        = slides.length;
        const step     = 1 / n;

        slides.forEach((slide, i) => {
          const s     = i * step * 100;       // start appear %
          const peak  = (i * step + step * 0.35) * 100;
          const hold  = (i * step + step * 0.62) * 100;
          const end   = (i + 1) * step * 100;

          // Appear
          gsap.fromTo(slide,
            { opacity: 0, y: 70, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, ease: 'none',
              scrollTrigger: { trigger: '.gsap-benefits-scene', start: `${s}% top`, end: `${peak}% top`, scrub: 1.5 } });

          // Disappear (not last)
          if (i < n - 1) {
            gsap.to(slide, {
              opacity: 0, y: -70, scale: 0.94, ease: 'none',
              scrollTrigger: { trigger: '.gsap-benefits-scene', start: `${hold}% top`, end: `${end}% top`, scrub: 1.5 },
            });
          }

          // Icon pop
          const icon = slide.querySelector('.benefit-icon');
          if (icon) {
            gsap.fromTo(icon,
              { scale: 0.3, rotation: -20, opacity: 0 },
              { scale: 1, rotation: 0, opacity: 1, ease: 'none',
                scrollTrigger: { trigger: '.gsap-benefits-scene', start: `${s + 1}% top`, end: `${peak - 2}% top`, scrub: 1.5 } });
          }
        });

        /* ── FLEET: scroll-triggered stagger ── */
        gsap.utils.toArray('.gsap-fleet-card').forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 55 },
            { opacity: 1, y: 0, duration: 0.7, delay: (i % 4) * 0.08,
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' } });
        });

        /* ── SECTION TITLES ── */
        gsap.utils.toArray('.gsap-reveal').forEach(el => {
          gsap.fromTo(el,
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 0.7,
              scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' } });
        });

        /* ── REVIEW CARDS ── */
        gsap.utils.toArray('.gsap-review').forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 45 },
            { opacity: 1, y: 0, duration: 0.6, delay: i * 0.12,
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' } });
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
        <meta name="description" content="Fik Conciergerie — Louez votre véhicule idéal à Oran. Large gamme sans caution. Réservation rapide." />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══════════════════════════════════════
            HERO SCENE — 500vh, sticky
        ══════════════════════════════════════ */}
        <div className="gsap-hero-scene relative" style={{ height: '500vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden">

            {/* Car image — zooms throughout */}
            <div className="absolute inset-0 overflow-hidden">
              {heroCar?.image_url ? (
                <img
                  src={heroCar.image_url}
                  alt="Fik Conciergerie flotte premium"
                  className="gsap-hero-car absolute inset-0 w-full h-full object-cover origin-center"
                  style={{ willChange: 'transform' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#060606]" />
              )}
            </div>

            {/* Dark overlay */}
            <div className="gsap-hero-overlay absolute inset-0 bg-black" style={{ opacity: 0.45, willChange: 'opacity' }} />

            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />

            {/* Gold line top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

            {/* Gold horizontal line (animated expand) */}
            <div className="gsap-gold-line absolute left-12 right-12" style={{ top: '38%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(226,182,20,0.4), transparent)', transformOrigin: 'left', transform: 'scaleX(0)', willChange: 'transform' }} />

            {/* ── BRAND (appears first, then fades) ── */}
            <div className="gsap-brand absolute inset-0 flex items-center justify-center flex-col gap-3"
              style={{ opacity: 0, willChange: 'opacity, transform' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(226,182,20,0.5)]">
                <span className="font-black text-noir-950 text-xl">AL</span>
              </div>
              <p className="font-display text-2xl font-bold text-white tracking-wide">Fik Conciergerie</p>
              <p className="text-white/40 text-sm tracking-[0.25em] uppercase font-body">Location Premium · Oran</p>
            </div>

            {/* ── MAIN HEADLINE ── */}
            <div className="absolute left-8 md:left-16 bottom-[32%] right-8">
              <div className="overflow-hidden">
                <h1 className="gsap-line1 font-display font-black text-hero-gradient leading-[0.88]"
                  style={{ fontSize: 'clamp(56px, 10vw, 130px)', opacity: 0, willChange: 'transform, opacity' }}>
                  La Route,
                </h1>
              </div>
              <div className="overflow-hidden">
                <h1 className="gsap-line2 font-display font-black text-gold-gradient italic leading-[0.88]"
                  style={{ fontSize: 'clamp(56px, 10vw, 130px)', opacity: 0, willChange: 'transform, opacity' }}>
                  Votre Style
                </h1>
              </div>
            </div>

            {/* ── SUBTITLE ── */}
            <div className="gsap-subtitle absolute left-8 md:left-16 bottom-[22%]"
              style={{ opacity: 0, willChange: 'transform, opacity' }}>
              <p className="text-white/60 text-lg md:text-xl font-body max-w-md leading-relaxed">
                Location de véhicules premium à Oran.<br />
                <span className="text-white/40">Sans caution · Réservation rapide · 7j/7</span>
              </p>
            </div>

            {/* ── CTAs ── */}
            <div className="gsap-cta absolute left-8 md:left-16 bottom-[10%] flex gap-4 flex-wrap"
              style={{ opacity: 0, willChange: 'transform, opacity' }}>
              <Link href="/reservation"
                className="btn-gold text-base px-8 py-4">
                <CalendarCheck size={18} />Réserver maintenant
              </Link>
              <Link href="/cars" className="btn-outline text-base px-7 py-4">
                <Car size={16} />Voir la flotte
              </Link>
            </div>

            {/* ── SCROLL HINT ── */}
            <div className="gsap-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
              <span className="text-[9px] tracking-[0.3em] uppercase font-body">Défiler pour explorer</span>
              <ChevronDown size={13} className="animate-bounce" />
            </div>

            {/* Car name badge (bottom right) */}
            {heroCar && (
              <div className="absolute bottom-8 right-8 text-right">
                <p className="text-white/20 text-xs tracking-widest uppercase font-body">{heroCar.category}</p>
                <p className="text-white/50 font-display font-bold text-base">{heroCar.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════
            BENEFITS SCENE — 700vh, sticky
        ══════════════════════════════════════ */}
        <div className="gsap-benefits-scene relative" style={{ height: '700vh' }}>
          <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 bg-[#060606]" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
            {/* Gold orb bg */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 65%)', borderRadius: '50%' }} />

            {/* Each benefit slide */}
            {BENEFITS.map((b, i) => (
              <div key={i} className="gsap-benefit-slide absolute inset-0 flex items-center justify-center px-8"
                style={{ opacity: 0, willChange: 'transform, opacity' }}>
                <div className="max-w-2xl text-center">
                  {/* Icon */}
                  <div className="benefit-icon w-20 h-20 bg-gold-500/[0.08] border border-gold-500/25 rounded-2xl flex items-center justify-center mx-auto mb-8"
                    style={{ willChange: 'transform, opacity' }}>
                    <b.icon size={32} className="text-gold-400" />
                  </div>

                  {/* Number */}
                  <p className="text-white/20 text-sm tracking-[0.3em] uppercase font-body mb-4">{b.num} / 06</p>

                  {/* Title */}
                  <h2 className="font-display font-black text-white mb-5 leading-tight"
                    style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}>
                    {b.title}
                  </h2>

                  {/* Desc */}
                  <p className="text-white/45 text-xl font-body leading-relaxed max-w-lg mx-auto">
                    {b.desc}
                  </p>

                  {/* Gold divider */}
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mt-8" />
                </div>
              </div>
            ))}

            {/* Progress dots (right) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              {BENEFITS.map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            FLEET GRID — normal scroll
        ══════════════════════════════════════ */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(cars || []).slice(0, 8).map((car, i) => (
                <div key={car.id} className="gsap-fleet-card group relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: '3/4', opacity: 0, willChange: 'transform, opacity' }}>
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] flex items-center justify-center">
                      <Car size={64} className="text-white/[0.05]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="tag-category capitalize">{car.category}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-display font-bold text-white text-lg mb-1 leading-tight">{car.name}</h3>
                    <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white/50 text-xs font-body flex items-center gap-1">
                        <Fuel size={10} className="text-gold-500/60" />{car.fuel}
                      </span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/50 text-xs font-body flex items-center gap-1">
                        <Users size={10} className="text-gold-500/60" />{car.seats} places
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gold-400 font-display font-bold text-xl leading-none">{car.resale_price}€</div>
                        <div className="text-white/30 text-xs font-body">/ jour</div>
                      </div>
                      <Link href={`/reservation?car=${car.id}`}
                        className="bg-gold-500 hover:bg-gold-400 text-noir-950 font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(226,182,20,0.3)] flex items-center gap-1.5 font-body"
                        onClick={e => e.stopPropagation()}>
                        <CalendarCheck size={13} />Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STATS
        ══════════════════════════════════════ */}
        <section ref={statsRef} className="relative py-28 px-5 overflow-hidden bg-[#060606]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="gsap-reveal text-center mb-20">
              <span className="section-badge mb-5 inline-block">Fik Conciergerie en chiffres</span>
              <h2 className="font-display text-5xl md:text-6xl font-bold text-white mt-5">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6">
              {[
                { val: cars?.length || 14, suffix: '',  label: 'Véhicules',         desc: 'dans notre flotte' },
                { val: 500,                suffix: '+', label: 'Clients satisfaits', desc: 'depuis l\'ouverture' },
                { val: 0,                  suffix: '€', label: 'Caution',            desc: 'confiance totale' },
                { val: 98,                 suffix: '%', label: 'Satisfaction',       desc: 'avis vérifiés' },
              ].map((s, i) => (
                <div key={i} className="gsap-reveal text-center">
                  <div className="font-display font-black text-gold-gradient leading-none mb-3"
                       style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
                    {statsInView ? <AnimCounter to={s.val} suffix={s.suffix} /> : `0${s.suffix}`}
                  </div>
                  <div className="text-white font-semibold text-base font-body mb-1">{s.label}</div>
                  <div className="text-white/30 text-sm font-body">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════ */}
        {reviews?.length > 0 && (
          <section className="py-28 px-5 relative overflow-hidden bg-[#080808]">
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />
            <div className="relative z-10 max-w-7xl mx-auto">
              <div className="gsap-reveal text-center mb-14">
                <span className="section-badge mb-5 inline-block">Témoignages</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  Ils nous font <span className="text-gold-gradient italic">confiance</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}/5 — {reviews.length} avis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0, 3).map((review, i) => (
                  <div key={review.id} className="gsap-review card-dark p-7 relative overflow-hidden"
                    style={{ opacity: 0, willChange: 'transform, opacity' }}>
                    <span className="absolute top-3 right-5 font-display text-9xl text-gold-500/[0.05] leading-none select-none pointer-events-none">"</span>
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={13} className={j < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                      ))}
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed italic mb-6 font-body">"{review.comment}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold font-body">{review.client_name?.[0]?.toUpperCase()}</span>
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

        {/* ══════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════ */}
        <section className="relative py-32 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="gsap-reveal">
              <motion.div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Car size={32} className="text-gold-400" />
              </motion.div>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-[0.9]">
                Prêt à prendre<br /><span className="text-gold-gradient italic">la route ?</span>
              </h2>
              <p className="text-white/35 text-xl mb-12 font-body leading-relaxed">
                Réservez dès maintenant votre véhicule à Oran.<br />Simple, rapide, sans caution.
              </p>
              <Link href="/reservation" className="btn-gold text-lg px-14 py-5 animate-pulse-gold">
                <CalendarCheck size={20} />Réserver maintenant
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="border-t border-white/[0.05] bg-[#050505] py-8 px-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <span className="text-noir-950 font-black text-xs">AL</span>
              </div>
              <span className="font-display font-bold text-white">Fik <span className="text-gold-500">Conciergerie</span></span>
            </div>
            <div className="flex gap-6 text-white/25 text-sm font-body">
              {[{h:'/cars',l:'Véhicules'},{h:'/conditions',l:'Conditions'},{h:'/reviews',l:'Avis'},{h:'/reservation',l:'Réserver'}].map(x => (
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

/* ─── Animated counter ─── */
function AnimCounter({ to, suffix }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = Date.now();
    const dur = 2200;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(e * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}{suffix}</>;
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
