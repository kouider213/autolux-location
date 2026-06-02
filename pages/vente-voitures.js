import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Tag, Fuel, Gauge, Calendar, MapPin, Search, X, ArrowRight, Star, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';

const WHATSAPP = '32466311469';

const STATUS_BADGE = {
  disponible:  { label: '● Disponible', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25' },
  reserve:     { label: 'Réservé',      cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  vendu:       { label: 'Vendu',        cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  coming_soon: { label: 'Bientôt',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

const cur = (c) => c === 'DZD' ? 'DA' : '€';

function VehicleCard({ v }) {
  const photos = (v.vehicle_sale_photos || []).sort((a, b) => a.position - b.position).map(p => p.url);
  if (v.image_url && !photos.includes(v.image_url)) photos.unshift(v.image_url);
  const photo = photos[0];
  const available = v.status === 'disponible';
  const st = STATUS_BADGE[v.status] || STATUS_BADGE.disponible;

  return (
    <div className="group relative bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/25 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.7)] transition-all duration-500">
      <Link href={`/vente-voitures/${v.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {photo ? (
          <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center"><Tag size={36} className="text-white/[0.06]" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {v.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950 flex items-center gap-1"><Star size={10} className="fill-current" /> EN AVANT</span>}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ml-auto ${st.cls}`}>{st.label}</span>
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
      </Link>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-black text-2xl text-gold-400 leading-none tabular-nums">{v.price ? Number(v.price).toLocaleString() : '—'}</span>
          {v.price && <span className="text-gold-500/50 text-sm">{cur(v.currency)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/vente-voitures/${v.id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/30 hover:text-white transition-all"><ArrowRight size={14} /></Link>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le véhicule à vendre : ${v.brand} ${v.model}${v.year ? ' (' + v.year + ')' : ''}. Est-il toujours disponible ?`)}`}
            target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-[0_4px_16px_rgba(226,182,20,0.3)] transition-all">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

export default function VenteVoituresPage({ vehicles }) {
  const { t } = useLang();
  const [search, setSearch]   = useState('');
  const [fuel, setFuel]       = useState('Tous');
  const hasListings = vehicles && vehicles.length > 0;

  const filtered = (vehicles || []).filter(v => {
    const txt = `${v.brand} ${v.model} ${v.city || ''}`.toLowerCase();
    const matchSearch = txt.includes(search.toLowerCase());
    const matchFuel = fuel === 'Tous' || v.fuel === fuel;
    return matchSearch && matchFuel;
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
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Tag size={11} /> {t('sale.badge')}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-5">
              {t('sale.title1')} <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">{t('sale.title2')}</span>
            </h1>
            <p className="text-white/35 max-w-lg mx-auto text-base leading-relaxed">
              {t('sale.subtitle')}
            </p>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-7xl mx-auto">

            {/* Propose your vehicle CTA */}
            <div className="mb-8 bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gold-500/15 border border-gold-500/25 rounded-xl flex items-center justify-center flex-shrink-0"><Tag size={18} className="text-gold-400" /></div>
                <div>
                  <p className="text-white font-bold text-sm">{t('sale.sell_title')}</p>
                  <p className="text-white/40 text-xs">{t('sale.sell_desc')}</p>
                </div>
              </div>
              <a href={`https://wa.me/${WHATSAPP}?text=${proposeMsg}`} target="_blank" rel="noopener noreferrer" className="btn-gold py-2.5 px-6 text-sm whitespace-nowrap flex items-center gap-2"><MessageCircle size={14} /> {t('sale.sell_cta')}</a>
            </div>

            {hasListings ? (
              <>
                {/* Filters */}
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 mb-8 space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (marque, modèle, ville)..." className="w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={13} /></button>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Tous', 'essence', 'diesel', 'hybride', 'électrique'].map(f => (
                      <button key={f} onClick={() => setFuel(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${fuel === f ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-6">{filtered.length} véhicule{filtered.length !== 1 ? 's' : ''}</p>

                {filtered.length === 0 ? (
                  <div className="text-center py-24"><Search size={22} className="text-white/15 mx-auto mb-4" /><p className="text-white/35">Aucun véhicule ne correspond.</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
                  </div>
                )}
              </>
            ) : (
              /* Coming soon */
              <div className="text-center py-20 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-7"><Tag size={32} className="text-gold-400" /></div>
                <h2 className="font-display text-3xl font-bold text-white mb-3">{t('sale.soon_title')}</h2>
                <p className="text-white/40 leading-relaxed mb-8">{t('sale.soon_desc')}</p>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Bonjour, je suis intéressé(e) par vos véhicules à vendre.')}`} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2"><MessageCircle size={15} /> {t('common.contact_wa')}</a>
              </div>
            )}
          </div>
        </div>
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
