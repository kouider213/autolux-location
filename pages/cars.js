import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Car, Fuel, Users, SlidersHorizontal, Search, ArrowRight, X, Gauge } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Tous', 'citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'];

export default function CarsPage({ cars }) {
  const [filter, setFilter]     = useState('Tous');
  const [maxPrice, setMaxPrice] = useState(200);
  const [search, setSearch]     = useState('');
  const [bookedCarIds, setBookedCarIds] = useState({});

  useEffect(() => {
    if (!supabase) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('bookings')
      .select('car_id, start_date, end_date, status')
      .in('status', ['ACCEPTED', 'CONFIRMED', 'ACTIVE'])
      .lte('start_date', today)
      .gte('end_date', today)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(b => { map[b.car_id] = b.end_date; });
        setBookedCarIds(map);
      });
  }, []);

  const filtered = cars.filter(car => {
    const catMatch   = filter === 'Tous' || car.category === filter;
    const priceMatch = car.resale_price <= maxPrice;
    const nameMatch  = car.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && priceMatch && nameMatch;
  });

  const hasFilters = filter !== 'Tous' || maxPrice < 200 || search;

  return (
    <>
      <Head>
        <title>Nos Véhicules — Fik Conciergerie</title>
        <meta name="description" content="Découvrez notre flotte complète. Citadines, SUV, utilitaires et véhicules premium à louer à Oran." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-20 px-5 overflow-hidden">
          {/* BG layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-10 right-1/4 w-48 h-48 bg-gold-600/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Car size={11} />
              Notre flotte · {cars.length} véhicules
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">
              Tous nos<br />
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">véhicules</span>
            </h1>
            <p className="text-white/35 max-w-lg mx-auto text-base leading-relaxed">
              Kilométrage illimité · Assurance incluse · Disponible 7j/7
            </p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">

            {/* Filters */}
            <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un véhicule..."
                    className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/15 focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 sm:w-60">
                  <SlidersHorizontal size={13} className="text-gold-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/30 text-xs">Prix max / jour</span>
                      <span className="text-gold-400 font-bold text-sm tabular-nums">{maxPrice} €</span>
                    </div>
                    <input type="range" min="15" max="200" value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1 accent-yellow-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                      filter === cat
                        ? 'bg-gold-500 text-noir-950 shadow-[0_4px_14px_rgba(226,182,20,0.35)]'
                        : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/15'
                    }`}>{cat}</button>
                ))}
                {hasFilters && (
                  <button onClick={() => { setFilter('Tous'); setMaxPrice(200); setSearch(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all flex items-center gap-1.5">
                    <X size={11} /> Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="text-white/50">{filtered.length}</span> véhicule{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-28">
                <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Search size={22} className="text-white/15" />
                </div>
                <p className="text-white/35 mb-4">Aucun véhicule ne correspond à vos critères.</p>
                <button onClick={() => { setFilter('Tous'); setMaxPrice(200); setSearch(''); }}
                  className="text-gold-500 text-sm hover:text-gold-400 transition-colors underline underline-offset-4">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(car => <CarCard key={car.id} car={car} bookedUntil={bookedCarIds[car.id] || null} />)}
              </div>
            )}

            {/* Bottom CTA */}
            {filtered.length > 0 && (
              <div className="mt-20 text-center">
                <div className="inline-flex flex-col items-center gap-5 bg-gradient-to-b from-[#141414] to-[#111] border border-white/[0.07] rounded-3xl px-10 py-8 max-w-md w-full">
                  <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center">
                    <Gauge size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg mb-1">Vous ne trouvez pas votre véhicule ?</p>
                    <p className="text-white/35 text-sm">Contactez-nous, nous avons peut-être ce qu'il vous faut.</p>
                  </div>
                  <a href="https://wa.me/32466311469?text=Bonjour%2C%20je%20cherche%20un%20v%C3%A9hicule%20sp%C3%A9cifique."
                    target="_blank" rel="noopener noreferrer"
                    className="btn-gold px-8 py-3 text-sm w-full justify-center">
                    Nous contacter sur WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CarCard({ car, bookedUntil }) {
  const isBookedNow = !!bookedUntil;
  const available   = car.available && !isBookedNow;

  return (
    <div className="group relative bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/25 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.7)] transition-all duration-500">

      {/* Image */}
      <Link href={`/cars/${car.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {car.image_url ? (
          <img src={car.image_url} alt={car.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center">
            <Car size={36} className="text-white/[0.06]" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/[0.08] text-white/50 capitalize">
            {car.category}
          </span>
          {available ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 backdrop-blur-md">
              ● Disponible
            </span>
          ) : isBookedNow ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20 backdrop-blur-md">
              Loué · {bookedUntil}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 backdrop-blur-md">
              Indisponible
            </span>
          )}
        </div>

        {/* Overlay dimming if unavailable */}
        {!available && (
          <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-[2px]" />
        )}

        {/* Bottom overlay on image — name + specs */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1.5">{car.name}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-white/35 text-xs">
              <Fuel size={10} /> {car.fuel}
            </span>
            <span className="flex items-center gap-1 text-white/35 text-xs">
              <Users size={10} /> {car.seats} places
            </span>
            {car.transmission && (
              <span className="text-white/35 text-xs capitalize">{car.transmission}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Bottom — price + CTA */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-2xl text-gold-400 leading-none tabular-nums">
              {car.resale_price}
            </span>
            <span className="text-gold-500/50 text-sm">€</span>
            <span className="text-white/25 text-xs">/ jour</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/cars/${car.id}`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all">
            <ArrowRight size={14} />
          </Link>
          <Link href={available ? `/reservation?car=${car.id}` : '#'}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              available
                ? 'bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_16px_rgba(226,182,20,0.3)] hover:shadow-[0_6px_20px_rgba(226,182,20,0.4)]'
                : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
            }`}>
            {available ? 'Réserver' : 'Indispo.'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { cars: [] }, revalidate: 30 };
    const { data: cars } = await supabase.from('cars').select('*').order('resale_price');
    return { props: { cars: cars || [] }, revalidate: 30 };
  } catch {
    return { props: { cars: [] }, revalidate: 30 };
  }
}
