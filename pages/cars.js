import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Car, Fuel, Users, Search, ArrowRight, X, Gauge, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang, localizeValue } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import { useFavorites } from '../lib/favorites';
import { carHref } from '../lib/carUrl';

const CATEGORIES = ['Tous', 'citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'];

export default function CarsPage({ cars: initialCars }) {
  const { t, lang } = useLang();
  const settings = useSettings();
  const WHATSAPP = waNumber(settings);
  const { isFav, toggle } = useFavorites();
  const availMode = settings.availability_mode !== false; // ON par défaut (safe)
  const [filter, setFilter]     = useState('Tous');
  const [search, setSearch]     = useState('');
  const [cars, setCars]         = useState(initialCars || []);
  const [bookedCarIds, setBookedCarIds] = useState({});

  // Refresh client-side des véhicules (sinon ISR revalidate:30 fige la liste :
  // un toggle dispo/indispo dans l'app n'apparaît pas tout de suite). Même
  // pattern que la home. Garde le SSR/ISR pour le SEO + 1er rendu.
  useEffect(() => {
    if (!supabase) return;
    supabase.from('cars').select('*').order('resale_price').then(({ data }) => {
      if (data && data.length > 0) setCars(data);
    });
  }, []);

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
    const nameMatch  = car.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && nameMatch;
  });

  const hasFilters = filter !== 'Tous' || search;

  return (
    <>
      <Head>
        <title>Nos Véhicules — Fik Conciergerie</title>
        <meta name="description" content="Découvrez notre flotte complète. Citadines, SUV, utilitaires et véhicules premium à louer à Oran." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-28 md:pt-36 pb-10 md:pb-16 px-5 overflow-hidden">
          {/* BG layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-10 right-1/4 w-48 h-48 bg-gold-600/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Car size={11} />
              {t('cars.badge')} · {cars.length}
            </div>
            <h1 className="font-display text-[44px] md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6">
              {t('cars.title1')}<br />
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">{t('cars.title2')}</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {String(t('cars.tags')).split('·').map(x => x.trim()).filter(Boolean).map(x => (
                <span key={x} className="glass rounded-full px-3.5 py-1.5 text-white/70 text-xs md:text-sm">{x}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">

            {/* Filters */}
            <div className="sticky top-[68px] md:top-[84px] z-30 bg-[#0d0d0d]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 md:p-4 mb-6 md:mb-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] md:flex md:items-center md:gap-4 space-y-3 md:space-y-0">
              <div className="flex flex-col sm:flex-row gap-3 md:w-72 lg:w-80 md:flex-shrink-0">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('cars.search')}
                    className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/15 focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile : une seule ligne qui défile ; PC : retour à la ligne */}
              <div className="flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible -mx-1 px-1 no-scrollbar">
                {CATEGORIES.filter(cat => cat === 'Tous' || cars.some(c => c.category === cat)).map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize ${
                      filter === cat
                        ? 'bg-gold-500 text-noir-950 shadow-[0_4px_14px_rgba(226,182,20,0.35)]'
                        : 'bg-white/[0.04] border border-white/[0.07] text-white/55 hover:text-white hover:border-gold-500/30'
                    }`}>
                    {cat === 'Tous' ? (lang === 'ar' ? 'الكل' : lang === 'en' ? 'All' : 'Tous') : localizeValue(cat, lang)}
                    <span className={`text-[10px] tabular-nums ${filter === cat ? 'text-noir-950/60' : 'text-white/30'}`}>
                      {cat === 'Tous' ? cars.length : cars.filter(c => c.category === cat).length}
                    </span>
                  </button>
                ))}
                {hasFilters && (
                  <button onClick={() => { setFilter('Tous'); setSearch(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all flex items-center gap-1.5">
                    <X size={11} /> {t('b.reset')}
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="text-white/50">{filtered.length}</span> {t('cars.title2')} {t('b.found')}
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-28">
                <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Search size={22} className="text-white/15" />
                </div>
                <p className="text-white/35 mb-4">{t('cars.none')}</p>
                <button onClick={() => { setFilter('Tous'); setSearch(''); }}
                  className="text-gold-500 text-sm hover:text-gold-400 transition-colors underline underline-offset-4">
                  {t('b.reset')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {filtered.map(car => <CarCard key={car.id} car={car} bookedUntil={bookedCarIds[car.id] || null} t={t} lang={lang} availMode={availMode} wa={WHATSAPP} isFav={isFav(car.id)} onFav={() => toggle(car.id)} />)}
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
                    <p className="text-white font-bold text-lg mb-1">{t('cars.help_title')}</p>
                    <p className="text-white/35 text-sm">{t('cars.help_desc')}</p>
                  </div>
                  <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Bonjour, je cherche un véhicule spécifique.')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-gold px-8 py-3 text-sm w-full justify-center">
                    {t('common.contact_wa')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

function CarCard({ car, bookedUntil, t, lang, availMode, wa, isFav, onFav }) {
  const isBookedNow = !!bookedUntil;
  const available   = car.available && !isBookedNow;
  const cur = car.currency === 'EUR' ? '€' : 'DA';

  const status = availMode ? (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 text-gold-300 border border-gold-500/40 backdrop-blur-md">{t('d.on_demand')}</span>
  ) : available ? (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 backdrop-blur-md">● {t('b.available')}</span>
  ) : isBookedNow ? (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 backdrop-blur-md">{t('b.rented')} · {bookedUntil}</span>
  ) : (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 backdrop-blur-md">{t('b.unavailable')}</span>
  );

  const cta = availMode ? (
    <Link href={`/reservation?car=${car.id}`}
      className="btn-gold !px-3.5 !py-2.5 !text-xs !rounded-xl whitespace-nowrap">{t('b.check')}</Link>
  ) : (
    <Link href={available ? `/reservation?car=${car.id}` : '#'}
      className={available ? 'btn-gold !px-4 !py-2.5 !text-sm !rounded-xl' : 'px-4 py-2.5 rounded-xl text-sm font-bold bg-white/[0.04] text-white/20 cursor-not-allowed'}>
      {available ? t('common.book') : t('cars.indispo')}
    </Link>
  );

  const specs = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[[Fuel, localizeValue(car.fuel, lang)], [Users, `${car.seats} ${t('b.places')}`], [null, car.transmission && localizeValue(car.transmission, lang)]]
        .filter(([, v]) => v).map(([Icon, v]) => (
          <span key={v} className="inline-flex items-center gap-1 text-white/55 text-[11px] bg-white/[0.05] border border-white/[0.06] rounded-full px-2 py-0.5 capitalize">
            {Icon && <Icon size={10} className="text-gold-500/70" />}{v}
          </span>
        ))}
    </div>
  );

  const fav = (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFav && onFav(); }}
      aria-label="Favori"
      className={`absolute z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
        isFav ? 'bg-red-500/90 border-red-400 text-white' : 'bg-black/50 border-white/15 text-white/80 hover:text-white'
      }`}>
      <Heart size={15} className={isFav ? 'fill-current' : ''} />
    </button>
  );

  return (
    <div className="group relative flex sm:block rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.07] bg-gradient-to-b from-[#141414] to-[#0d0d0d] hover:border-gold-500/40 sm:hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(226,182,20,0.1)] transition-all duration-500">

      {/* Photo — carré à gauche sur téléphone, 4/3 en haut sur tablette/PC */}
      <Link href={carHref(car)} className="relative block w-[40%] min-h-[150px] sm:min-h-0 sm:w-auto flex-shrink-0 overflow-hidden sm:aspect-[4/3]">
        {car.image_url ? (
          <img src={car.image_url} alt={car.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-[#111] flex items-center justify-center"><Car size={36} className="text-white/[0.06]" /></div>
        )}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        {!availMode && !available && <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-[2px]" />}

        <div className="hidden sm:flex absolute top-3 left-3 right-3 items-start justify-between">
          <span className="tag-category">{localizeValue(car.category, lang)}</span>
          {status}
        </div>
        <div className="hidden sm:block absolute inset-x-0 bottom-0 p-4 pr-14">
          <h3 className="font-body text-white font-semibold text-xl tracking-tight leading-tight mb-2">{car.name}</h3>
          {specs}
        </div>
        <div className="hidden sm:block [&>button]:bottom-4 [&>button]:right-4">{fav}</div>
      </Link>

      {/* Infos — à droite sur téléphone */}
      <div className="sm:hidden flex-1 min-w-0 p-3.5 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-gold-500/80 text-[10px] font-bold uppercase tracking-wider capitalize">{localizeValue(car.category, lang)}</p>
            <Link href={carHref(car)}><h3 className="font-body text-white font-semibold text-lg tracking-tight leading-tight truncate">{car.name}</h3></Link>
          </div>
          <div className="relative w-9 h-9 flex-shrink-0 [&>button]:inset-0">{fav}</div>
        </div>
        <div className="mt-2 mb-3">{specs}</div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="leading-none">
            <span className="font-display font-black text-2xl text-gold-gradient tabular-nums">{Number(car.resale_price).toLocaleString('fr-FR')}</span>
            <span className="text-gold-500/60 text-xs ml-0.5">{cur}</span>
            <span className="block text-white/30 text-[10px] mt-1">{t('b.per_day')}</span>
          </div>
          {cta}
        </div>
      </div>

      {/* Prix + action — tablette/PC */}
      <div className="hidden sm:flex p-4 items-center justify-between gap-2 border-t border-white/[0.05]">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-black text-3xl text-gold-gradient leading-none tabular-nums">{Number(car.resale_price).toLocaleString('fr-FR')}</span>
          <span className="text-gold-500/60 text-sm">{cur}</span>
          <span className="text-white/30 text-xs">{t('b.per_day')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={carHref(car)} aria-label={car.name}
            className="hidden xl:flex w-9 h-9 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <ArrowRight size={14} />
          </Link>
          {cta}
        </div>
      </div>
    </div>
  );
}
