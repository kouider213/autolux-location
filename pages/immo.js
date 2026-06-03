import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import {
  Building2, MapPin, Maximize, BedDouble, Bath, Search, X, ArrowRight,
  Star, MessageCircle, Home, Key, TrendingUp, Megaphone, Briefcase, Calculator,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';

const cur = (c) => c === 'DZD' ? 'DA' : '€';

const STATUS_BADGE = {
  disponible:  { label: '● Disponible', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25' },
  loue:        { label: 'Loué',         cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  vendu:       { label: 'Vendu',        cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  coming_soon: { label: 'Bientôt',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

function PropertyCard({ property: p }) {
  const { t } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const photos = (p.property_photos || []).sort((a, b) => a.position - b.position).map(ph => ph.url);
  const photo = photos[0];
  const available = (p.status || 'disponible') === 'disponible';
  const STB = { disponible: t('b.available'), loue: t('b.rented'), vendu: t('b.sold'), coming_soon: t('b.soon') };
  const st = STATUS_BADGE[p.status] || STATUS_BADGE.disponible;
  const stLabel = STB[p.status] || STB.disponible;
  const isSale = (p.transaction || 'location') === 'vente';

  const waMsg = encodeURIComponent(`${t('wa.interested_property')} ${p.title}${p.price ? ' (' + Number(p.price).toLocaleString() + ' ' + cur(p.currency) + ')' : ''}. ${t('wa.more_info')}`);

  return (
    <div className="group relative bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/25 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.7)] transition-all duration-500">
      <Link href={`/immo/${p.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {photo ? (
          <img src={photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center"><Building2 size={36} className="text-white/[0.06]" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md w-fit ${isSale ? 'bg-purple-500/20 text-purple-300 border-purple-500/25' : 'bg-blue-500/20 text-blue-300 border-blue-500/25'}`}>{isSale ? t('b.forsale') : t('b.forrent')}</span>
            {p.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950 flex items-center gap-1 w-fit"><Star size={9} className="fill-current" /> {t('b.featured')}</span>}
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${st.cls}`}>{stLabel}</span>
        </div>
        {!available && <div className="absolute inset-0 bg-[#0a0a0a]/55 backdrop-blur-[2px]" />}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white font-bold text-base leading-tight mb-1.5 line-clamp-1">{p.title}</h3>
          <p className="flex items-center gap-1 text-white/40 text-xs mb-2"><MapPin size={10} />{p.district ? `${p.district}, ` : ''}{p.city}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {p.surface && <span className="flex items-center gap-1 text-white/35 text-xs"><Maximize size={10} /> {p.surface}m²</span>}
            {(p.bedrooms || p.rooms) && <span className="flex items-center gap-1 text-white/35 text-xs"><BedDouble size={10} /> {p.bedrooms || p.rooms}</span>}
            {p.bathrooms && <span className="flex items-center gap-1 text-white/35 text-xs"><Bath size={10} /> {p.bathrooms}</span>}
          </div>
        </div>
      </Link>
      <div className="p-4 flex items-center justify-between">
        <div>
          {p.price ? (
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-xl text-gold-400 leading-none tabular-nums">{Number(p.price).toLocaleString()}</span>
              <span className="text-gold-500/50 text-sm">{cur(p.currency)}</span>
              {!isSale && <span className="text-white/25 text-[10px]">{t('b.per_month')}</span>}
            </div>
          ) : <span className="text-white/30 text-sm">{t('b.price_request')}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/immo/${p.id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all"><ArrowRight size={14} /></Link>
          <a href={`https://wa.me/${WHATSAPP}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_16px_rgba(226,182,20,0.3)] transition-all">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

const OWNER_OFFERS = [
  { icon: Home,       tk: 'immo.o1_t', dk: 'immo.o1_d' },
  { icon: Megaphone,  tk: 'immo.o2_t', dk: 'immo.o2_d' },
  { icon: Briefcase,  tk: 'immo.o3_t', dk: 'immo.o3_d' },
  { icon: Calculator, tk: 'immo.o4_t', dk: 'immo.o4_d' },
];

export default function ImmoPage({ properties }) {
  const WHATSAPP = waNumber(useSettings());
  const { t } = useLang();
  const [search, setSearch]   = useState('');
  const [txn, setTxn]         = useState('Tous');   // Tous | location | vente
  const [type, setType]       = useState('Tous');
  const hasListings = properties && properties.length > 0;

  const types = ['Tous', ...Array.from(new Set((properties || []).map(p => p.type).filter(Boolean)))];

  const filtered = (properties || []).filter(p => {
    const txt = `${p.title} ${p.city || ''} ${p.district || ''}`.toLowerCase();
    const matchSearch = txt.includes(search.toLowerCase());
    const matchTxn = txn === 'Tous' || (p.transaction || 'location') === txn;
    const matchType = type === 'Tous' || p.type === type;
    return matchSearch && matchTxn && matchType;
  });

  const ownerMsg = encodeURIComponent("Bonjour Fik Conciergerie, je suis propriétaire et je souhaite mettre mon bien en location ou en vente via vous. Pouvez-vous m'expliquer les offres ?");
  const estimateMsg = encodeURIComponent("Bonjour, je souhaite une estimation gratuite de mon bien (location ou vente). Voici les détails : (type, surface, quartier).");

  return (
    <>
      <Head>
        <title>Immobilier — Location & Vente à Oran — Fik Conciergerie</title>
        <meta name="description" content="Biens immobiliers à louer et à vendre à Oran. Appartements, villas, locaux. Propriétaires : confiez-nous votre bien." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 right-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"><Building2 size={11} /> {t('immo.badge')}</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">{t('immo.title1')} <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">{t('immo.title2')}</span></h1>
            <p className="text-white/35 max-w-lg mx-auto text-base leading-relaxed">{t('immo.subtitle')}</p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">

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
                    {[{ k: 'Tous', l: t('immo.f_all') }, { k: 'location', l: t('immo.f_rent') }, { k: 'vente', l: t('immo.f_sale') }].map(f => (
                      <button key={f.k} onClick={() => setTxn(f.k)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${txn === f.k ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>{f.l}</button>
                    ))}
                    <div className="w-px bg-white/[0.08] mx-1" />
                    {types.map(ty => (
                      <button key={ty} onClick={() => setType(ty)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${type === ty ? 'bg-white/[0.12] text-white border border-white/15' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>{ty === 'Tous' ? t('immo.f_all') : ty}</button>
                    ))}
                  </div>
                </div>

                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">{filtered.length} {t('immo.count')}</p>

                {filtered.length === 0 ? (
                  <div className="text-center py-24"><Search size={22} className="text-white/15 mx-auto mb-4" /><p className="text-white/35">{t('immo.none')}</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 max-w-lg mx-auto mb-8">
                <div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-7"><Building2 size={32} className="text-gold-400" /></div>
                <h2 className="font-display text-3xl font-bold text-white mb-3">{t('immo.cs_t')}</h2>
                <p className="text-white/40 leading-relaxed mb-8">{t('immo.cs_d')}</p>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t('immo.cs_wa'))}`} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"><MessageCircle size={15} /> {t('immo.contact')}</a>
              </div>
            )}

            {/* ── ESPACE PROPRIÉTAIRES ── */}
            <section className="mt-20 pt-16 border-t border-white/[0.06]">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5"><Key size={11} /> {t('immo.owners_badge')}</div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{t('immo.owners_title1')} <span className="text-gold-gradient italic">{t('immo.owners_title2')}</span></h2>
                <p className="text-white/35 max-w-xl mx-auto">{t('immo.owners_desc')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {OWNER_OFFERS.map((o, i) => (
                  <div key={i} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 hover:border-gold-500/20 transition-all group">
                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><o.icon size={20} className="text-gold-400" /></div>
                    <h3 className="text-white font-bold text-base mb-2">{t(o.tk)}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{t(o.dk)}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-b from-[#141414] to-[#111] border border-white/[0.07] rounded-3xl p-8 text-center max-w-2xl mx-auto">
                <TrendingUp size={28} className="text-gold-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">{t('immo.estimate_title')}</h3>
                <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">{t('immo.estimate_desc')}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={`https://wa.me/${WHATSAPP}?text=${ownerMsg}`} target="_blank" rel="noopener noreferrer" className="btn-gold px-7 py-3.5 text-sm justify-center"><Briefcase size={15} /> {t('immo.propose')}</a>
                  <a href={`https://wa.me/${WHATSAPP}?text=${estimateMsg}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-7 py-3.5 text-sm justify-center"><Calculator size={15} /> {t('immo.estimate')}</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { properties: [] }, revalidate: 30 };
    const { data } = await supabase.from('properties')
      .select('*, property_photos(url, position)')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    return { props: { properties: data || [] }, revalidate: 30 };
  } catch {
    return { props: { properties: [] }, revalidate: 30 };
  }
}
