import Head from 'next/head';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, Car, Star, ChevronDown, ArrowRight, ChevronLeft, ChevronRight,
  Users, MapPin, CalendarCheck, Fuel, MessageCircle, Sparkles, Building2, Tag,
  Instagram, Music2, Facebook, Gauge,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getSettings } from '../lib/settings';
import { useLang } from '../lib/i18n';

/* ── Social icons (footer) — lit les réseaux depuis les paramètres ── */
function SocialIcons() {
  const [s, setS] = useState(null);
  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return null;
  const items = [
    s.instagram && { Icon: Instagram, href: s.instagram, label: 'Instagram' },
    s.tiktok    && { Icon: Music2,    href: s.tiktok,    label: 'TikTok' },
    s.facebook  && { Icon: Facebook,  href: s.facebook,  label: 'Facebook' },
  ].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-2.5 mt-4">
      {items.map(({ Icon, href, label }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-gold-500 hover:text-noir-950 text-white/50 flex items-center justify-center transition-all">
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}
import { supabase } from '../lib/supabase';

const BENEFITS = [
  { icon: Sparkles,      num:'01', tk:'ben1t', dk:'ben1d' },
  { icon: Shield,        num:'02', tk:'ben2t', dk:'ben2d' },
  { icon: MessageCircle, num:'03', tk:'ben3t', dk:'ben3d' },
  { icon: Building2,     num:'04', tk:'ben4t', dk:'ben4d' },
  { icon: Star,          num:'05', tk:'ben5t', dk:'ben5d' },
  { icon: Users,         num:'06', tk:'ben6t', dk:'ben6d' },
];

/* ── Benefits carousel ── */
function BenefitsCarousel({ benefits }) {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  const pausedRef  = useRef(false);
  const touchStart = useRef(0);
  const touchMoved = useRef(false);
  const slide = benefits[idx];

  const next = () => setIdx(i => (i + 1) % benefits.length);
  const prev = () => setIdx(i => (i - 1 + benefits.length) % benefits.length);
  const goTo = (i) => { setIdx(i); pausedRef.current = true; setTimeout(() => { pausedRef.current = false; }, 5000); };

  // Autoplay 4s — paused after manual interaction (ref = no re-render)
  useEffect(() => {
    const timer = setInterval(() => { if (!pausedRef.current) setIdx(i => (i + 1) % benefits.length); }, 4000);
    return () => clearInterval(timer);
  }, [benefits.length]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; touchMoved.current = false; };
  const onTouchMove  = (e) => { if (Math.abs(e.touches[0].clientX - touchStart.current) > 8) touchMoved.current = true; };
  const onTouchEnd   = (e) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    pausedRef.current = true; setTimeout(() => { pausedRef.current = false; }, 5000);
    if (Math.abs(diff) > 35) { diff > 0 ? next() : prev(); }
    else if (!touchMoved.current) next(); // tap = advance
  };

  return (
    <div className="relative w-full select-none"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }}>
      <AnimatePresence initial={false}>
        <motion.div key={idx}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0">
          <div className="flex items-center justify-center px-6 py-12 h-full">
            <div className="max-w-lg text-center">
              <div className="w-[72px] h-[72px] bg-gold-500/[0.08] border border-gold-500/25 rounded-2xl flex items-center justify-center mx-auto mb-7">
                <slide.icon size={30} className="text-gold-400" />
              </div>
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase font-body mb-4">{slide.num} / 06</p>
              <h2 className="font-display font-black text-white mb-5 leading-tight" style={{ fontSize: 'clamp(30px, 5vw, 60px)' }}>{t(slide.tk)}</h2>
              <p className="text-white/70 text-base md:text-xl font-body leading-relaxed">{t(slide.dk)}</p>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mt-7" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Spacer to give the absolute slide a height */}
      <div className="invisible px-6 py-12" aria-hidden>
        <div className="max-w-lg text-center mx-auto">
          <div className="w-[72px] h-[72px] mb-7" />
          <p className="text-xs mb-4">00 / 06</p>
          <h2 className="font-display font-black mb-5" style={{ fontSize: 'clamp(30px, 5vw, 60px)' }}>Service personnalisé</h2>
          <p className="text-base md:text-xl leading-relaxed">Chaque véhicule est nettoyé et contrôlé avant chaque location aucune surprise garantie.</p>
          <div className="h-px mt-7" />
        </div>
      </div>

      {/* Arrows desktop */}
      <button onClick={prev} aria-label="Précédent" className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/[0.04] hover:bg-gold-500 hover:text-noir-950 border border-white/10 rounded-full items-center justify-center text-white/50 transition-all"><ChevronLeft size={18} /></button>
      <button onClick={next} aria-label="Suivant" className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/[0.04] hover:bg-gold-500 hover:text-noir-950 border border-white/10 rounded-full items-center justify-center text-white/50 transition-all"><ChevronRight size={18} /></button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8 relative z-10">
        {benefits.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} className={`rounded-full transition-all ${i === idx ? 'w-8 h-2 bg-gold-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
        ))}
      </div>

      <div className="md:hidden mt-4 text-center text-white/25 text-xs">{t('cc.swipe')}</div>
    </div>
  );
}

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
  const { t } = useLang();
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
            {/* Background image — clickable to detail page */}
            <Link href={`/cars/${car.id}`} className="absolute inset-0 z-0">
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
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

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
                    <Users size={12} className="text-gold-500/60" />{car.seats} {t("b.places")}
                  </span>
                  {car.transmission && (
                    <><span className="text-white/20">·</span>
                    <span className="text-white/50 text-sm capitalize font-body">{car.transmission}</span></>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-white/30 text-xs tracking-widest uppercase font-body block mb-1">{t("cc.from")}</span>
                    <span className="font-display font-black text-gold-gradient leading-none"
                      style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
                      {Number(car.resale_price).toLocaleString('fr-FR')} {car.currency === 'EUR' ? '€' : 'DA'}
                    </span>
                    <span className="text-white/30 text-sm font-body ml-1">{t("cc.perday")}</span>
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

/* ── Generic showcase carousel (vente auto + immobilier) ── */
function ShowcaseCarousel({ items, render }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const total = items.length;
  const goTo = (n) => { setDir(n > idx ? 1 : -1); setIdx(n); };
  const prev = () => goTo(idx === 0 ? total - 1 : idx - 1);
  const next = () => goTo(idx === total - 1 ? 0 : idx + 1);
  const item = items[idx];
  if (!item) return null;
  const c = render(item, idx, total);
  const variants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, scale: 0.95 }),
  };
  return (
    <div className="relative" style={{ height: '90vh', maxHeight: 700 }}>
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <Link href={c.href} className="absolute inset-0 z-0">
              {c.image ? (
                <motion.img src={c.image} alt={c.title} className="w-full h-full object-cover"
                  initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#080808] flex items-center justify-center">
                  {c.emptyIcon}
                </div>
              )}
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {c.badges}
                  <span className="text-white/25 text-xs font-body tracking-widest">
                    {String(idx + 1).padStart(2,'0')} / {String(total).padStart(2,'0')}
                  </span>
                </div>
                <h3 className="font-display font-black text-white leading-[0.9] mb-3" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>{c.title}</h3>
                <div className="flex items-center gap-3 mb-6 flex-wrap">{c.specs}</div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    {c.priceLabel && <span className="text-white/30 text-xs tracking-widest uppercase font-body block mb-1">{c.priceLabel}</span>}
                    <span className="font-display font-black text-gold-gradient leading-none" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>{c.price}</span>
                    {c.priceSuffix && <span className="text-white/30 text-sm font-body ml-1">{c.priceSuffix}</span>}
                  </div>
                  <Link href={c.href} className="btn-gold px-6 py-3 text-sm md:text-base whitespace-nowrap">{c.ctaIcon}{c.cta}</Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all"><ChevronLeft size={18} /></button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-gold-500 hover:border-gold-500 hover:text-noir-950 transition-all"><ChevronRight size={18} /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-1.5 bg-gold-500' : 'w-1.5 h-1.5 bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

/* ── Coming soon block ── */
function ComingSoon({ icon, title, desc, cta, href }) {
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#141414] to-[#0d0d0d] overflow-hidden" style={{ minHeight: 360 }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16 h-full">
        <div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-3xl flex items-center justify-center mb-6">{icon}</div>
        <span className="inline-block bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Coming soon</span>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/40 text-sm max-w-md leading-relaxed mb-7">{desc}</p>
        <Link href={href} className="btn-outline px-7 py-3 text-sm">{cta}<ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Home({ cars: initialCars, reviews: initialReviews, vehiclesSale: initialSale, properties: initialProps }) {
  const { t } = useLang();
  const statsRef    = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });
  const benefitsRef = useRef(null);
  const [cars, setCars]       = useState(initialCars   || []);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [vehiclesSale, setVehiclesSale] = useState(initialSale  || []);
  const [properties, setProperties]     = useState(initialProps || []);

  // Client refresh: bypass ISR cache, get fresh Supabase data on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('cars').select('*').order('resale_price').then(({ data }) => {
      if (data && data.length > 0) setCars(data);
    }).catch(() => {});
    supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6).then(({ data }) => {
      if (data && data.length > 0) setReviews(data);
    }).catch(() => {});
    supabase.from('vehicles_for_sale').select('*, vehicle_sale_photos(url, position)').order('featured', { ascending: false }).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setVehiclesSale(data);
    }).catch(() => {});
    supabase.from('properties').select('*, property_photos(url, position)').order('featured', { ascending: false }).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProperties(data);
    }).catch(() => {});
  }, []);

  // Helpers carousel vente/immo
  const saleAvailable = (vehiclesSale || []).filter(v => v.status !== 'vendu');
  const immoAvailable = (properties || []).filter(p => p.status !== 'vendu' && p.status !== 'loue');
  const curSym = (c) => (c === 'EUR' ? '€' : 'DA');
  const photoOf = (rows, fallback) => {
    const sorted = (rows || []).slice().sort((a, b) => a.position - b.position);
    return sorted[0]?.url || fallback || null;
  };

  const heroCar = (
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('mercedes')) ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('alpine'))   ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('clio 7'))   ||
    cars?.find(c => c.image_url && c.name?.toLowerCase().includes('clio'))     ||
    cars?.find(c => c.image_url) || null
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  // GSAP removed — CSS animations handle hero entry, no scroll-driven opacity issues

  const ease = [0.16, 1, 0.3, 1];

  return (
    <>
      <Head>
        <title>Fik Conciergerie — Location de Véhicules Premium Oran</title>
        <meta name="description" content="Fik Conciergerie — Conciergerie premium à Oran : location & vente de voitures, immobilier. Sans caution." />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══ HERO — CSS animated, instant ══ */}
        <div className="relative min-h-screen overflow-hidden">

            {/* Background image */}
            <div className="absolute inset-0 bg-[#0a0a0a]">
              {heroCar?.image_url && (
                <img src={heroCar.image_url} alt={heroCar.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="eager"
                  style={{ display: 'block' }} />
              )}
            </div>

            {/* Overlays — minimal, just enough for text readability */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

            {/* ── Hero content ── */}
            <div className="gsap-hero-content absolute inset-0">

              {/* Brand badge — center, CSS animated */}
              <div className="hero-css-brand absolute inset-0 flex items-center justify-center flex-col gap-3 pointer-events-none" style={{ paddingBottom: '20%' }}>
                <img
                  src="/logo.png"
                  alt="Fik Conciergerie"
                  className="w-20 h-20 object-contain drop-shadow-[0_0_30px_rgba(226,182,20,0.7)] animate-float"
                />
                <p className="font-display text-xl font-bold text-white tracking-wide">Fik Conciergerie</p>
                <p className="text-white/35 text-xs tracking-[0.25em] uppercase font-body">Conciergerie Premium · Oran</p>
              </div>

              {/* Headline bottom-left — CSS animated */}
              <div className="absolute left-5 md:left-12 bottom-[30%] right-5 pointer-events-none">
                <div className="overflow-hidden">
                  <h1 className="hero-css-line1 font-display font-black text-hero-gradient leading-[0.88]"
                    style={{ fontSize: 'clamp(50px, 9vw, 116px)' }}>
                    {t('hero.line1')}
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1 className="hero-css-line2 font-display font-black text-gold-gradient italic leading-[0.88]"
                    style={{ fontSize: 'clamp(50px, 9vw, 116px)' }}>
                    {t('hero.line2')}
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <div className="hero-css-sub absolute left-5 md:left-12 bottom-[20%] right-5 pointer-events-none">
                <p className="text-white/60 text-base md:text-xl font-body max-w-md leading-relaxed">
                  {t('hero.subtitle')}
                  <span className="block text-white/35 text-sm md:text-base mt-0.5">{t('hero.tags')}</span>
                </p>
              </div>

              {/* CTAs */}
              <div className="hero-css-cta absolute left-5 md:left-12 bottom-[8%] flex gap-3 flex-wrap">
                <Link href="/reservation" className="btn-gold text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                  <CalendarCheck size={16} />{t('nav.book')}
                </Link>
                <Link href="/cars" className="btn-outline text-sm md:text-base px-5 md:px-7 py-3 md:py-4">
                  <Car size={15} />{t('hero.fleet')}
                </Link>
              </div>

              {/* Car badge */}
              {heroCar && (
                <div className="hero-css-sub absolute bottom-6 right-5 text-right pointer-events-none">
                  <p className="text-white/20 text-[10px] tracking-widest uppercase font-body">{heroCar.category}</p>
                  <p className="text-white/55 font-display font-bold text-sm">{heroCar.name}</p>
                  <p className="text-gold-400 font-display font-bold text-lg">{Number(heroCar.resale_price).toLocaleString('fr-FR')} {heroCar.currency === 'EUR' ? '€' : 'DA'}<span className="text-white/25 text-xs font-body">/j</span></p>
                </div>
              )}

              {/* Scroll hint */}
              <div className="hero-css-hint absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25 pointer-events-none">
                <span className="text-[8px] tracking-[0.3em] uppercase font-body">Défiler</span>
                <ChevronDown size={12} className="animate-bounce" />
              </div>
            </div>
        </div>

        {/* ══ BENEFITS CAROUSEL — simple, stable ══ */}
        <section className="relative py-16 md:py-24 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 opacity-[0.018] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="section-badge mb-5 inline-block">{t('home.adv')}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                {t('home.why1')} <span className="text-gold-gradient italic">{t('home.why2')}</span>
              </h2>
            </div>
            <BenefitsCarousel benefits={BENEFITS} />
          </div>
        </section>

        {/* ══ NOS 3 PÔLES ══ */}
        <section className="relative py-20 md:py-28 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 65%)' }} />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="section-badge mb-5 inline-block">{t('poles.badge')}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                {t('poles.title1')} <span className="text-gold-gradient italic">{t('poles.title2')}</span>
              </h2>
              <p className="text-white/35 mt-4 max-w-lg mx-auto font-body">
                {t('poles.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Car,       title: t('poles.rental.title'), desc: t('poles.rental.desc'), href: '/cars', cta: t('poles.rental.cta'), color: 'gold' },
                { icon: Building2, title: t('poles.immo.title'),   desc: t('poles.immo.desc'),   href: '/immo', cta: t('poles.immo.cta'), color: 'blue' },
                { icon: Tag,       title: t('poles.sale.title'),   desc: t('poles.sale.desc'),   href: '/vente-voitures', cta: t('poles.sale.cta'), color: 'purple' },
              ].map((p, i) => {
                const c = {
                  gold:   { ring: 'group-hover:border-gold-500/40',   ico: 'bg-gold-500/10 border-gold-500/25 text-gold-400',     glow: 'bg-gold-500/[0.06]' },
                  blue:   { ring: 'group-hover:border-blue-500/40',   ico: 'bg-blue-500/10 border-blue-500/25 text-blue-400',     glow: 'bg-blue-500/[0.06]' },
                  purple: { ring: 'group-hover:border-purple-500/40', ico: 'bg-purple-500/10 border-purple-500/25 text-purple-300', glow: 'bg-purple-500/[0.06]' },
                }[p.color];
                return (
                  <motion.div key={i}
                    initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12, ease }}>
                    <Link href={p.href} className={`group relative block h-full bg-[#0f0f0f] border border-white/[0.06] ${c.ring} rounded-2xl p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1.5`}>
                      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${c.glow} blur-3xl pointer-events-none`} />
                      <div className={`relative w-14 h-14 ${c.ico} border rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <p.icon size={24} />
                      </div>
                      <h3 className="relative font-display font-bold text-white text-xl mb-3">{p.title}</h3>
                      <p className="relative text-white/40 text-sm leading-relaxed mb-6">{p.desc}</p>
                      <span className="relative inline-flex items-center gap-1.5 text-gold-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        {p.cta} <ArrowRight size={14} />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ COMMENT LOUER EN 3 ÉTAPES ══ */}
        <section className="relative py-20 md:py-28 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="section-badge mb-5 inline-block">{t('home.steps_badge')}</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                {t('home.steps_t1')} <span className="text-gold-gradient italic">{t('home.steps_t2')}</span>
              </h2>
              <p className="text-white/35 mt-4 max-w-md mx-auto font-body">{t('home.steps_sub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector */}
              <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

              {[
                { num: '01', tk: 'stp1t', dk: 'stp1d', icon: Car, link: '/cars', ck: 'stp1c' },
                { num: '02', tk: 'stp2t', dk: 'stp2d', icon: CalendarCheck, link: '/reservation', ck: 'nav.book_now' },
                { num: '03', tk: 'stp3t', dk: 'stp3d', icon: MapPin, link: null, ck: null },
              ].map((step, i) => (
                <motion.div key={i}
                  className="relative flex flex-col items-center text-center p-8 bg-[#0f0f0f] border border-white/[0.06] rounded-2xl hover:border-gold-500/20 transition-all duration-300 group"
                  initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15, ease }}>

                  {/* Step icon */}
                  <div className="relative mb-6">
                    <div className="w-[72px] h-[72px] bg-[#161616] border border-gold-500/20 group-hover:border-gold-500/40 rounded-2xl flex items-center justify-center transition-colors">
                      <step.icon size={28} className="text-gold-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-[11px] font-black text-noir-950 shadow-[0_0_12px_rgba(226,182,20,0.4)]">
                      {step.num.replace('0','')}
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-white text-xl mb-3">{t(step.tk)}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-body mb-5 flex-1">{t(step.dk)}</p>

                  {step.link && step.ck && (
                    <Link href={step.link} className="text-gold-500 text-xs font-semibold hover:text-gold-400 transition-colors flex items-center gap-1 group/link">
                      {t(step.ck)} <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ VÉHICULES INTERACTIFS ══ */}
        <section className="py-16 md:py-20 px-5 relative overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div className="mb-10"
              initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.7, ease }}>
              <span className="section-badge mb-5 inline-block">{t('home.fleet_badge')}</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                  {t('home.fleet_t1')} <span className="text-gold-gradient italic">{t('home.fleet_t2')}</span>
                </h2>
                <Link href="/cars" className="btn-outline text-sm py-2.5 self-start">
                  {t('home.fleet_all')} <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>

            {cars && cars.length > 0 && (
              <motion.div
                initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.7, delay:0.15, ease }}>
                <CarCarousel cars={cars.filter(c => c.available !== false).slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))} />
              </motion.div>
            )}
          </div>
        </section>

        {/* ══ VÉHICULES À VENDRE ══ */}
        <section className="py-16 md:py-20 px-5 relative overflow-hidden bg-[#050505]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="mb-10">
              <span className="section-badge mb-5 inline-block">{t('home.sale_badge')}</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">{t('home.sale_t1')} <span className="text-gold-gradient italic">{t('home.sale_t2')}</span></h2>
                <Link href="/vente-voitures" className="btn-outline text-sm py-2.5 self-start">{t('home.sale_all')} <ArrowRight size={13} /></Link>
              </div>
            </div>
            {saleAvailable.length > 0 ? (
              <ShowcaseCarousel items={saleAvailable} render={(v, i, total) => ({
                href: `/vente-voitures/${v.id}`,
                image: photoOf(v.vehicle_sale_photos, v.image_url),
                emptyIcon: <Tag size={100} className="text-white/[0.05]" />,
                title: `${v.brand} ${v.model}`,
                badges: <><span className="tag-category">{v.year || t('home.sale_badge')}</span>{v.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950">{t('b.featured')}</span>}</>,
                specs: <>
                  {v.mileage != null && <span className="flex items-center gap-1.5 text-white/50 text-sm font-body"><Gauge size={12} className="text-gold-500/60" />{Number(v.mileage).toLocaleString('fr-FR')} km</span>}
                  {v.fuel && <><span className="text-white/20">·</span><span className="flex items-center gap-1.5 text-white/50 text-sm font-body"><Fuel size={12} className="text-gold-500/60" />{v.fuel}</span></>}
                  {v.city && <><span className="text-white/20">·</span><span className="flex items-center gap-1.5 text-white/50 text-sm font-body"><MapPin size={12} className="text-gold-500/60" />{v.city}</span></>}
                </>,
                price: v.price ? `${Number(v.price).toLocaleString('fr-FR')} ${curSym(v.currency)}` : t('b.price_request'),
                href2: null, cta: t('home.view'), ctaIcon: <ArrowRight size={15} />,
              })} />
            ) : (
              <ComingSoon icon={<Tag size={32} className="text-gold-400" />} title={t('home.sale_soon_t')} desc={t('home.sale_soon_d')} cta={t('sale.sell_cta')} href="/vente-voitures" />
            )}
          </div>
        </section>

        {/* ══ IMMOBILIER ══ */}
        <section className="py-16 md:py-20 px-5 relative overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="mb-10">
              <span className="section-badge mb-5 inline-block">{t('home.immo_badge')}</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">{t('home.immo_t1')} <span className="text-gold-gradient italic">{t('home.immo_t2')}</span></h2>
                <Link href="/immo" className="btn-outline text-sm py-2.5 self-start">{t('home.immo_all')} <ArrowRight size={13} /></Link>
              </div>
            </div>
            {immoAvailable.length > 0 ? (
              <ShowcaseCarousel items={immoAvailable} render={(p, i, total) => {
                const isSale = (p.transaction || 'location') === 'vente';
                return {
                  href: `/immo/${p.id}`,
                  image: photoOf(p.property_photos, null),
                  emptyIcon: <Building2 size={100} className="text-white/[0.05]" />,
                  title: p.title,
                  badges: <>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${isSale ? 'bg-purple-500/20 text-purple-300 border-purple-500/25' : 'bg-blue-500/20 text-blue-300 border-blue-500/25'}`}>{isSale ? t('b.forsale') : t('b.forrent')}</span>
                    {p.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950">{t('b.featured')}</span>}
                  </>,
                  specs: <>
                    {(p.district || p.city) && <span className="flex items-center gap-1.5 text-white/50 text-sm font-body"><MapPin size={12} className="text-gold-500/60" />{[p.district, p.city].filter(Boolean).join(', ')}</span>}
                    {p.surface && <><span className="text-white/20">·</span><span className="text-white/50 text-sm font-body">{p.surface} m²</span></>}
                    {(p.bedrooms || p.rooms) && <><span className="text-white/20">·</span><span className="text-white/50 text-sm font-body">{p.bedrooms || p.rooms} {t('d.rooms')}</span></>}
                  </>,
                  price: p.price ? `${Number(p.price).toLocaleString('fr-FR')} ${curSym(p.currency)}` : t('b.price_request'),
                  priceSuffix: p.price && !isSale ? t('b.per_month') : null,
                  cta: isSale ? t('home.buy') : t('home.view'), ctaIcon: <ArrowRight size={15} />,
                };
              }} />
            ) : (
              <ComingSoon icon={<Building2 size={32} className="text-gold-400" />} title={t('home.immo_soon_t')} desc={t('home.immo_soon_d')} cta={t('immo.propose')} href="/immo" />
            )}
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} className="relative py-16 md:py-24 px-5 overflow-hidden bg-[#050505]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}>
              <span className="section-badge mb-5 inline-block">{t('home.stats_badge')}</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mt-5">
                {t('home.stats_t1')} <span className="text-gold-gradient italic">{t('home.stats_t2')}</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {[
                { val:cars?.length||14, suffix:'',  label:t('st.veh'), desc:t('st.veh_d') },
                { val:500,             suffix:'+', label:t('st.cli'), desc:t('st.cli_d') },
                { val:0,               suffix:'€', label:t('st.cau'), desc:t('st.cau_d') },
                { val:98,              suffix:'%', label:t('st.sat'), desc:t('st.sat_d') },
              ].map((s, i) => (
                <motion.div key={i} className="text-center"
                  initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ duration:0.7, delay:i*0.1, ease }}>
                  <div className="font-display font-black text-gold-gradient leading-none mb-3"
                       style={{ fontSize:'clamp(44px,6vw,80px)' }}>
                    <AnimCounter to={s.val} suffix={s.suffix}/>
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
          <section className="py-16 md:py-24 px-5 relative overflow-hidden bg-[#080808]">
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background:'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />
            <div className="relative z-10 max-w-7xl mx-auto">
              <motion.div className="text-center mb-14"
                initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.7 }}>
                <span className="section-badge mb-5 inline-block">{t('home.rev_badge')}</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  {t('home.rev_t1')} <span className="text-gold-gradient italic">{t('home.rev_t2')}</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <Star key={i} size={14} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500':'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}{t("rv.outof")} · {reviews.length} {t("rv.word")}</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0,3).map((review,i) => (
                  <motion.div key={review.id} className="card-dark p-6 relative overflow-hidden"
                    initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
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
                  {t('home.rev_all')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══ CTA ══ */}
        <section className="relative py-20 md:py-28 px-5 overflow-hidden bg-[#080808]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
               style={{ background:'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity:1, y:0 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.8, ease }}>
              <motion.div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y:[0,-10,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}>
                <Car size={32} className="text-gold-400" />
              </motion.div>
              <h2 className="font-display text-4xl md:text-7xl font-bold text-white mb-6 leading-[0.9]">
                {t('home.cta_t1')}<br /><span className="text-gold-gradient italic">{t('home.cta_t2')}</span>
              </h2>
              <p className="text-white/35 text-lg md:text-xl mb-12 font-body leading-relaxed">
                {t('home.cta_sub')}
              </p>
              <Link href="/reservation" className="btn-gold text-base md:text-lg px-10 md:px-14 py-4 md:py-5 animate-pulse-gold">
                <CalendarCheck size={18} />{t('nav.book_now')}
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER PREMIUM ══ */}
        <footer className="relative border-t border-white/[0.07] bg-[#040404]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="max-w-7xl mx-auto px-5 pt-14 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.png" alt="Fik Conciergerie" className="w-10 h-10 object-contain" />
                  <div>
                    <span className="font-display font-bold text-white text-base block leading-tight">Fik <span className="text-gold-500">Conciergerie</span></span>
                    <span className="text-white/25 text-[10px] tracking-widest uppercase font-body">Conciergerie Premium</span>
                  </div>
                </div>
                <p className="text-white/30 text-sm font-body leading-relaxed mb-5">
                  {t('foot.tagline')}
                </p>
                <a href="https://wa.me/32466311469" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-colors">
                  <MessageCircle size={14} />WhatsApp
                </a>
                <SocialIcons />
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.nav')}</h3>
                <ul className="space-y-3">
                  {[
                    { h: '/', l: t('foot.f_home') },
                    { h: '/cars', l: t('foot.f_rental') },
                    { h: '/vente-voitures', l: t('foot.f_sale') },
                    { h: '/reservation', l: t('foot.f_book') },
                    { h: '/reviews', l: t('foot.f_reviews') },
                    { h: '/contact', l: t('foot.f_contact') },
                  ].map(x => (
                    <li key={x.h}>
                      <Link href={x.h} className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                        {x.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informations */}
              <div>
                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.info')}</h3>
                <ul className="space-y-3">
                  {[
                    { h: '/commande-vehicule', l: t('foot.f_order') },
                    { h: '/conditions', l: t('foot.f_cond') },
                    { h: '/immo', l: t('foot.f_immo') },
                  ].map(x => (
                    <li key={x.h}>
                      <Link href={x.h} className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                        {x.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.contact')}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="text-white/35 text-sm font-body leading-relaxed">Hay Badr, Oran, Algérie</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <MessageCircle size={13} className="text-gold-500 flex-shrink-0" />
                    <a href="https://wa.me/32466311469" className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors">
                      +32 466 31 14 69
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star size={13} className="text-gold-500 flex-shrink-0" />
                    <span className="text-white/35 text-sm font-body">{t('foot.hours')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-white/15 text-xs font-body">
                © {new Date().getFullYear()} Fik Conciergerie — {t('foot.rights')}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-white/15 text-xs font-body">{t('foot.perks')}</span>
              </div>
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
    let vehiclesSale = [], properties = [];
    try { const r = await supabase.from('vehicles_for_sale').select('*, vehicle_sale_photos(url, position)').order('featured', { ascending: false }).order('created_at', { ascending: false }); vehiclesSale = r.data || []; } catch {}
    try { const r = await supabase.from('properties').select('*, property_photos(url, position)').order('featured', { ascending: false }).order('created_at', { ascending: false }); properties = r.data || []; } catch {}
    return { props: { cars: cars||[], reviews: reviews||[], vehiclesSale, properties }, revalidate: 10 };
  } catch (err) {
    console.error('Error fetching home data:', err);
    return { props: { cars: [], reviews: [], vehiclesSale: [], properties: [] }, revalidate: 10 };
  }
}
