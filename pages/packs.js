import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Package, Car, Building2, Home, Waves, UserCheck, Search, X, ArrowRight, Star, MessageCircle, Sparkles, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import { useFavorites } from '../lib/favorites';

const cur = (c) => c === 'DZD' ? 'DA' : '€';

// Paliers de gamme
const TIERS = {
  entree:     { label: 'Entrée de gamme', ar: 'اقتصادي',  en: 'Entry-level', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  medium:     { label: 'Médium',          ar: 'متوسط',     en: 'Mid-range',   cls: 'bg-gold-500/15 text-gold-400 border-gold-500/25' },
  premium:    { label: 'Premium',         ar: 'فاخر',      en: 'Premium',     cls: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  entreprise: { label: 'Entreprise / Groupe', ar: 'شركات / مجموعات', en: 'Business / Group', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

// Composants inclus → icône
const INCLUSIONS = [
  { key: 'inc_car',       icon: Car,        label: 'Voiture',     ar: 'سيارة', en: 'Car' },
  { key: 'inc_apartment', icon: Building2,  label: 'Appartement', ar: 'شقة', en: 'Apartment' },
  { key: 'inc_villa',     icon: Home,       label: 'Villa',       ar: 'فيلا', en: 'Villa' },
  { key: 'inc_jetski',    icon: Waves,      label: 'Jet ski',     ar: 'جت سكي', en: 'Jet ski' },
  { key: 'inc_driver',    icon: UserCheck,  label: 'Chauffeur',   ar: 'سائق', en: 'Driver' },
];

// Dispo du pack = dérivée de l'inventaire réel lié (véhicule + bien).
const packAvailable = (p) => {
  if (p.status !== 'disponible') return false;
  const carOk  = !p.car_id      || (p.car && p.car.available !== false);
  const propOk = !p.property_id || (p.property && (p.property.status || 'disponible') === 'disponible');
  return carOk && propOk;
};

const priceLabel = (p, lang) => {
  if (!p.price || p.price_type === 'sur_devis') return lang === 'ar' ? 'حسب الطلب' : lang === 'en' ? 'On quote' : 'Sur devis';
  const suffix = p.price_type === 'jour' ? (lang === 'ar' ? '/يوم' : lang === 'en' ? '/day' : '/jour')
               : p.price_type === 'semaine' ? (lang === 'ar' ? '/أسبوع' : lang === 'en' ? '/week' : '/semaine')
               : (lang === 'ar' ? '/إقامة' : lang === 'en' ? ' /stay' : ' /séjour');
  return `${Number(p.price).toLocaleString()} ${cur(p.currency)}${suffix}`;
};

function PackCard({ p, lang }) {
  const WHATSAPP = waNumber(useSettings());
  const { isFav, toggle } = useFavorites();
  const photos = (p.pack_photos || []).sort((a, b) => a.position - b.position).map(x => x.url);
  if (p.image_url && !photos.includes(p.image_url)) photos.unshift(p.image_url);
  const photo = photos[0];
  const tier = TIERS[p.tier] || TIERS.entree;
  const incs = INCLUSIONS.filter(i => p[i.key]);
  const available = packAvailable(p);
  const waMsg = encodeURIComponent(
    lang === 'ar'
      ? `مرحبا فيك كونسيرجري، أنا مهتم بـ "${p.title}". هل يمكن إعطائي التفاصيل والسعر؟`
      : `Bonjour Fik Conciergerie, je suis intéressé(e) par le "${p.title}". Pouvez-vous me donner les détails et le tarif ?`
  );

  return (
    <div className="group relative bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/25 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.7)] transition-all duration-500 flex flex-col">
      <Link href={`/packs/${p.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {photo ? (
          <img src={photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e] flex items-center justify-center"><Package size={40} className="text-white/[0.08]" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${tier.cls}`}>{lang === 'ar' ? tier.ar : lang === 'en' ? tier.en : tier.label}</span>
          {p.featured && available && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950 flex items-center gap-1"><Star size={10} className="fill-current" /> {lang === 'ar' ? 'مميز' : lang === 'en' ? 'Popular' : 'Populaire'}</span>}
          {!available && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/25 backdrop-blur-md ml-auto">{lang === 'ar' ? 'غير متوفر حاليا' : lang === 'en' ? 'Unavailable' : 'Indisponible'}</span>}
        </div>
        {!available && <div className="absolute inset-0 bg-[#0a0a0a]/55 backdrop-blur-[2px]" />}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white font-bold text-xl leading-tight mb-1">{p.title}</h3>
          {p.tagline && <p className="text-white/45 text-xs leading-snug line-clamp-1">{p.tagline}</p>}
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(p.id, 'pack'); }}
          aria-label="Favori"
          className={`absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isFav(p.id, 'pack') ? 'bg-red-500/90 border-red-400 text-white' : 'bg-black/40 border-white/20 text-white/70 hover:text-white backdrop-blur-md'}`}>
          <Heart size={15} className={isFav(p.id, 'pack') ? 'fill-current' : ''} />
        </button>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Inclusions */}
        <div className="flex flex-wrap gap-1.5">
          {incs.map(({ key, icon: Icon, label, ar, en }) => (
            <span key={key} className="inline-flex items-center gap-1 text-[11px] text-white/55 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">
              <Icon size={12} className="text-gold-500/80" /> {lang === 'ar' ? ar : lang === 'en' ? en : label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-xl text-gold-400 leading-none tabular-nums">{priceLabel(p, lang)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/packs/${p.id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all"><ArrowRight size={14} /></Link>
            <a href={`https://wa.me/${WHATSAPP}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_16px_rgba(226,182,20,0.3)] transition-all">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PacksPage({ packs }) {
  const { lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [search, setSearch] = useState('');
  const [tier, setTier]     = useState('Tous');
  const hasPacks = packs && packs.length > 0;

  const tierKeys = ['Tous', ...Object.keys(TIERS)];
  const filtered = (packs || []).filter(p => {
    const txt = `${p.title} ${p.tagline || ''} ${p.description || ''}`.toLowerCase();
    const matchSearch = txt.includes(search.toLowerCase());
    const matchTier = tier === 'Tous' || p.tier === tier;
    return matchSearch && matchTier;
  });

  return (
    <>
      <Head>
        <title>Packs séjour — Voiture, Villa, Jet Ski — Fik Conciergerie Oran</title>
        <meta name="description" content="Packs tout-en-un à Oran : voiture + appartement, voiture + villa, voiture + villa + jet ski, et packs groupe/entreprise avec chauffeur. Réservez votre séjour clé en main via Fik Conciergerie." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Sparkles size={11} /> {lang === 'ar' ? 'باقات كل شيء في واحد' : lang === 'en' ? 'All-in-one packs' : 'Packs tout-en-un'}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">
              {lang === 'ar' ? 'باقات' : lang === 'en' ? 'Our' : 'Nos'} <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">{lang === 'ar' ? 'الإقامة' : lang === 'en' ? 'stay packs' : 'Packs séjour'}</span>
            </h1>
            <p className="text-white/35 max-w-xl mx-auto text-base leading-relaxed">
              {lang === 'ar'
                ? 'سيارة + سكن + جت سكي + سائق. كل شيء في باقة واحدة، حسب ميزانيتك.'
                : 'Voiture, immobilier, jet ski, chauffeur — tout réuni en un seul pack, du séjour malin au sur-mesure entreprise.'}
            </p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">
            {hasPacks ? (
              <>
                {/* Filters */}
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 mb-8 space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث...' : lang === 'en' ? 'Search a pack...' : 'Rechercher un pack...'} className="w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={13} /></button>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tierKeys.map(k => (
                      <button key={k} onClick={() => setTier(k)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tier === k ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>
                        {k === 'Tous' ? (lang === 'ar' ? 'الكل' : lang === 'en' ? 'All' : 'Tous') : (lang === 'ar' ? TIERS[k].ar : lang === 'en' ? TIERS[k].en : TIERS[k].label)}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">{filtered.length} {lang === 'ar' ? 'باقة' : (lang === 'en' ? 'pack' : 'pack') + (filtered.length > 1 ? 's' : '')}</p>

                {filtered.length === 0 ? (
                  <div className="text-center py-24"><Search size={22} className="text-white/15 mx-auto mb-4" /><p className="text-white/35">{lang === 'ar' ? 'لا توجد نتائج' : lang === 'en' ? 'No pack found' : 'Aucun pack trouvé'}</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(p => <PackCard key={p.id} p={p} lang={lang} />)}
                  </div>
                )}
              </>
            ) : (
              /* Coming soon */
              <div className="text-center py-20 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-7"><Package size={32} className="text-gold-400" /></div>
                <h2 className="font-display text-3xl font-bold text-white mb-3">{lang === 'ar' ? 'باقات قريبا' : lang === 'en' ? 'Packs coming soon' : 'Packs bientôt disponibles'}</h2>
                <p className="text-white/40 leading-relaxed mb-8">{lang === 'ar' ? 'تواصل معنا لتحضير باقة مخصصة لك.' : lang === 'en' ? 'Contact us to prepare a custom pack for your stay.' : 'Contactez-nous pour préparer un pack sur mesure selon votre séjour.'}</p>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lang === 'ar' ? 'مرحبا، أنا مهتم بباقات الإقامة.' : lang === 'en' ? 'Hello, I am interested in your stay packs.' : 'Bonjour, je suis intéressé(e) par vos packs séjour.')}`} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"><MessageCircle size={15} /> {lang === 'ar' ? 'تواصل واتساب' : lang === 'en' ? 'Contact on WhatsApp' : 'Contacter sur WhatsApp'}</a>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { packs: [] }, revalidate: 30 };
    const { data } = await supabase
      .from('packs')
      .select('*, pack_photos(url, position), car:cars(id, name, image_url, available), property:properties(id, title, city, status, image_url)')
      .neq('status', 'indisponible')
      .order('featured', { ascending: false })
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    return { props: { packs: data || [] }, revalidate: 30 };
  } catch {
    return { props: { packs: [] }, revalidate: 30 };
  }
}
