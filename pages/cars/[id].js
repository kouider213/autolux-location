import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Car, Fuel, Users, Settings, ArrowLeft, Calendar } from 'lucide-react';

export default function CarDetail({ car }) {
  const router = useRouter();

  if (!car) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Véhicule introuvable.</p>
          <Link href="/cars" className="text-gold-500 underline">Retour aux véhicules</Link>
        </div>
      </div>
    );
  }

  const prix = car.resale_price ? car.resale_price + ' €/jour' : 'Sur demande';
  const isSurDemande = !car.resale_price;

  return (
    <>
      <Head>
        <title>{car.name} — Fik Conciergerie</title>
        <meta name="description" content={car.description} />
      </Head>

      <div className="min-h-screen bg-noir-950 text-white">
        {/* Back */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link href="/cars" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span>Retour aux véhicules</span>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photo */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-noir-800">
              <img
                src={car.image_url || '/placeholder-car.jpg'}
                alt={car.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <span className="absolute top-4 left-4 bg-gold-500 text-noir-950 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {car.category}
            </span>
          </div>

          {/* Infos */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">{car.name}</h1>

              {/* Prix */}
              <div className="mb-6">
                {isSurDemande ? (
                  <span className="text-gold-500 font-bold text-3xl">Sur demande</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-gold-500 font-bold text-3xl">{car.resale_price} €</span>
                    <span className="text-white/50 text-sm">/jour</span>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-noir-800 rounded-xl p-4 flex items-center gap-3">
                  <Fuel size={20} className="text-gold-500" />
                  <div>
                    <p className="text-white/40 text-xs">Carburant</p>
                    <p className="font-semibold">{car.fuel || 'Essence'}</p>
                  </div>
                </div>
                <div className="bg-noir-800 rounded-xl p-4 flex items-center gap-3">
                  <Settings size={20} className="text-gold-500" />
                  <div>
                    <p className="text-white/40 text-xs">Transmission</p>
                    <p className="font-semibold">{car.transmission || 'Manuelle'}</p>
                  </div>
                </div>
                <div className="bg-noir-800 rounded-xl p-4 flex items-center gap-3">
                  <Users size={20} className="text-gold-500" />
                  <div>
                    <p className="text-white/40 text-xs">Places</p>
                    <p className="font-semibold">{car.seats || 5} places</p>
                  </div>
                </div>
                <div className="bg-noir-800 rounded-xl p-4 flex items-center gap-3">
                  <Car size={20} className="text-gold-500" />
                  <div>
                    <p className="text-white/40 text-xs">Catégorie</p>
                    <p className="font-semibold">{car.category}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2 text-gold-500">À propos</h2>
                  <p className="text-white/70 leading-relaxed">{car.description}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <Link
              href={isSurDemande
                ? `/reservation?car=${car.id}&name=${encodeURIComponent(car.name)}&demande=1`
                : `/reservation?car=${car.id}&name=${encodeURIComponent(car.name)}&prix=${car.resale_price}`
              }
              className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              {isSurDemande ? 'Demander un devis' : 'Réserver ce véhicule'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: car } = await supabase
      .from('cars')
      .select('*')
      .eq('id', params.id)
      .single();
    return { props: { car: car || null } };
  } catch {
    return { props: { car: null } };
  }
}
