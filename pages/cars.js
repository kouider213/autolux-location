import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Car, Fuel, Users, SlidersHorizontal, Search, ArrowRight, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Tous', 'citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'];

export default function CarsPage({ cars }) {
  const [filter, setFilter]     = useState('Tous');
  const [maxPrice, setMaxPrice] = useState(200);
  const [search, setSearch]     = useState('');

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

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Page header */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">Notre flotte</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mt-4 mb-4">
              Tous nos <span className="text-gold-gradient italic">véhicules</span>
            </h1>
            <p className="text-white/35 max-w-xl mx-auto">
              {cars.length} véhicule{cars.length !== 1 ? 's' : ''} disponibles à la location.
              Choisissez celui qui correspond à votre besoin et votre budget.
            </p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-7xl mx-auto">

            {/* Filters */}
            <div className="card-glass p-5 mb-8 space-y-5">
              {/* Search + price */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un véhicule..."
                    className="input-dark pl-10 py-3"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:w-64 bg-[#1e1e1e] border border-white/[0.08] rounded-xl px-4 py-3">
                  <SlidersHorizontal size={14} className="text-gold-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/40 text-xs">Prix max / jour</span>
                      <span className="text-gold-400 font-semibold text-sm">{maxPrice} €</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="200"
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1 accent-yellow-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                      filter === cat
                        ? 'bg-gold-500 text-noir-950 border-gold-500 shadow-[0_4px_12px_rgba(226,182,20,0.3)]'
                        : 'border-white/[0.08] text-white/45 hover:border-gold-500/30 hover:text-white/70 bg-white/[0.02]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    onClick={() => { setFilter('Tous'); setMaxPrice(200); setSearch(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <X size={11} />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-white/30 text-sm">
                <span className="text-white/60 font-medium">{filtered.length}</span> véhicule{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Search size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 mb-2">Aucun véhicule ne correspond à vos critères.</p>
                <button
                  onClick={() => { setFilter('Tous'); setMaxPrice(200); setSearch(''); }}
                  className="text-gold-500 text-sm hover:text-gold-400 transition-colors mt-2"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CarCard({ car }) {
  return (
    <div className="group card-dark overflow-hidden hover:border-gold-500/25 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
      {/* Image — clickable to detail */}
      <Link href={`/cars/${car.id}`} className="block relative bg-[#181818] overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={car.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Car size={36} className="text-white/[0.07]" />
            <span className="text-white/15 text-[10px] tracking-widest uppercase">Photo à venir</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 right-3">
          <span className="tag-category">{car.category}</span>
        </div>
        {!car.available && (
          <div className="absolute inset-0 bg-[#0e0e0e]/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white/60 text-xs font-medium tracking-widest uppercase border border-white/20 rounded-full px-3 py-1">Indisponible</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/cars/${car.id}`}>
              <h3 className="text-white font-semibold text-base leading-tight truncate hover:text-gold-400 transition-colors">{car.name}</h3>
            </Link>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="flex items-center gap-1 text-white/30 text-xs">
                <Fuel size={10} />{car.fuel}
              </span>
              <span className="flex items-center gap-1 text-white/30 text-xs">
                <Users size={10} />{car.seats}p
              </span>
              {car.transmission && (
                <span className="text-white/30 text-xs capitalize">{car.transmission}</span>
              )}
            </div>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div className="text-gold-400 font-bold text-lg leading-none">{car.resale_price}€</div>
            <div className="text-white/25 text-[10px] mt-0.5">/ jour</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/cars/${car.id}`}
            className="flex-1 flex items-center justify-center text-xs font-medium py-2.5 rounded-xl border border-white/[0.08] text-white/45 hover:border-gold-500/30 hover:text-white/70 transition-all">
            Détails
          </Link>
          <Link
            href={`/reservation?car=${car.id}`}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 ${
              car.available !== false
                ? 'bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_12px_rgba(226,182,20,0.25)]'
                : 'bg-white/[0.04] text-white/30 cursor-not-allowed'
            }`}
          >
            {car.available !== false ? (<>Réserver <ArrowRight size={11} /></>) : 'Indisponible'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: cars } = await supabase.from('cars').select('*').order('resale_price');
  return { props: { cars: cars || [] } };
}

