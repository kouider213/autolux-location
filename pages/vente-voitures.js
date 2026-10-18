import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Tag, Fuel, Gauge, Calendar, MapPin, Search, X, ArrowRight, Star, MessageCircle, Heart, Camera, HeartHandshake, Megaphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import { useFavorites } from '../lib/favorites';

const STATUS_BADGE = {
  disponible:  { label: '● Disponible', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25' },
  reserve:     { label: 'Réservé',      cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  vendu:       { label: 'Vendu',        cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  coming_soon: { label: 'Bientôt',      cls: 'bg-gold-500/15 text-gold-300 border-gold-500/25' },
};

const cur = (c) => c === 'DZD' ? 'DA' : '€';

// Aucune annonce publiée → deux parcours : « Je cherche » (recherche sur mesure → WhatsApp) et « Je vends » (3 étapes).
// PC : côte à côte ; tablette/téléphone : empilés.
function SaleEmpty({ lang, whatsapp, proposeMsg }) {
  const L = (fr, ar, en) => (lang === 'ar' ? ar : lang === 'en' ? en : fr);
  const [model, setModel] = useState('');
  const [budget, setBudget] = useState('');
  const [fuel, setFuel] = useState('');
  const FUELS = [['essence', L('Essence', 'بنزين', 'Petrol')], ['diesel', L('Diesel', 'ديزل', 'Diesel')], ['hybride', L('Hybride', 'هجين', 'Hybrid')]];
  const msg = L(
    `Bonjour Fik Conciergerie, je cherche une voiture à acheter${model ? ` : ${model}` : ''}${fuel ? `, ${fuel}` : ''}${budget ? `, budget max ${budget}` : ''}. Pouvez-vous m'aider à la trouver ?`,
    `مرحبا فيك كونسيرجري، أبحث عن سيارة للشراء${model ? `: ${model}` : ''}${fuel ? `، ${fuel}` : ''}${budget ? `، الميزانية القصوى ${budget}` : ''}. هل يمكنكم مساعدتي؟`,
    `Hello Fik Conciergerie, I'm looking to buy a car${model ? `: ${model}` : ''}${fuel ? `, ${fuel}` : ''}${budget ? `, max budget ${budget}` : ''}. Can you help me find it?`,
  );
  const STEPS = [
    { icon: Camera, h: L('Envoyez les infos', 'أرسل المعلومات', 'Send the details'), p: L('Photos, modèle, année, kilométrage et prix souhaité.', 'صور، الطراز، السنة، الكيلومترات والسعر.', 'Photos, model, year, mileage and asking price.') },
    { icon: Megaphone, h: L('On publie et on diffuse', 'ننشر ونروّج', 'We publish & promote'), p: L('Annonce soignée sur le site et nos réseaux.', 'إعلان احترافي على الموقع وشبكاتنا.', 'Polished listing on our site and social media.') },
    { icon: HeartHandshake, h: L('On gère les acheteurs', 'نتكفّل بالمشترين', 'We handle buyers'), p: L('Appels, visites, négociation : vous ne recevez que les sérieux.', 'المكالمات، المعاينات، التفاوض: لا يصلك إلا الجادّون.', 'Calls, viewings, negotiation: only serious buyers reach you.') },
  ];
  return (
    <div className="grid lg:grid-cols-2 gap-5 lg:gap-8">
      {/* Je cherche */}
      <div className="gold-frame rounded-3xl p-6 md:p-9 flex flex-col">
        <div className="text-gold-400 text-[11px] font-semibold uppercase tracking-[0.25em] mb-3">{L('Acheteur', 'مشترٍ', 'Buyer')}</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{L('Je cherche ', 'أبحث عن ', "I'm looking for ")}<span className="text-gold-gradient">{L('une voiture', 'سيارة', 'a car')}</span></h2>
        <p className="text-white/50 text-sm md:text-base mb-7">{L('Dites-nous ce que vous voulez, on la trouve pour vous à Oran.', 'قل لنا ما تريد، ونجدها لك في وهران.', 'Tell us what you want, we find it for you in Oran.')}</p>
        <div className="space-y-3 flex-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={L('Marque / modèle (ex. Clio 5)', 'العلامة / الطراز', 'Make / model (e.g. Clio 5)')} className="input-dark w-full" />
            <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={L('Budget max (€ ou DA)', 'الميزانية القصوى', 'Max budget (€ or DA)')} className="input-dark w-full" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {FUELS.map(([k, lbl]) => (
              <button key={k} type="button" onClick={() => setFuel(fuel === k ? '' : k)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${fuel === k ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.08] text-white/55 hover:text-white'}`}>{lbl}</button>
            ))}
          </div>
        </div>
        <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="btn-gold w-full py-4 text-sm justify-center mt-7"><Search size={16} />{L('Lancer ma recherche', 'ابدأ البحث', 'Start my search')}</a>
      </div>
      {/* Je vends */}
      <div className="lux-card p-6 md:p-9 flex flex-col">
        <div className="text-white/45 text-[11px] font-semibold uppercase tracking-[0.25em] mb-3">{L('Vendeur', 'بائع', 'Seller')}</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{L('Je vends ', 'أبيع ', "I'm selling ")}<span className="text-gold-gradient">{L('ma voiture', 'سيارتي', 'my car')}</span></h2>
        <p className="text-white/50 text-sm md:text-base mb-7">{L('Confiez-nous la vente, on s’occupe de tout.', 'اترك لنا البيع، ونتكفّل بكل شيء.', 'Leave the sale to us, we handle everything.')}</p>
        <ol className="space-y-4 flex-1">
          {STEPS.map((st, i) => { const Icon = st.icon; return (
            <li key={i} className="flex items-start gap-4">
              <span className="relative w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gold-400 flex-shrink-0"><Icon size={18} />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold flex items-center justify-center">{i + 1}</span></span>
              <span><span className="block text-white font-semibold">{st.h}</span><span className="block text-white/50 text-sm leading-relaxed">{st.p}</span></span>
            </li>
          ); })}
        </ol>
        <a href={`https://wa.me/${whatsapp}?text=${proposeMsg}`} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full py-4 text-sm justify-center mt-7"><MessageCircle size={16} />{L('Proposer mon véhicule', 'اعرض سيارتي', 'List my vehicle')}</a>
      </div>
    </div>
  );
}

function VehicleCard({ v }) {
  const { t } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const { isFav, toggle } = useFavorites();
  const photos = (v.vehicle_sale_photos || []).sort((a, b) => a.position - b.position).map(p => p.url);
  if (v.image_url && !photos.includes(v.image_url)) photos.unshift(v.image_url);
  const photo = photos[0];
  const available = v.status === 'disponible';
  const STB = { disponible: '● ' + t('b.available'), reserve: t('b.reserved'), vendu: t('b.sold'), coming_soon: t('b.soon') };
  const st = STATUS_BADGE[v.status] || STATUS_BADGE.disponible;
  const stLabel = STB[v.status] || STB.disponible;

  return (
    <div className="group lux-card">
      <Link href={`/vente-voitures/${v.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {photo ? (
          <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center"><Tag size={36} className="text-white/[0.06]" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {v.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950 flex items-center gap-1"><Star size={10} className="fill-current" /> {t('b.featured')}</span>}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ml-auto ${st.cls}`}>{stLabel}</span>
        </div>
        {!available && <div className="absolute inset-0 bg-[#0a0a0a]/55 backdrop-blur-[2px]" />}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1.5">{v.brand} {v.model}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {v.year && <span className="flex items-center gap-1 text-white/35 text-xs"><Calendar size={10} /> {v.year}</span>}
            {v.mileage != null && <span className="flex items-center gap-1 text-white/35 text-xs"><Gauge size={10} /> {Number(v.mileage).toLocaleString()} km</span>}
            {v.fuel && <span className="flex items-center gap-1 text-white/35 text-xs"><Fuel size={10} /> {v.fuel}</span>}
          </div>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(v.id, 'vente'); }}
          aria-label="Favori"
          className={`absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${isFav(v.id, 'vente') ? 'bg-red-500/90 border-red-400 text-white' : 'bg-black/40 border-white/20 text-white/70 hover:text-white backdrop-blur-md'}`}>
          <Heart size={15} className={isFav(v.id, 'vente') ? 'fill-current' : ''} />
        </button>
      </Link>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-black text-2xl text-gold-400 leading-none tabular-nums">{v.price ? Number(v.price).toLocaleString() : '—'}</span>
          {v.price && <span className="text-gold-500/50 text-sm">{cur(v.currency)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/vente-voitures/${v.id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all"><ArrowRight size={14} /></Link>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`${t('wa.interested_vehicle')} ${v.brand} ${v.model}${v.year ? ' (' + v.year + ')' : ''}. ${t('wa.still_available')}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_16px_rgba(226,182,20,0.3)] transition-all">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

export default function VenteVoituresPage({ vehicles }) {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [search, setSearch]   = useState('');
  const [fuel, setFuel]       = useState('Tous');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort]       = useState('recent'); // recent | price_asc | price_desc | year_desc
  const hasListings = vehicles && vehicles.length > 0;

  const filtered = (vehicles || []).filter(v => {
    const txt = `${v.brand} ${v.model} ${v.city || ''}`.toLowerCase();
    const matchSearch = txt.includes(search.toLowerCase());
    const matchFuel = fuel === 'Tous' || v.fuel === fuel;
    const pr = Number(v.price) || 0;
    const matchMin = !priceMin || pr >= Number(priceMin);
    const matchMax = !priceMax || (pr > 0 && pr <= Number(priceMax));
    return matchSearch && matchFuel && matchMin && matchMax;
  }).sort((a, b) => {
    if (sort === 'price_asc')  return (Number(a.price) || Infinity) - (Number(b.price) || Infinity);
    if (sort === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (sort === 'year_desc')  return (Number(b.year) || 0) - (Number(a.year) || 0);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const proposeMsg = encodeURIComponent("Bonjour Fik Conciergerie, je souhaite proposer mon véhicule à la vente via vous. Voici les détails : (marque, modèle, année, kilométrage, prix souhaité).");

  return (
    <>
      <Head>
        <title>Véhicules à vendre — Fik Conciergerie Oran</title>
        <meta name="description" content="Véhicules d'occasion à vendre à Oran. Voitures vérifiées. Achetez ou proposez votre véhicule via Fik Conciergerie." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="section-badge mb-6">
              <Tag size={11} /> {t('sale.badge')}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">
              {t('sale.title1')} <span className="text-gold-gradient italic">{t('sale.title2')}</span>
            </h1>
            <p className="text-white/55 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
              {t('sale.subtitle')}
            </p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">

            {/* Propose your vehicle CTA (le composant « Je vends » le remplace quand il n'y a pas d'annonce) */}
            {hasListings && <div className="mb-8 bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gold-500/15 border border-gold-500/25 rounded-xl flex items-center justify-center flex-shrink-0"><Tag size={18} className="text-gold-400" /></div>
                <div>
                  <p className="text-white font-bold text-sm">{t('sale.sell_title')}</p>
                  <p className="text-white/40 text-xs">{t('sale.sell_desc')}</p>
                </div>
              </div>
              <a href={`https://wa.me/${WHATSAPP}?text=${proposeMsg}`} target="_blank" rel="noopener noreferrer" className="btn-gold py-2.5 px-6 text-sm whitespace-nowrap flex items-center gap-2"><MessageCircle size={14} /> {t('sale.sell_cta')}</a>
            </div>}

            {hasListings ? (
              <>
                {/* Filters */}
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 mb-8 space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={13} /></button>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Tous', 'essence', 'diesel', 'hybride', 'électrique'].map(f => (
                      <button key={f} onClick={() => setFuel(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${fuel === f ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>{f === 'Tous' ? t('common.all') : f}</button>
                    ))}
                  </div>
                  {/* Prix + tri */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <input value={priceMin} onChange={e => setPriceMin(e.target.value)} type="number" inputMode="numeric" placeholder={t('common.price_min')} className="w-28 bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none" />
                    <input value={priceMax} onChange={e => setPriceMax(e.target.value)} type="number" inputMode="numeric" placeholder={t('common.price_max')} className="w-28 bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none" />
                    <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white/80 text-sm outline-none ml-auto">
                      <option value="recent" className="bg-[#111]">{t('common.sort_recent')}</option>
                      <option value="price_asc" className="bg-[#111]">{t('common.sort_price_asc')}</option>
                      <option value="price_desc" className="bg-[#111]">{t('common.sort_price_desc')}</option>
                      <option value="year_desc" className="bg-[#111]">{t('common.sort_year')}</option>
                    </select>
                    {(priceMin || priceMax) && (
                      <button onClick={() => { setPriceMin(''); setPriceMax(''); }} className="text-white/40 hover:text-white text-xs px-3 py-2.5 border border-white/[0.07] rounded-xl">{t('common.reset_short')}</button>
                    )}
                  </div>
                </div>

                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">{filtered.length} {t('sale.count')}</p>

                {filtered.length === 0 ? (
                  <div className="text-center py-24"><Search size={22} className="text-white/15 mx-auto mb-4" /><p className="text-white/35">{t('sale.none')}</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
                  </div>
                )}
              </>
            ) : (
              <SaleEmpty lang={lang} whatsapp={WHATSAPP} proposeMsg={proposeMsg} />
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
    if (!supabase) return { props: { vehicles: [] }, revalidate: 30 };
    const { data } = await supabase
      .from('vehicles_for_sale')
      .select('*, vehicle_sale_photos(url, position)')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    return { props: { vehicles: data || [] }, revalidate: 30 };
  } catch {
    return { props: { vehicles: [] }, revalidate: 30 };
  }
}
