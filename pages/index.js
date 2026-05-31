import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, Zap, Car, Star, ChevronDown, ArrowRight, Users, MapPin, CalendarCheck, Fuel } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

function CounterCard({ end, suffix, label, desc, inView, delay = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    let startTime = null;
    const duration = 2200;
    const run = (ts) => {
      if (!startTime) startTime = ts + delay * 1000;
      const elapsed = ts - startTime;
      if (elapsed < 0) { raf = requestAnimationFrame(run); return; }
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) raf = requestAnimationFrame(run);
      else setCount(end);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, delay]);

  return (
    <motion.div className="text-center"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      <div className="font-display font-black text-gold-gradient leading-none mb-3"
           style={{ fontSize: 'clamp(52px, 6vw, 88px)' }}>
        {count}{suffix}
      </div>
      <div className="text-white font-semibold text-base font-body mb-1">{label}</div>
      <div className="text-white/30 text-sm font-body">{desc}</div>
    </motion.div>
  );
}

function CarSection({ car, idx, total }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });
  const ease = [0.16, 1, 0.3, 1];

  return (
    <section ref={ref} className="relative overflow-hidden"
      style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      {car.image_url ? (
        <motion.div className="absolute inset-0"
          initial={{ scale: 1.08 }} animate={{ scale: inView ? 1 : 1.08 }}
          transition={{ duration: 1, ease }}>
          <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#0a0a0a]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Car size={160} className="text-white/[0.03]" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />

      <motion.div className="absolute top-[88px] left-6 z-20"
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -16 }}
        transition={{ duration: 0.5, ease }}>
        <span className="text-white/30 text-xs tracking-[0.2em] uppercase font-body">
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </motion.div>

      <motion.div className="absolute top-[88px] right-14 z-20"
        initial={{ opacity: 0, x: 16 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 16 }}
        transition={{ duration: 0.5, ease }}>
        <span className="tag-category capitalize">{car.category}</span>
      </motion.div>

      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-500 w-1 ${i === idx ? 'h-8 bg-gold-500' : 'h-2 bg-white/20'}`} />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-14 p-6 md:p-12 z-10">
        <div className="overflow-hidden mb-3">
          <motion.h2 className="font-display font-black text-white leading-[0.9]"
            style={{ fontSize: 'clamp(44px, 7vw, 96px)' }}
            initial={{ y: 90, opacity: 0 }} animate={{ y: inView ? 0 : 90, opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.75, ease }}>
            {car.name}
          </motion.h2>
        </div>

        <motion.div className="flex items-center flex-wrap gap-3 mb-8"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 24 }}
          transition={{ duration: 0.65, delay: 0.12, ease }}>
          <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
            <Fuel size={13} className="text-gold-500/60" />{car.fuel}
          </span>
          <div className="w-px h-3 bg-white/20" />
          <span className="flex items-center gap-1.5 text-white/50 text-sm font-body">
            <Users size={13} className="text-gold-500/60" />{car.seats} places
          </span>
          {car.transmission && (
            <><div className="w-px h-3 bg-white/20" />
            <span className="text-white/50 text-sm capitalize font-body">{car.transmission}</span></>
          )}
        </motion.div>

        <motion.div className="flex items-end justify-between gap-4"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 24 }}
          transition={{ duration: 0.65, delay: 0.22, ease }}>
          <div>
            <div className="text-white/30 text-xs tracking-widest uppercase font-body mb-1">À partir de</div>
            <div className="font-display font-black text-gold-gradient leading-none" style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}>
              {car.resale_price}€{' '}
              <span className="text-white/35 font-body font-normal" style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}>/ jour</span>
            </div>
          </div>
          <Link href={`/reservation?car=${car.id}`} className="btn-gold px-7 py-4 text-base whitespace-nowrap flex-shrink-0">
            <CalendarCheck size={17} />Réserver
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home({ cars, reviews }) {
  const scrollRef   = useRef(null);
  const statsRef    = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });
  const { scrollY } = useScroll({ container: scrollRef });
  const heroY       = useTransform(scrollY, [0, 700], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const ease        = [0.16, 1, 0.3, 1];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <>
      <Head>
        <title>AutoLux — Location Premium Oran</title>
        <meta name="description" content="Louez votre véhicule idéal à Oran. Large gamme sans caution. Réservation rapide." />
      </Head>

      <div ref={scrollRef} className="relative bg-[#080808]"
        style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
        <Navbar scrollContainerRef={scrollRef} />

        {/* ── HERO ── */}
        <section className="relative flex items-center justify-center overflow-hidden"
          style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0 opacity-[0.018]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
          <motion.div className="absolute rounded-full pointer-events-none"
            style={{ width: 700, height: 700, top: '30%', left: '50%', x: '-50%', y: heroY,
              background: 'radial-gradient(circle, rgba(226,182,20,0.07) 0%, transparent 68%)' }} />
          <div className="absolute top-1/4 right-[15%] w-56 h-56 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(226,182,20,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

          <motion.div className="relative z-10 text-center max-w-6xl mx-auto px-5" style={{ opacity: heroOpacity }}>
            <motion.div className="inline-flex items-center gap-2 bg-gold-500/[0.07] border border-gold-500/20 rounded-full px-5 py-2 mb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase font-body">
                Réservation disponible — Oran, Algérie
              </span>
            </motion.div>

            <h1 className="font-display font-black mb-10 leading-[0.88]">
              {['La', 'Route,', 'Votre', 'Style'].map((word, i) => (
                <motion.span key={i}
                  className={`inline-block mr-[0.12em] ${i >= 2 ? 'text-gold-gradient italic' : 'text-hero-gradient'}`}
                  style={{ fontSize: 'clamp(52px, 9vw, 118px)' }}
                  initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.4 + i * 0.14, ease }}>
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto mb-12 font-body leading-relaxed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease }}>
              Citadines, SUV, utilitaires et premium à Oran.<br />Sans caution. Réservation en 2 minutes.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease }}>
              <Link href="/reservation" className="btn-gold text-base px-10 py-4 animate-pulse-gold">
                <CalendarCheck size={18} />Réserver maintenant
              </Link>
              <Link href="/cars" className="btn-outline text-base px-8 py-4">
                <Car size={16} />Voir la flotte<ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div className="inline-grid grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.05]"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease }}>
              {[
                { value: `${cars?.length || 14}`, label: 'Véhicules', sub: 'disponibles' },
                { value: '35+', label: 'Âge requis', sub: 'minimum' },
                { value: '0€', label: 'Caution', sub: 'garantie' },
              ].map(s => (
                <div key={s.label} className="bg-[#0e0e0e] px-7 py-5 text-center">
                  <div className="font-display text-2xl font-bold text-gold-gradient">{s.value}</div>
                  <div className="text-white/55 text-xs font-body mt-0.5">{s.label}</div>
                  <div className="text-white/20 text-[10px] tracking-wider uppercase font-body">{s.sub}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
            animate={{ y: [0, 7, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="text-[9px] tracking-[0.25em] uppercase font-body">{cars?.length || 0} véhicules ↓</span>
            <ChevronDown size={13} />
          </motion.div>
        </section>

        {/* ── TikTok CAR SECTIONS ── */}
        {(cars || []).slice(0, 10).map((car, idx) => (
          <CarSection key={car.id} car={car} idx={idx} total={Math.min((cars || []).length, 10)} />
        ))}

        {/* ── STATS ── */}
        <section ref={statsRef} className="relative flex items-center justify-center overflow-hidden"
          style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
          <div className="absolute inset-0 bg-[#060606]" />
          <div className="absolute inset-0 opacity-[0.018]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(226,182,20,0.05) 0%, transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto px-5 text-center w-full">
            <motion.div className="mb-20"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="section-badge mb-5 inline-block">AutoLux en chiffres</span>
              <h2 className="font-display text-5xl md:text-6xl font-bold text-white mt-5">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
              {[
                { end: cars?.length || 14, suffix: '',  label: 'Véhicules',         desc: 'dans notre flotte',        delay: 0 },
                { end: 500,                suffix: '+', label: 'Clients satisfaits', desc: 'depuis notre ouverture',   delay: 0.15 },
                { end: 0,                  suffix: '€', label: 'Caution',           desc: 'confiance totale',         delay: 0.3 },
                { end: 98,                 suffix: '%', label: 'Satisfaction',      desc: 'avis vérifiés',            delay: 0.45 },
              ].map((s, i) => <CounterCard key={i} {...s} inView={statsInView} />)}
            </div>
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="relative flex items-center justify-center overflow-hidden"
          style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto px-5 w-full">
            <motion.div className="text-center mb-14"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                Pourquoi nous <span className="text-gold-gradient italic">choisir ?</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, num: '01', title: 'Sans caution',      desc: 'Aucune caution exigée. Nous faisons confiance à nos clients et simplifions chaque location.' },
                { icon: Zap,    num: '02', title: 'Réservation rapide', desc: 'Réservez en ligne en 2 minutes. Confirmation immédiate par WhatsApp.' },
                { icon: Car,    num: '03', title: 'Flotte variée',     desc: 'Citadines, SUV, utilitaires 9 places, berlines. Un véhicule pour chaque besoin.' },
              ].map((item, i) => (
                <motion.div key={item.num} className="card-glass p-8 group hover:border-gold-500/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.65, delay: i * 0.14, ease }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-gold-500/[0.08] border border-gold-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon size={20} className="text-gold-400" />
                    </div>
                    <span className="font-display text-5xl font-bold text-white/[0.04] select-none">{item.num}</span>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3 font-body">{item.title}</h3>
                  <p className="text-white/38 leading-relaxed text-sm font-body">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        {reviews?.length > 0 && (
          <section className="relative flex items-center justify-center overflow-hidden"
            style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
            <div className="absolute inset-0 bg-[#060606]" />
            <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(226,182,20,0.04) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-5 w-full">
              <motion.div className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <span className="section-badge mb-5 inline-block">Témoignages</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  Ils nous font <span className="text-gold-gradient italic">confiance</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={15} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}/5 — {reviews.length} avis</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0, 3).map((review, i) => (
                  <motion.div key={review.id} className="card-dark p-6 relative overflow-hidden hover:border-gold-500/15 transition-all duration-300"
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.65, delay: i * 0.12, ease }}>
                    <span className="absolute top-3 right-4 font-display text-8xl text-gold-500/[0.05] leading-none select-none pointer-events-none">"</span>
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={12} className={j < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                      ))}
                    </div>
                    <p className="text-white/52 text-sm leading-relaxed italic mb-5 font-body">"{review.comment}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                      <div className="w-9 h-9 bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <p className="text-white font-medium text-sm font-body">{review.client_name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/reviews" className="btn-ghost text-sm text-white/35 hover:text-white font-body">
                  Voir tous les avis <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA + FOOTER ── */}
        <section className="relative flex flex-col overflow-hidden"
          style={{ height: '100vh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0 opacity-[0.018]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(226,182,20,0.07) 0%, transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="relative z-10 flex-1 flex items-center justify-center px-5">
            <motion.div className="text-center max-w-3xl"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease }}>
              <motion.div
                className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Car size={32} className="text-gold-400" />
              </motion.div>

              <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-[0.92]">
                Prêt à prendre<br /><span className="text-gold-gradient italic">la route ?</span>
              </h2>
              <p className="text-white/35 text-xl mb-12 font-body leading-relaxed">
                Réservez dès maintenant votre véhicule à Oran.<br />Simple, rapide, sans caution.
              </p>
              <Link href="/reservation" className="btn-gold text-lg px-12 py-5 animate-pulse-gold">
                <CalendarCheck size={20} />Réserver maintenant
              </Link>
              <div className="flex items-center justify-center gap-6 mt-10 text-white/20 text-sm font-body">
                {[{href:'/cars',label:'Véhicules'},{href:'/conditions',label:'Conditions'},{href:'/reviews',label:'Avis'}].map(l => (
                  <Link key={l.href} href={l.href} className="hover:text-gold-400 transition-colors">{l.label}</Link>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 border-t border-white/[0.05] py-6 px-5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                  <span className="text-noir-950 font-black text-xs">AL</span>
                </div>
                <span className="font-display font-bold text-white text-sm">Auto<span className="text-gold-500">Lux</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-white/20 text-xs font-body">
                <MapPin size={10} /><span>Oran, Algérie — 35 ans minimum — Sans caution</span>
              </div>
              <span className="text-white/15 text-xs font-body">© {new Date().getFullYear()} AutoLux Location</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const { data: cars }    = await supabase.from('cars').select('*').order('resale_price');
  const { data: reviews } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6);
  return { props: { cars: cars || [], reviews: reviews || [] } };
}
