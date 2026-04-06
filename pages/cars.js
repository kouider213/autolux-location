import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Tous', 'citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'];

export default function CarsPage({ cars }) {
  const [filter, setFilter] = useState('Tous');
  const [maxPrice, setMaxPrice] = useState(200);

  const filtered = cars.filter(car => {
    const catMatch = filter === 'Tous' || car.category === filter;
    const priceMatch = car.resale_price <= maxPrice;
    return catMatch && priceMatch;
  });

  return (
    <>
      <Head>
        <title>Nos Véhicules — AutoLux Location</title>
        <meta name="description" content="Découvrez notre flotte de véhicules disponibles à la location." />
      </Head>

      <div className="grain min-h-screen bg-noir-950">
        <Navbar />

        <div className="pt-28 pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Notre flotte</span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mt-3">Tous nos véhicules</h1>
              <p className="text-white/40 mt-4 max-w-xl mx-auto">
                {cars.length} véhicule{cars.length > 1 ? 's' : ''} disponibles. Choisissez celui qui correspond à votre besoin.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 capitalize ${
                    filter === cat
                      ? 'bg-gold-500 text-noir-950 border-gold-500'
                      : 'border-white/10 text-white/50 hover:border-gold-500/50 hover:text-white/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="text-white/40 text-sm">Prix max / jour :</span>
              <input
                type="range"
                min="15"
                max="200"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-32 accent-yellow-500"
              />
              <span className="text-gold-500 font-semibold text-sm w-16">{maxPrice} €</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 text-white/30">
                <div className="text-5xl mb-4">🔍</div>
                <p>Aucun véhicule ne correspond à vos filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CarCard({ car }) {
  const icons = {
    citadine: '🚗',
    berline: '🚙',
    SUV: '🚐',
    familiale: '🚌',
    utilitaire: '🚐',
    premium: '🏎️',
  };

  return (
    <div className="card-dark overflow-hidden hover:border-gold-500/30 hover:-translate-y-1 transition-all duration-300 group">
      <div className="bg-noir-800 h-44 flex items-center justify-center overflow-hidden relative">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-center">
            <div className="text-5xl">{icons[car.category] || '🚗'}</div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-noir-950/80 backdrop-blur text-gold-400 text-xs px-2 py-1 rounded-full capitalize">
            {car.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">{car.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/30 text-xs">⛽ {car.fuel}</span>
              <span className="text-white/30 text-xs">👤 {car.seats} places</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gold-500 font-bold text-xl">{car.resale_price} €</div>
            <div className="text-white/20 text-xs">/jour</div>
          </div>
        </div>

        <Link
          href={`/reservation?car=${car.id}`}
          className="block w-full text-center bg-gold-500 text-noir-950 font-semibold py-2.5 rounded-xl hover:bg-gold-400 transition-colors duration-200 text-sm"
        >
          Réserver ce véhicule
        </Link>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: cars } = await supabase.from('cars').select('*').order('resale_price');
  return { props: { cars: cars || [] } };
}