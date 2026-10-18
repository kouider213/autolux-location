import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Package, Car, Building2, Home, Waves, UserCheck, Search, X, ArrowRight, Star, MessageCircle, Sparkles, Heart, Check, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { useSettings, waNumber } from '../lib/settings';
import { cText } from '../lib/content';
import { useFavorites } from '../lib/favorites';

const cur = (c) => c === 'DZD' ? 'DA' : '€';

// Paliers de gamme
const TIERS = {
  entree:     { label: 'Entrée de gamme', ar: 'اقتصادي',  en: 'Entry-level', cls: 'bg-white/[0.06] text-white/70 border-white/15' },
  medium:     { label: 'Médium',          ar: 'متوسط',     en: 'Mid-range',   cls: 'bg-gold-500/15 text-gold-400 border-gold-500/25' },
  premium:    { label: 'Premium',         ar: 'فاخر',      en: 'Premium',     cls: 'bg-gold-300/15 text-gold-200 border-gold-300/30' },
  entreprise: { label: 'Entreprise / Groupe', ar: 'شركات / مجموعات', en: 'Business / Group', cls: 'bg-white/10 text-white/80 border-white/20' },
};

// Composants inclus → icône
const INCLUSIONS = [
  { key: 'inc_car',       icon: Car,        label: 'Voiture',     ar: 'سيارة', en: 'Car' },
  { key: 'inc_apartment', icon: Building2,  label: 'Appartement', ar: 'شقة', en: 'Apartment' },
  { key: 'inc_villa',     icon: Home,       label: 'Villa',       ar: 'فيلا', en: 'Villa' },
  { key: 'inc_jetski',    icon: Waves,      label: 'Jet ski',     ar: 'جت سكي', en: 'Jet ski' },
  { key: 'inc_driver',    icon: UserCheck,  label: 'Chauffeur',   ar: 'سائق', en: 'Driver' },
];
const INC_DESC = {
  inc_car:       { fr: 'Livrée prête, sans caution', ar: 'تُسلَّم جاهزة، بدون ضمان', en: 'Delivered ready, no deposit' },
  inc_apartment: { fr: 'Équipé, bien situé', ar: 'مجهّزة وفي موقع جيد', en: 'Equipped, well located' },
  inc_villa:     { fr: 'Pour la famille ou un groupe', ar: 'للعائلة أو المجموعة', en: 'For family or groups' },
  inc_jetski:    { fr: 'Sensations sur la côte oranaise', ar: 'متعة على ساحل وهران', en: 'Thrills on the Oran coast' },
  inc_driver:    { fr: 'Aéroport, trajets, soirées', ar: 'المطار، التنقلات، السهرات', en: 'Airport, trips, evenings' },
};

