import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

export default function Home({ cars, reviews }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Fik Conciergerie — Location de Véhicules Premium</title>
        <meta name="description" content="Louez votre véhicule idéal. Large gamme de voitures disponibles. Réservation simple et rapide." />
      </Head>
      <div className="grain min-h-screen bg-noir-950">
        <Navbar />
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-noir-950 via-noir-950 to-noir-900" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
<div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-gold-400 text-sm font-medium">Réservation disponible maintenant</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6">
              La Route,{' '}
              <span className="text-gold-500 italic">Votre Style</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Large sélection de véhicules pour tous vos besoins. Citadines, SUV, utilitaires et voitures premium. Sans caution. Sans stress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cars" className="btn-gold text-base px-8 py-4 animate-pulse-gold">
                Voir les véhicules
              </Link>
              <Link href="/reservation" className="btn-outline text-base px-8 py-4">
                Réserver maintenant
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto">
              {[
                { value: `${cars?.length || 14}`, label: 'Véhicules' },
                { value: '35+', label: 'Âge requis' },
                { value: '0', label: 'Caution' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-bold text-gold-500">{stat.value}</div>
                  <div className="text-white/40 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold-500/50" />
            <span className="text-white/30 text-xs">Défiler</span>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-on-scroll text-center mb-16">
              <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Notre flotte</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3">Véhicules disponibles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(cars || []).slice(0, 8).map((car, i) => (
                <div
                  key={car.id}
                  className="animate-on-scroll card-dark p-5 hover:border-gold-500/30 hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="bg-noir-800 rounded-xl h-48 mb-4 flex items-center justify-center overflow-hidden relative">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl mb-1">🚗</div>
                        <span className="text-white/20 text-xs">Photo à venir</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-noir-950/80 backdrop-blur text-gold-400 text-xs px-2 py-1 rounded-full capitalize">{car.category}</span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{car.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {car.fuel && <span className="text-white/30 text-xs">⛽ {car.fuel}</span>}
                        {car.seats && <span className="text-white/30 text-xs">👤 {car.seats} pl.</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-gold-500 font-bold text-lg">{car.resale_price} €</div>
                      <div className="text-white/30 text-xs">/ jour</div>
                    </div>
                  </div>
                  <Link
                    href={`/reservation?car=${car.id}`}
                    className="block w-full text-center bg-gold-500 text-noir-950 font-semibold py-2.5 rounded-xl hover:bg-gold-400 transition-colors duration-200 text-sm"
                  >
                    Réserver ce véhicule
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/cars" className="btn-outline">Voir tous les véhicules →</Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-noir-900">
          <div className="max-w-7xl mx-auto">
            <div className="animate-on-scroll text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-white">Pourquoi nous choisir ?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '🛡️', title: 'Sans caution', desc: 'Nous faisons confiance à nos clients. Aucune caution ne vous sera demandée.' },
                { icon: '⚡', title: 'Réservation rapide', desc: 'Réservez en ligne en quelques minutes. Confirmation immédiate par WhatsApp.' },
                { icon: '🚗', title: 'Flotte variée', desc: 'Citadines économiques, SUV familiaux, utilitaires 9 places. Un véhicule pour chaque besoin.' },
              ].map((item) => (
                <div key={item.title} className="animate-on-scroll card-dark p-8 text-center">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-white font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {reviews && reviews.length > 0 && (
          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="animate-on-scroll text-center mb-16">
                <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Témoignages</span>
                <h2 className="font-display text-4xl font-bold text-white mt-3">Ce que disent nos clients</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="animate-on-scroll card-dark p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-gold-500">★</span>
                      ))}
                    </div>
                    <p className="text-white/60 italic mb-4">"{review.comment}"</p>
                    <span className="text-white font-medium text-sm">— {review.client_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-dark p-12 border-gold-500/20">
              <h2 className="font-display text-4xl font-bold text-white mb-4">Prêt à prendre la route ?</h2>
              <p className="text-white/40 mb-8">Réservez dès maintenant votre véhicule. Simple, rapide, sans caution.</p>
              <Link href="/reservation" className="btn-gold text-base px-10 py-4">Réserver maintenant</Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gold-500 rounded flex items-center justify-center">
                <span className="text-noir-950 font-black text-xs">FC</span>
              </div>
              <span className="font-display font-bold text-white">Fik Conciergerie</span>
            </div>
            <div className="flex gap-6 text-sm text-white/30">
              <Link href="/conditions" className="hover:text-gold-500 transition-colors">Conditions</Link>
              <Link href="/cars" className="hover:text-gold-500 transition-colors">Véhicules</Link>
              <Link href="/reviews" className="hover:text-gold-500 transition-colors">Avis</Link>
            </div>
            <span className="text-white/20 text-sm">© 2025 Fik Conciergerie</span>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    if (!supabase) return { props: { cars: [], reviews: [] } };
    const { data: cars } = await supabase.from('cars').select('*').order('name');
    const { data: reviews } = await supabase
      .from('reviews').select('*').eq('approved', true)
      .order('created_at', { ascending: false }).limit(6);
    return { props: { cars: cars || [], reviews: reviews || [] } };
  } catch (error) {
    console.error('Erreur getServerSideProps index:', error);
    return { props: { cars: [], reviews: [] } };
  }
}
