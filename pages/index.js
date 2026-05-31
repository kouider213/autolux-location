import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { Shield, Zap, Car, Star, ChevronDown, ArrowRight, Users, MapPin, CalendarCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

export default function Home({ cars, reviews }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <>
      <Head>
        <title>AutoLux Location — Location de Véhicules Premium à Oran</title>
        <meta name="description" content="Louez votre véhicule idéal à Oran. Large gamme sans caution. Réservation simple et rapide." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Layered background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-[#0e0e0e] to-[#111]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          {/* Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-[10%] w-64 h-64 bg-gold-600/[0.08] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-[5%] w-48 h-48 bg-gold-400/[0.05] rounded-full blur-[60px] pointer-events-none" />

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
          />

          <div className="relative z-10 text-center max-w-5xl mx-auto px-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-10">
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">Réservation disponible</span>
            </div>

            {/* Heading */}
            <h1 className="font-display font-black leading-[0.95] mb-8">
              <span className="block text-5xl md:text-7xl lg:text-[88px] text-hero-gradient mb-2">La Route,</span>
              <span className="block text-5xl md:text-7xl lg:text-[88px] text-gold-gradient italic">Votre Style</span>
            </h1>

            <p className="text-white/45 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Large sélection de véhicules à Oran. Citadines, SUV, utilitaires et premium.
              <span className="text-white/60"> Sans caution. Sans stress.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/cars" className="btn-gold text-base px-8 py-4 animate-pulse-gold">
                <Car size={18} />
                Voir les véhicules
              </Link>
              <Link href="/reservation" className="btn-outline text-base px-8 py-4">
                Réserver maintenant
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="inline-grid grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                { value: `${cars?.length || 14}`, label: 'Véhicules', sub: 'disponibles' },
                { value: '35+', label: 'Âge requis', sub: 'minimum' },
                { value: '0€', label: 'Caution', sub: 'garantie' },
              ].map((s) => (
                <div key={s.label} className="bg-[#111] px-8 py-5 text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-gold-gradient">{s.value}</div>
                  <div className="text-white/70 text-sm font-medium mt-0.5">{s.label}</div>
                  <div className="text-white/25 text-[10px] tracking-wider uppercase">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[10px] tracking-widest uppercase">Défiler</span>
            <ChevronDown size={14} className="animate-bounce" />
          </div>
        </section>

        {/* ── VÉHICULES ── */}
        <section className="py-24 px-5">
          <div className="max-w-7xl mx-auto">
            <div className="animate-on-scroll text-center mb-16">
              <span className="section-badge mb-4 inline-block">Notre flotte</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                Véhicules <span className="text-gold-gradient italic">disponibles</span>
              </h2>
              <p className="text-white/35 mt-4 max-w-lg mx-auto">
                {cars?.length || 0} véhicules sélectionnés pour chaque besoin et budget.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(cars || []).slice(0, 8).map((car, i) => (
                <div
                  key={car.id}
                  className={`animate-on-scroll delay-${Math.min(i + 1, 4)} group relative card-dark overflow-hidden
                    hover:border-gold-500/25 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                    transition-all duration-300`}
                >
                  {/* Image */}
                  <div className="relative bg-[#181818] h-44 overflow-hidden">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car size={40} className="text-white/10" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />
                    {/* Category badge */}
                    <div className="absolute top-3 right-3">
                      <span className="tag-category">{car.category}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-base leading-tight">{car.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-white/30 text-xs">{car.fuel}</span>
                          <span className="text-white/15">•</span>
                          <span className="text-white/30 text-xs">{car.seats} places</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-gold-400 font-bold text-xl leading-none">{car.resale_price}€</div>
                        <div className="text-white/25 text-[10px] mt-0.5">/ jour</div>
                      </div>
                    </div>

                    <Link
                      href={`/reservation?car=${car.id}`}
                      className="block w-full text-center text-sm font-semibold text-gold-500 border border-gold-500/25 rounded-xl py-2.5
                        hover:bg-gold-500 hover:text-noir-950 hover:border-gold-500 hover:shadow-[0_4px_16px_rgba(226,182,20,0.3)]
                        transition-all duration-200"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link href="/cars" className="btn-outline px-8 py-3.5">
                Voir toute la flotte
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── POURQUOI ── */}
        <section className="py-24 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#111]" />
          <div className="absolute top-0 left-0 right-0 h-px divider-gold" />
          <div className="absolute bottom-0 left-0 right-0 h-px divider-gold" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            <div className="animate-on-scroll text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                Pourquoi nous <span className="text-gold-gradient italic">choisir ?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  num: '01',
                  title: 'Sans caution',
                  desc: 'Aucune caution exigée. Nous faisons confiance à nos clients et simplifions chaque location.',
                },
                {
                  icon: Zap,
                  num: '02',
                  title: 'Réservation rapide',
                  desc: 'Réservez en ligne en quelques minutes. Confirmation immédiate par WhatsApp.',
                },
                {
                  icon: Car,
                  num: '03',
                  title: 'Flotte variée',
                  desc: 'Citadines, SUV, utilitaires 9 places, berlines. Un véhicule pour chaque besoin.',
                },
              ].map((item, i) => (
                <div key={item.num} className={`animate-on-scroll delay-${i + 1} card-glass p-8 group hover:border-gold-500/15 transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center group-hover:bg-gold-500/15 group-hover:scale-110 transition-all duration-300">
                      <item.icon size={20} className="text-gold-400" />
                    </div>
                    <span className="font-display text-4xl font-bold text-white/[0.04] select-none">{item.num}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AVIS ── */}
        {reviews && reviews.length > 0 && (
          <section className="py-24 px-5">
            <div className="max-w-7xl mx-auto">
              <div className="animate-on-scroll text-center mb-6">
                <span className="section-badge mb-4 inline-block">Témoignages</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  Ce que disent nos <span className="text-gold-gradient italic">clients</span>
                </h2>
              </div>

              {/* Avg rating */}
              <div className="animate-on-scroll flex items-center justify-center gap-3 mb-14">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'} />
                  ))}
                </div>
                <span className="text-white/60 text-sm">{avgRating} / 5 — {reviews.length} avis vérifiés</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.slice(0, 3).map((review, i) => (
                  <div key={review.id} className={`animate-on-scroll delay-${i + 1} card-dark p-7 relative overflow-hidden group hover:border-gold-500/15 transition-all duration-300`}>
                    {/* Quote decoration */}
                    <span className="absolute top-4 right-5 font-display text-7xl text-gold-500/[0.07] leading-none select-none pointer-events-none">"</span>

                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                      ))}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-gold-500/30 to-gold-700/20 border border-gold-500/20 rounded-full flex items-center justify-center">
                        <span className="text-gold-400 font-bold text-sm">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-white font-medium text-sm">{review.client_name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link href="/reviews" className="btn-ghost text-sm text-white/40 hover:text-white">
                  Voir tous les avis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA FINAL ── */}
        <section className="py-20 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="animate-on-scroll relative card-glow p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.04] via-transparent to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Car size={28} className="text-gold-400" />
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
                  Prêt à prendre <span className="text-gold-gradient italic">la route ?</span>
                </h2>
                <p className="text-white/40 mb-10 text-lg max-w-lg mx-auto">
                  Réservez dès maintenant. Simple, rapide, sans caution.
                </p>
                <Link href="/reservation" className="btn-gold text-base px-10 py-4 animate-pulse-gold">
                  <CalendarCheck size={18} />
                  Réserver maintenant
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/[0.06] bg-[#0e0e0e]">
          <div className="max-w-7xl mx-auto px-5 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                    <span className="text-noir-950 font-black text-xs">AL</span>
                  </div>
                  <span className="font-display font-bold text-white">Auto<span className="text-gold-500">Lux</span> Location</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/30 text-xs">
                  <MapPin size={11} />
                  <span>Oran, Algérie</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-6 text-sm text-white/30">
                {[
                  { href: '/cars',       label: 'Véhicules' },
                  { href: '/conditions', label: 'Conditions' },
                  { href: '/reviews',    label: 'Avis' },
                  { href: '/reservation',label: 'Réserver' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="hover:text-gold-400 transition-colors duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Copyright */}
              <div className="text-white/20 text-xs">
                <div>© 2024 AutoLux Location</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users size={10} />
                  <span>Réservé 35 ans et plus</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const { data: cars }    = await supabase.from('cars').select('*').order('name');
  const { data: reviews } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6);
  return { props: { cars: cars || [], reviews: reviews || [] } };
}
