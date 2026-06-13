import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Tag, Fuel, Gauge, Calendar, Settings, MapPin, ArrowLeft, MessageCircle, CheckCircle, Car } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShareButtons from '../../components/ShareButtons';
import LeadCapture from '../../components/LeadCapture';
import Lightbox from '../../components/Lightbox';
import { trackPageView } from '../../lib/tracker';
import { useLang } from '../../lib/i18n';
import { useSettings, waNumber } from '../../lib/settings';

const cur = (c) => c === 'DZD' ? 'DA' : '€';

const STATUS_BADGE = {
  disponible:  { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25' },
  reserve:     { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  vendu:       { cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  coming_soon: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

export default function VehicleSaleDetail({ vehicle, photos: initialPhotos }) {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState(false);
  const STB = { disponible: t('b.available'), reserve: t('b.reserved'), vendu: t('b.sold'), coming_soon: t('b.soon') };

  useEffect(() => {
    if (vehicle?.id) {
      trackPageView(`/vente-voitures/${vehicle.id}`, null);
      const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      client.from('vehicle_sale_photos').select('url, position').eq('vehicle_id', vehicle.id).order('position')
        .then(({ data }) => { if (data?.length) setPhotos(data.map(p => p.url)); });
    }
  }, [vehicle?.id]);

  if (!vehicle) {
    return (
      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Tag size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-2">{t('d.notfound')}</p>
            <Link href="/vente-voitures" className="text-gold-500 hover:text-gold-400 text-sm">← {t('d.back_sale')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const allPhotos = photos.length > 0 ? photos : (vehicle.image_url ? [vehicle.image_url] : []);
  const src = allPhotos[active] || null;
  const available = vehicle.status === 'disponible';
  const st = STATUS_BADGE[vehicle.status] || STATUS_BADGE.disponible;
  const stLabel = STB[vehicle.status] || STB.disponible;

  const priceStr = vehicle.price ? `${Number(vehicle.price).toLocaleString()} ${cur(vehicle.currency)}` : '';
  const veh = `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}`;
  const waMsg = encodeURIComponent(
    lang === 'ar'
      ? `مرحباً Fik Conciergerie،\n\nأنا مهتم بالسيارة المعروضة للبيع:\n*${veh}*${priceStr ? `\nالسعر: ${priceStr}` : ''}\n\nهل ما زالت متوفرة؟`
      : lang === 'en'
      ? `Hello Fik Conciergerie,\n\nI'm interested in this vehicle for sale:\n*${veh}*${priceStr ? `\nPrice: ${priceStr}` : ''}\n\nIs it still available?`
      : `Bonjour Fik Conciergerie,\n\nJe suis intéressé(e) par le véhicule à vendre :\n*${veh}*${priceStr ? `\nPrix : ${priceStr}` : ''}\n\nEst-il toujours disponible ?`
  );
  const waUrl = `https://wa.me/${WHATSAPP}?text=${waMsg}`;

  const specs = [
    vehicle.year     && { icon: Calendar, label: t('d.year'),       value: vehicle.year },
    vehicle.mileage != null && { icon: Gauge, label: t('d.mileage'), value: `${Number(vehicle.mileage).toLocaleString()} km` },
    vehicle.fuel     && { icon: Fuel,     label: t('d.fuel'),   value: vehicle.fuel },
    vehicle.transmission && { icon: Settings, label: t('d.transmission'),   value: vehicle.transmission },
    vehicle.city     && { icon: MapPin,   label: t('d.city'),       value: vehicle.city },
    vehicle.condition && { icon: CheckCircle, label: t('d.condition'),    value: vehicle.condition },
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{vehicle.brand} {vehicle.model} — À vendre — Fik Conciergerie</title>
        <meta name="description" content={`${vehicle.brand} ${vehicle.model} à vendre à Oran${vehicle.price ? ` — ${Number(vehicle.price).toLocaleString()} ${cur(vehicle.currency)}` : ''}.`} />
        {(allPhotos[0] || vehicle.image_url) && <meta property="og:image" key="og-image" content={allPhotos[0] || vehicle.image_url} />}
        {(allPhotos[0] || vehicle.image_url) && <meta name="twitter:image" key="tw-image" content={allPhotos[0] || vehicle.image_url} />}
        <meta property="og:title" content={`${vehicle.brand} ${vehicle.model} — À vendre`} />
        <meta property="og:description" content={`${vehicle.price ? Number(vehicle.price).toLocaleString() + ' ' + cur(vehicle.currency) : 'Prix sur demande'} · Fik Conciergerie Oran`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Car',
          name: `${vehicle.brand} ${vehicle.model}`,
          brand: { '@type': 'Brand', name: vehicle.brand },
          model: vehicle.model,
          ...(vehicle.year ? { vehicleModelDate: String(vehicle.year), productionDate: String(vehicle.year) } : {}),
          ...(vehicle.mileage ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: Number(vehicle.mileage), unitCode: 'KMT' } } : {}),
          ...(allPhotos[0] || vehicle.image_url ? { image: allPhotos[0] || vehicle.image_url } : {}),
          ...(vehicle.price ? { offers: {
            '@type': 'Offer',
            price: Number(vehicle.price),
            priceCurrency: vehicle.currency === 'EUR' ? 'EUR' : 'DZD',
            availability: (vehicle.status || 'disponible') === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: `https://fikconciergerie.com/vente-voitures/${vehicle.id}`,
            seller: { '@type': 'Organization', name: 'Fik Conciergerie' },
          } } : {}),
        }) }} />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Sticky CTA mobile */}
        {available && (
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-xs">{t('res.total')}</p>
              <p className="font-display font-black text-gold-400 text-xl leading-none tabular-nums">{vehicle.price ? `${Number(vehicle.price).toLocaleString()} ${cur(vehicle.currency)}` : t('b.price_request')}</p>
            </div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-gold py-3 px-6 text-sm flex-1 justify-center max-w-[200px]"><MessageCircle size={15} /> {t('d.contact_short')}</a>
          </div>
        )}

        <div className="pt-24 pb-0 px-5 max-w-6xl mx-auto">
          <Link href="/vente-voitures" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> {t('d.back_sale')}
          </Link>
        </div>

        <div className="px-5 pb-36 md:pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06]" style={{ aspectRatio: '4/3' }}>
                {src ? (
                  /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src)
                    ? <video src={src} controls playsInline className="w-full h-full object-cover bg-black" />
                    : <img src={src} alt={vehicle.model} onClick={() => setLb(true)} className="w-full h-full object-cover cursor-zoom-in" loading="eager" />
                ) : <div className="w-full h-full flex items-center justify-center"><Tag size={56} className="text-white/[0.07]" /></div>}
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-lg border ${st.cls}`}>{stLabel}</span>
                {vehicle.featured && <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-lg bg-gold-500 text-noir-950">{t('b.featured')}</span>}
              </div>
              {allPhotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((s, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-gold-500' : 'border-white/[0.06] opacity-60 hover:opacity-100'}`}>
                      {/\.(mp4|webm|mov|m4v)(\?|$)/i.test(s)
                        ? <><video src={s} muted className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center text-white text-lg">▶</span></>
                        : <img src={s} alt={`${vehicle.model} ${i + 1}`} className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-white/30 text-xs tracking-widest uppercase mb-2">{t('sale.badge')} · {vehicle.city || 'Oran'}</p>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{vehicle.brand} {vehicle.model}</h1>
                <div className="mb-4"><ShareButtons title={`${vehicle.brand} ${vehicle.model}`} /></div>
                <div className="flex items-baseline gap-2">
                  {vehicle.price ? (
                    <><span className="font-display font-black text-gold-gradient leading-none" style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}>{Number(vehicle.price).toLocaleString()} {cur(vehicle.currency)}</span></>
                  ) : <span className="font-display font-black text-gold-gradient text-3xl">{t('b.price_request')}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                    <Icon size={16} className="text-gold-500 mb-2" />
                    <p className="text-white/30 text-xs mb-0.5">{label}</p>
                    <p className="text-white font-semibold text-sm capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {vehicle.description && (
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <h2 className="text-gold-500 font-semibold text-sm mb-3 tracking-wide uppercase">{t('d.description')}</h2>
                  <p className="text-white/55 leading-relaxed text-sm whitespace-pre-wrap">{vehicle.description}</p>
                </div>
              )}

              <div className="hidden md:flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                {available ? (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1 py-4 text-base justify-center"><MessageCircle size={18} /> {t('d.contact')}</a>
                ) : (
                  <div className="flex-1 py-4 text-base bg-white/[0.04] text-white/30 rounded-xl text-center font-semibold">{stLabel}</div>
                )}
              </div>
              {available && (
                <div className="hidden md:block">
                  <LeadCapture category="voiture_vente" criteria={`${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}`}
                    budget_max={vehicle.price} currency={vehicle.currency} city={vehicle.city} whatsappUrl={waUrl} />
                </div>
              )}
              <p className="text-white/20 text-xs text-center">{t('d.perks_note')}</p>
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
    const { data: vehicle } = await client.from('vehicles_for_sale').select('*').eq('id', params.id).single();
    return { props: { vehicle: vehicle || null, photos: [] } };
  } catch {
    return { props: { vehicle: null, photos: [] } };
  }
}
