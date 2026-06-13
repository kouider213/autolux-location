import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Package, Car, Building2, Home, Waves, UserCheck, ArrowLeft, MessageCircle, Check, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShareButtons from '../../components/ShareButtons';
import LeadCapture from '../../components/LeadCapture';
import Lightbox from '../../components/Lightbox';
import { trackPageView } from '../../lib/tracker';
import { useLang } from '../../lib/i18n';
import { useTranslated } from '../../lib/autoTranslate';
import { useSettings, waNumber } from '../../lib/settings';

const cur = (c) => c === 'DZD' ? 'DA' : '€';

const TIERS = {
  entree:     { label: 'Entrée de gamme', ar: 'اقتصادي',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  medium:     { label: 'Médium',          ar: 'متوسط',     cls: 'bg-gold-500/15 text-gold-400 border-gold-500/25' },
  premium:    { label: 'Premium',         ar: 'فاخر',      cls: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  entreprise: { label: 'Entreprise / Groupe', ar: 'شركات / مجموعات', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

const INCLUSIONS = [
  { key: 'inc_car',       icon: Car,       label: 'Voiture',     ar: 'سيارة' },
  { key: 'inc_apartment', icon: Building2, label: 'Appartement', ar: 'شقة' },
  { key: 'inc_villa',     icon: Home,      label: 'Villa',       ar: 'فيلا' },
  { key: 'inc_jetski',    icon: Waves,     label: 'Jet ski',     ar: 'جت سكي' },
  { key: 'inc_driver',    icon: UserCheck, label: 'Chauffeur',   ar: 'سائق' },
];

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

export default function PackDetail({ pack, photos: initialPhotos }) {
  const { lang } = useLang();
  const descTr = useTranslated(pack?.description || '');
  const taglineTr = useTranslated(pack?.tagline || '');
  const WHATSAPP = waNumber(useSettings());
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState(false);

  useEffect(() => {
    if (pack?.id) {
      trackPageView(`/packs/${pack.id}`, null);
      const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      client.from('pack_photos').select('url, position').eq('pack_id', pack.id).order('position')
        .then(({ data }) => { if (data?.length) setPhotos(data.map(p => p.url)); });
    }
  }, [pack?.id]);

  if (!pack) {
    return (
      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-2">{lang === 'ar' ? 'الباقة غير موجودة' : lang === 'en' ? 'Pack not found' : 'Pack introuvable'}</p>
            <Link href="/packs" className="text-gold-500 hover:text-gold-400 text-sm">← {lang === 'ar' ? 'كل الباقات' : lang === 'en' ? 'All packs' : 'Tous les packs'}</Link>
          </div>
        </div>
      </div>
    );
  }

  const allPhotos = photos.length > 0 ? photos : (pack.image_url ? [pack.image_url] : []);
  const src = allPhotos[active] || null;
  const tier = TIERS[pack.tier] || TIERS.entree;
  const incs = INCLUSIONS.filter(i => pack[i.key]);
  const features = pack.features || [];
  const available = packAvailable(pack);

  const waMsg = encodeURIComponent(
    lang === 'ar'
      ? `مرحبا فيك كونسيرجري،\n\nأنا مهتم بـ "${pack.title}".\n${priceLabel(pack, lang)}\n\nهل يمكن إعطائي التفاصيل والتوفر؟`
      : `Bonjour Fik Conciergerie,\n\nJe suis intéressé(e) par le "${pack.title}".\n${priceLabel(pack, 'fr')}\n\nPouvez-vous me donner les détails et les disponibilités ?`
  );
  const waUrl = `https://wa.me/${WHATSAPP}?text=${waMsg}`;

  return (
    <>
      <Head>
        <title>{pack.title} — Pack séjour — Fik Conciergerie Oran</title>
        <meta name="description" content={`${pack.title} — ${pack.tagline || 'Pack séjour tout-en-un à Oran'}. ${priceLabel(pack, 'fr')}.`} />
        {(allPhotos[0] || pack.image_url) && <meta property="og:image" key="og-image" content={allPhotos[0] || pack.image_url} />}
        <meta property="og:title" content={`${pack.title} — Pack séjour`} />
        <meta property="og:description" content={`${pack.tagline || ''} · Fik Conciergerie Oran`} />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Sticky CTA mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs">{lang === 'ar' ? 'السعر' : lang === 'en' ? 'From' : 'À partir de'}</p>
            <p className="font-display font-black text-gold-400 text-xl leading-none tabular-nums">{priceLabel(pack, lang)}</p>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-gold py-3 px-6 text-sm flex-1 justify-center max-w-[200px]"><MessageCircle size={15} /> {lang === 'ar' ? 'واتساب' : 'WhatsApp'}</a>
        </div>

        <div className="pt-24 pb-0 px-5 max-w-6xl mx-auto">
          <Link href="/packs" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> {lang === 'ar' ? 'كل الباقات' : lang === 'en' ? 'All packs' : 'Tous les packs'}
          </Link>
        </div>

        <div className="px-5 pb-36 md:pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06]" style={{ aspectRatio: '16/10' }}>
                {src ? (
                  /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src)
                    ? <video src={src} controls playsInline className="w-full h-full object-cover bg-black" />
                    : <img src={src} alt={pack.title} onClick={() => setLb(true)} className="w-full h-full object-cover cursor-zoom-in" loading="eager" />
                ) : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]"><Package size={56} className="text-white/[0.07]" /></div>}
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg border ${tier.cls}`}>{lang === 'ar' ? tier.ar : tier.label}</span>
                {pack.featured && <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-lg bg-gold-500 text-noir-950">{lang === 'ar' ? 'مميز' : lang === 'en' ? 'Popular' : 'Populaire'}</span>}
              </div>
              {allPhotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((s, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-gold-500' : 'border-white/[0.06] opacity-60 hover:opacity-100'}`}>
                      {/\.(mp4|webm|mov|m4v)(\?|$)/i.test(s)
                        ? <><video src={s} muted className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center text-white text-lg">▶</span></>
                        : <img src={s} alt={`${pack.title} ${i + 1}`} className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-2">{lang === 'ar' ? 'باقة إقامة' : lang === 'en' ? 'Stay pack' : 'Pack séjour'} · Oran</p>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{pack.title}</h1>
                {pack.tagline && <p className="text-white/50 text-base mb-3 leading-relaxed">{pack.tagline}</p>}
                <div className="mb-4"><ShareButtons title={pack.title} /></div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-gold-gradient leading-none" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{priceLabel(pack, lang)}</span>
                </div>
                {pack.duration && <p className="text-white/35 text-sm mt-2 inline-flex items-center gap-1.5"><Clock size={13} className="text-gold-500/70" /> {pack.duration}</p>}
              </div>

              {/* Inclusions */}
              <div>
                <h2 className="text-gold-500 font-semibold text-sm mb-3 tracking-wide uppercase">{lang === 'ar' ? 'يشمل' : lang === 'en' ? 'This pack includes' : 'Ce pack comprend'}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {incs.map(({ key, icon: Icon, label, ar }) => (
                    <div key={key} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 flex flex-col items-start gap-2">
                      <Icon size={18} className="text-gold-500" />
                      <p className="text-white font-semibold text-sm">{lang === 'ar' ? ar : label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Véhicule + bien réels liés (inventaire du site) */}
              {(pack.car || pack.property) && (
                <div>
                  <h2 className="text-gold-500 font-semibold text-sm mb-3 tracking-wide uppercase">{lang === 'ar' ? 'السيارة والعقار المعنيان' : lang === 'en' ? 'The vehicle & property of this pack' : 'Le véhicule & le bien de ce pack'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pack.car && (
                      <Link href={`/cars/${pack.car.id}`} className="group bg-[#141414] border border-white/[0.06] hover:border-gold-500/25 rounded-xl overflow-hidden transition-all">
                        <div className="h-28 bg-[#0e0e0e] overflow-hidden">
                          {pack.car.image_url ? <img src={pack.car.image_url} alt={pack.car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><Car size={26} className="text-white/10" /></div>}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 text-gold-500/80 text-[10px] uppercase tracking-wide mb-1"><Car size={11} /> {lang === 'ar' ? 'السيارة' : lang === 'en' ? 'Vehicle' : 'Véhicule'}</div>
                          <p className="text-white font-semibold text-sm leading-tight">{pack.car.name}</p>
                          <p className="text-white/35 text-xs mt-0.5">{[pack.car.category, pack.car.seats ? `${pack.car.seats} places` : null, pack.car.available === false ? (lang === 'ar' ? 'محجوزة' : 'Indisponible') : null].filter(Boolean).join(' · ')}</p>
                        </div>
                      </Link>
                    )}
                    {pack.property && (
                      <Link href={`/immo/${pack.property.id}`} className="group bg-[#141414] border border-white/[0.06] hover:border-gold-500/25 rounded-xl overflow-hidden transition-all">
                        <div className="h-28 bg-[#0e0e0e] overflow-hidden">
                          {pack.property.image_url ? <img src={pack.property.image_url} alt={pack.property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><Home size={26} className="text-white/10" /></div>}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 text-gold-500/80 text-[10px] uppercase tracking-wide mb-1"><Home size={11} /> {lang === 'ar' ? 'العقار' : lang === 'en' ? 'Property' : 'Bien immo'}</div>
                          <p className="text-white font-semibold text-sm leading-tight">{pack.property.title}</p>
                          <p className="text-white/35 text-xs mt-0.5">{[pack.property.district, pack.property.city, (pack.property.status && pack.property.status !== 'disponible') ? (lang === 'ar' ? 'محجوز' : 'Indisponible') : null].filter(Boolean).join(' · ')}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                  {!available && <p className="text-red-400/70 text-xs mt-2">{lang === 'ar' ? 'هذه الباقة غير متوفرة حاليا (السيارة أو العقار محجوز).' : lang === 'en' ? 'This pack is currently unavailable (the vehicle or property is already booked).' : 'Ce pack est indisponible actuellement (le véhicule ou le bien est déjà loué).'}</p>}
                </div>
              )}

              {/* Features list */}
              {features.length > 0 && (
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-gold-500 font-semibold text-sm mb-3 tracking-wide uppercase">{lang === 'ar' ? 'التفاصيل' : lang === 'en' ? 'Included details' : 'Détails inclus'}</h2>
                  <ul className="space-y-2.5">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm leading-relaxed">
                        <Check size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pack.description && (
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-gold-500 font-semibold text-sm mb-3 tracking-wide uppercase">{lang === 'ar' ? 'الوصف' : 'Description'}</h2>{/* Description identique EN */}
                  <p className="text-white/55 leading-relaxed text-sm whitespace-pre-wrap">{descTr || pack.description}</p>
                </div>
              )}

              <div className="hidden md:flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1 py-4 text-base justify-center"><MessageCircle size={18} /> {lang === 'ar' ? 'اطلب عبر واتساب' : lang === 'en' ? 'Request this pack on WhatsApp' : 'Demander ce pack sur WhatsApp'}</a>
              </div>
              <div className="hidden md:block mt-3">
                <LeadCapture category="pack" criteria={pack.title} city="Oran" whatsappUrl={waUrl} />
              </div>
              <p className="text-white/20 text-xs text-center">{lang === 'ar' ? 'كل شيء يتم عبر واتساب — تأكيد التوفر والسعر من طرف فريقنا.' : lang === 'en' ? 'Everything goes through WhatsApp — availability and price confirmed by our team.' : 'Tout se fait via WhatsApp — disponibilité et tarif confirmés par notre équipe.'}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {lb && <Lightbox photos={allPhotos} startIndex={active} onClose={() => setLb(false)} />}
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: pack } = await client.from('packs')
      .select('*, car:cars(id, name, image_url, available, category, seats, fuel), property:properties(id, title, city, district, status, image_url, transaction, rooms)')
      .eq('id', params.id).single();
    return { props: { pack: pack || null, photos: [] } };
  } catch {
    return { props: { pack: null, photos: [] } };
  }
}