// Composeur « Créez votre pack » : le client coche les briques → demande WhatsApp pré-remplie.
// PC : briques à gauche + récapitulatif collant à droite ; tablette : 3 colonnes ; téléphone : 2 colonnes + barre fixe.
function PackBuilder({ lang, whatsapp }) {
  const L = (fr, ar, en) => (lang === 'ar' ? ar : lang === 'en' ? en : fr);
  const [sel, setSel] = useState(['inc_car', 'inc_apartment']);
  const toggle = (k) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const name = (i) => (lang === 'ar' ? i.ar : lang === 'en' ? i.en : i.label);
  const chosen = INCLUSIONS.filter((i) => sel.includes(i.key));
  const msg = L(
    `Bonjour Fik Conciergerie, je voudrais un pack séjour à Oran avec : ${chosen.map(name).join(', ')}. Pouvez-vous me faire une proposition ?`,
    `مرحبا فيك كونسيرجري، أريد باقة إقامة في وهران تشمل: ${chosen.map(name).join('، ')}. هل يمكنكم تقديم عرض؟`,
    `Hello Fik Conciergerie, I'd like a stay pack in Oran with: ${chosen.map(name).join(', ')}. Could you send me an offer?`,
  );
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
  const Summary = ({ compact }) => (
    <>
      <div className="text-white/45 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">{L('Votre pack', 'باقتك', 'Your pack')}</div>
      {chosen.length === 0 ? (
        <p className="text-white/40 text-sm mb-5">{L('Choisissez au moins un élément.', 'اختر عنصراً واحداً على الأقل.', 'Pick at least one item.')}</p>
      ) : (
        <div className={`flex flex-wrap gap-2 ${compact ? 'mb-0' : 'mb-6'}`}>
          {chosen.map((i) => { const Icon = i.icon; return (
            <span key={i.key} className="inline-flex items-center gap-1.5 text-sm text-white bg-gold-500/10 border border-gold-500/30 rounded-full px-3 py-1.5"><Icon size={14} className="text-gold-400" />{name(i)}</span>
          ); })}
        </div>
      )}
    </>
  );
  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
      <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {INCLUSIONS.map((i) => {
          const Icon = i.icon; const on = sel.includes(i.key); const d = INC_DESC[i.key];
          return (
            <button key={i.key} type="button" onClick={() => toggle(i.key)} aria-pressed={on}
              className={`relative text-left rounded-3xl p-5 md:p-6 transition-all duration-300 ${on ? 'gold-frame shadow-[0_0_40px_rgba(226,182,20,0.12)]' : 'lux-card'}`}>
              <span className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} w-6 h-6 rounded-full border flex items-center justify-center transition-all ${on ? 'bg-gold-500 border-gold-500 text-black' : 'border-white/20 text-transparent'}`}><Check size={13} strokeWidth={3} /></span>
              <span className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${on ? 'bg-gold-500/20 text-gold-300' : 'bg-white/[0.05] text-white/50'}`}><Icon size={24} /></span>
              <span className="block font-display text-base sm:text-lg md:text-xl font-bold text-white mb-1">{name(i)}</span>
              <span className="block text-white/45 text-xs md:text-sm leading-snug">{lang === 'ar' ? d.ar : lang === 'en' ? d.en : d.fr}</span>
            </button>
          );
        })}
        <Link href="/entreprises" className="lux-card rounded-3xl p-5 md:p-6 flex flex-col justify-between group">
          <span className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.05] text-white/50 flex items-center justify-center mb-4 group-hover:text-gold-300 transition-colors"><Briefcase size={24} /></span>
          <span>
            <span className="block font-display text-lg md:text-xl font-bold text-white mb-1">{L('Entreprise ?', 'شركة؟', 'Company?')}</span>
            <span className="inline-flex items-center gap-1 text-gold-400 text-xs md:text-sm">{L('Nos packs pro', 'باقات الشركات', 'Corporate packs')} <ArrowRight size={13} /></span>
          </span>
        </Link>
      </div>
      {/* Récapitulatif : collant sur PC, carte sur tablette */}
      <aside className="hidden md:block lg:col-span-4 lg:sticky lg:top-28 gold-frame rounded-3xl p-7">
        <Summary />
        <a href={href} target="_blank" rel="noopener noreferrer" aria-disabled={chosen.length === 0}
          className={`btn-gold w-full py-4 text-sm justify-center ${chosen.length === 0 ? 'pointer-events-none opacity-40' : ''}`}><MessageCircle size={16} />{L('Demander mon pack', 'اطلب باقتي', 'Request my pack')}</a>
        <p className="text-white/35 text-xs text-center mt-4 leading-relaxed">{L('Prix sur mesure selon vos dates et la durée. Réponse rapide sur WhatsApp.', 'سعر حسب تواريخك والمدة. ردّ سريع على واتساب.', 'Tailored price based on your dates and length of stay. Quick reply on WhatsApp.')}</p>
      </aside>
      {/* Téléphone : barre fixe en bas */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b0b0b]/95 backdrop-blur-xl border-t border-gold-500/20 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-white/45 text-[10px] uppercase tracking-[0.2em]">{L('Votre pack', 'باقتك', 'Your pack')}</div>
          <div className="text-white text-sm font-semibold truncate">{chosen.length ? chosen.map(name).join(' + ') : '—'}</div>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" className={`btn-gold px-5 py-3 text-sm flex-shrink-0 ${chosen.length === 0 ? 'pointer-events-none opacity-40' : ''}`}><MessageCircle size={15} />{L('Demander', 'اطلب', 'Request')}</a>
      </div>
    </div>
  );
}

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
  const titleTr = useTranslated(p.title || '');
  const taglineTr = useTranslated(p.tagline || '');
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
    <div className="group lux-card flex flex-col">
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
          <h3 className="text-white font-bold text-xl leading-tight mb-1">{titleTr || p.title}</h3>
          {p.tagline && <p className="text-white/45 text-xs leading-snug line-clamp-1">{taglineTr || p.tagline}</p>}
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
  const settings = useSettings();
  const WHATSAPP = waNumber(settings);
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
        <div className="relative pt-32 pb-12 lg:pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="section-badge mb-6">
              <Sparkles size={11} /> {cText(settings, 'packs_badge', lang, lang === 'ar' ? 'باقات كل شيء في واحد' : lang === 'en' ? 'All-in-one packs' : 'Packs tout-en-un')}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">
              {cText(settings, 'packs_title_a', lang, lang === 'ar' ? 'باقات' : lang === 'en' ? 'Our' : 'Nos')} <span className="text-gold-gradient italic">{cText(settings, 'packs_title_b', lang, lang === 'ar' ? 'الإقامة' : lang === 'en' ? 'stay packs' : 'Packs séjour')}</span>
            </h1>
            <p className="text-white/55 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              {cText(settings, 'packs_sub', lang, lang === 'ar'
                ? 'سيارة + سكن + جت سكي + سائق. كل شيء في باقة واحدة، حسب ميزانيتك.'
                : lang === 'en'
                  ? 'Car, accommodation, jet ski, driver — all in one pack, from a smart getaway to tailor-made for companies.'
                  : 'Voiture, immobilier, jet ski, chauffeur — tout réuni en un seul pack, du séjour malin au sur-mesure entreprise.')}
            </p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">
            {hasPacks ? (
              <>
                {/* Filters */}
                <div className="sticky top-20 z-30 glass rounded-2xl p-3 md:p-4 mb-8 flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="relative md:w-72 flex-shrink-0">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث...' : lang === 'en' ? 'Search a pack...' : 'Rechercher un pack...'} className="w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={13} /></button>}
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {tierKeys.map(k => (
                      <button key={k} onClick={() => setTier(k)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${tier === k ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>
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
              /* Aucun pack publié → composeur sur mesure */
              <div className="pb-24 md:pb-0">
                <div className="text-center mb-10">
                  <div className="section-badge mb-4">{lang === 'ar' ? 'على المقاس' : lang === 'en' ? 'Made to measure' : 'Sur mesure'}</div>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-white">{lang === 'ar' ? 'اصنع ' : lang === 'en' ? 'Build ' : 'Composez '}<span className="text-gold-gradient">{lang === 'ar' ? 'باقتك' : lang === 'en' ? 'your pack' : 'votre pack'}</span></h2>
                  <p className="text-white/45 mt-4 max-w-lg mx-auto">{lang === 'ar' ? 'اختر ما تحتاجه، ونحضّر لك عرضاً كاملاً.' : lang === 'en' ? 'Pick what you need, we prepare a complete offer for you.' : 'Cochez ce dont vous avez besoin, on vous prépare une offre complète.'}</p>
                </div>
                <PackBuilder lang={lang} whatsapp={WHATSAPP} />
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
