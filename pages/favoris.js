import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ArrowRight, Car } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang, localizeValue } from '../lib/i18n';
import { useFavorites } from '../lib/favorites';

export default function FavorisPage() {
  const { lang } = useLang();
  const { ids, toggle } = useFavorites();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || ids.length === 0) { setCars([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('cars').select('*').in('id', ids)
      .then(({ data }) => { setCars(data || []); setLoading(false); });
  }, [ids.join(',')]);

  const title = lang === 'ar' ? 'مفضلتي' : lang === 'en' ? 'My favorites' : 'Mes favoris';

  return (
    <>
      <Head><title>{title} — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-badge mb-4 inline-block">{lang === 'ar' ? 'المفضلة' : lang === 'en' ? 'Favorites' : 'Favoris'}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
              <Heart size={26} className="text-red-500 fill-current" />{title}
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : cars.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 text-center">
              <Heart size={30} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/40 text-sm mb-1">{lang === 'ar' ? 'لا توجد مفضلة بعد.' : lang === 'en' ? 'No favorites yet.' : 'Aucun favori pour le moment.'}</p>
              <p className="text-white/25 text-xs">{lang === 'ar' ? 'اضغط على القلب على أي سيارة.' : lang === 'en' ? 'Tap the heart on any car.' : 'Touchez le cœur sur une voiture pour l\'ajouter.'}</p>
              <Link href="/cars" className="btn-gold inline-flex mt-5 px-6 py-3"><Car size={15} />{lang === 'ar' ? 'شاهد السيارات' : lang === 'en' ? 'See cars' : 'Voir les voitures'}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cars.map(car => (
                <div key={car.id} className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden group">
                  <Link href={`/cars/${car.id}`} className="block relative aspect-video overflow-hidden">
                    {car.image_url && <img src={car.image_url} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(car.id); }}
                      className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-red-500/90 border border-red-400 text-white">
                      <Heart size={15} className="fill-current" />
                    </button>
                  </Link>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-base mb-1">{car.name}</h3>
                    <p className="text-white/35 text-xs mb-3 capitalize">{localizeValue(car.category, lang)} · {car.seats} {lang === 'ar' ? 'مقاعد' : lang === 'en' ? 'seats' : 'places'} · {localizeValue(car.fuel, lang)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold-400 font-bold">{Number(car.resale_price).toLocaleString('fr-FR')} {car.currency === 'EUR' ? '€' : 'DA'}<span className="text-white/30 text-xs">{lang === 'en' ? '/day' : '/jour'}</span></span>
                      <Link href={`/reservation?car=${car.id}`} className="text-xs font-bold bg-gold-500 text-noir-950 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        {lang === 'ar' ? 'احجز' : lang === 'en' ? 'Book' : 'Réserver'} <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
