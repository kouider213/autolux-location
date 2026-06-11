import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Maximize, BedDouble, Bath, Building2, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, Home, Layers, Wallet, KeyRound, CalendarClock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Lightbox from '../../components/Lightbox';
import ShareButtons from '../../components/ShareButtons';
import { useLang } from '../../lib/i18n';
import { useTranslated } from '../../lib/autoTranslate';
import { useSettings, waNumber } from '../../lib/settings';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const cur = (c) => c === 'DZD' ? 'DA' : '€';
const isVideo = (url) => typeof url === 'string' && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
const STATUS_BADGE = {
  disponible:  { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  loue:        { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  vendu:       { cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  coming_soon: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

export default function PropertyDetail({ property, photos }) {
  const { t } = useLang();
  const descTr = useTranslated(property?.description || '');
  const WHATSAPP = waNumber(useSettings());
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState(false);
  const STB = { disponible: t('b.available'), loue: t('b.rented'), vendu: t('b.sold'), coming_soon: t('b.soon') };

  if (!property) return (
    <>
      <div className="grain min-h-screen bg-[#0e0e0e]"><Navbar />
        <div className="flex items-center justify-center min-h-screen text-center px-5">
          <div><Building2 size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/50 mb-4">{t('d.notfound')}</p>
            <Link href="/immo" className="text-gold-400 hover:text-gold-300 text-sm">← {t('d.back_immo')}</Link>
          </div>
        </div>
      </div>
    </>
  );

  const isSale = (property.transaction || 'location') === 'vente';
  const available = (property.status || 'disponible') === 'disponible';
  const st = STATUS_BADGE[property.status] || STATUS_BADGE.disponible;
  const stLabel = STB[property.status] || STB.disponible;
  const priceTxt = property.price ? `${Number(property.price).toLocaleString()} ${cur(property.currency)}${isSale ? '' : '/mois'}` : 'Prix sur demande';

  const whatsappMsg = `Bonjour Fik Conciergerie,\n\nJe suis intéressé(e) par le bien :\n*${property.title}*\n${property.price ? `Prix: ${priceTxt}` : 'Prix sur demande'}\n\nMerci de me contacter.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappMsg)}`;

  const specs = [
    property.surface && { icon: Maximize, label: t('d.surface'), value: `${property.surface} m²` },
    (property.bedrooms || property.rooms) && { icon: BedDouble, label: property.bedrooms ? t('d.bedrooms') : t('d.rooms'), value: property.bedrooms || property.rooms },
    property.bathrooms && { icon: Bath, label: t('d.bathrooms'), value: property.bathrooms },
    property.floor != null && property.floor !== '' && { icon: Layers, label: t('d.floor'), value: property.floor === 0 ? t('d.rdc') : `${property.floor}e` },
    property.type    && { icon: Building2, label: t('d.type'),    value: property.type },
    property.city    && { icon: MapPin,    label: t('d.city'),   value: property.city },
    !isSale && property.deposit && { icon: KeyRound, label: t('d.deposit'), value: `${Number(property.deposit).toLocaleString()} ${cur(property.currency)}` },
    !isSale && property.min_duration && { icon: CalendarClock, label: t('d.duration'), value: property.min_duration },
    property.charges_included != null && { icon: Wallet, label: t('d.charges'), value: property.charges_included ? t('d.charges_inc') : (property.charges_amount ? `${Number(property.charges_amount).toLocaleString()} ${cur(property.currency)}` : t('d.charges_no')) },
  ].filter(Boolean);

  const allPhotos = photos || [];

  return (
    <>
      <Head>
        <title>{property.title} — Fik Conciergerie Immobilier</title>
        <meta name="description" content={`${property.title} à ${property.city}. ${property.price ? Number(property.price).toLocaleString() + ' ' + cur(property.currency) : 'Prix sur demande'}. Fik Conciergerie.`} />
        {(allPhotos[0] || property.image_url) && <meta property="og:image" key="og-image" content={allPhotos[0] || property.image_url} />}
        {(allPhotos[0] || property.image_url) && <meta name="twitter:image" key="tw-image" content={allPhotos[0] || property.image_url} />}
        <meta property="og:title" content={`${property.title} — ${isSale ? 'À vendre' : 'À louer'} à ${property.city}`} />
        <meta property="og:description" content={`${priceTxt} · Fik Conciergerie Oran`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: property.title,
          description: property.description || `${property.type || 'Bien'} ${isSale ? 'à vendre' : 'à louer'} à ${[property.district, property.city].filter(Boolean).join(', ')}.`,
          ...(allPhotos[0] || property.image_url ? { image: allPhotos[0] || property.image_url } : {}),
          category: isSale ? 'Immobilier à vendre' : 'Immobilier à louer',
          brand: { '@type': 'Brand', name: 'Fik Conciergerie' },
          ...(property.price ? { offers: {
            '@type': 'Offer',
            price: Number(property.price),
            priceCurrency: property.currency === 'EUR' ? 'EUR' : 'DZD',
            availability: (property.status || 'disponible') === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: `https://fikconciergerie.com/immo/${property.id}`,
          } } : {}),
        }) }} />
      </Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Sticky CTA mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs">{isSale ? t('d.sale_price') : t('d.rent_price')}</p>
            <p className="font-display font-black text-gold-400 text-lg leading-none">{priceTxt}</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl text-sm flex-1 max-w-[200px]"><MessageCircle size={16} /> {t('d.contact_short')}</a>
        </div>

        <div className="pt-24 pb-0 px-5 max-w-6xl mx-auto">
          <Link href="/immo" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 group transition-colors">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />{t('d.back_immo')}
          </Link>
        </div>

        <div className="px-5 pb-36 md:pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Galerie */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06]" style={{ aspectRatio: '4/3' }}>
                {allPhotos.length > 0 ? (
                  <>
                    {isVideo(allPhotos[active]) ? (
                      <video src={allPhotos[active]} controls playsInline className="w-full h-full object-cover bg-black" />
                    ) : (
                      <img src={allPhotos[active]} alt={`${property.title} ${active+1}`} onClick={() => setLb(true)} className="w-full h-full object-cover cursor-zoom-in" />
                    )}
                    {allPhotos.length > 1 && (
                      <>
                        <button onClick={() => setActive(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => setActive(i => (i + 1) % allPhotos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm">
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white/70 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                          {active+1} / {allPhotos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1a1a2e] to-[#141414]">
                    <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Building2 size={32} className="text-blue-400/60" />
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-400 text-sm">{t('d.photos_soon')}</span>
                    </div>
                  </div>
                )}
                <span className="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white/70 capitalize backdrop-blur-sm">{property.type}</span>
              </div>

              {/* Miniatures */}
              {allPhotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((src, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-gold-500' : 'border-white/[0.06] opacity-50 hover:opacity-100'}`}>
                      {isVideo(src) ? (
                        <>
                          <video src={src} muted className="w-full h-full object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center text-white text-lg">▶</span>
                        </>
                      ) : (
                        <img src={src} alt={`${i+1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${isSale ? 'bg-purple-500/20 text-purple-300 border-purple-500/25' : 'bg-blue-500/20 text-blue-300 border-blue-500/25'}`}>{isSale ? 'À VENDRE' : 'À LOUER'}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${st.cls}`}>{stLabel}</span>
                  {property.featured && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-noir-950">EN AVANT</span>}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{property.title}</h1>
                <div className="mb-3"><ShareButtons title={property.title} /></div>
                {(property.district || property.city) && (
                  <p className="flex items-center gap-1.5 text-white/40 text-sm mb-4">
                    <MapPin size={14} />{[property.district, property.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {property.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-gold-400 text-4xl leading-none">{Number(property.price).toLocaleString()} {cur(property.currency)}</span>
                    {!isSale && <span className="text-white/30 text-sm">/mois</span>}
                  </div>
                ) : (
                  <div className="text-white/40 text-lg">Prix sur demande</div>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white/25 text-[10px]">{label}</p>
                      <p className="text-white font-semibold text-sm capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <p className="text-white/25 text-xs uppercase tracking-widest mb-2">{t('d.description')}</p>
                  <p className="text-white/55 text-sm leading-relaxed whitespace-pre-wrap">{descTr || property.description}</p>
                </div>
              )}

              {/* Conditions */}
              {property.conditions && (
                <div>
                  <p className="text-white/25 text-xs uppercase tracking-widest mb-2">{t('d.conditions')}</p>
                  <p className="text-white/55 text-sm leading-relaxed whitespace-pre-wrap">{property.conditions}</p>
                </div>
              )}

              {/* CTA desktop */}
              <div className="space-y-3 mt-auto hidden md:block">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)] text-base">
                  <MessageCircle size={18} />{t('d.contact_this')}
                </a>
                <Link href="/immo" className="flex items-center justify-center gap-2 w-full btn-outline py-3.5">
                  <Home size={15} />{t('d.all_immo')}
                </Link>
              </div>
            </div>
          </div>

          {/* Carte Google Maps — emplacement du bien */}
          {(() => {
            const loc = (property.address && property.address.trim())
              || [property.district, property.city].filter(Boolean).join(', ');
            if (!loc) return null;
            const q = encodeURIComponent(`${loc}, Algérie`);
            return (
              <div className="mt-10">
                <p className="flex items-center gap-1.5 text-white/25 text-xs uppercase tracking-widest mb-3">
                  <MapPin size={13} /> {t('d.location') || 'Emplacement'}
                </p>
                {property.address && (
                  <p className="text-white/55 text-sm mb-3">{property.address}</p>
                )}
                <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#141414]" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    title="Carte"
                    src={`https://www.google.com/maps?q=${q}&hl=fr&z=15&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }}
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-sm mt-3">
                  <MapPin size={13} /> {t('d.open_maps') || 'Ouvrir dans Google Maps'}
                </a>
              </div>
            );
          })()}
        </div>
      </div>
      <Footer />
      {lb && <Lightbox photos={allPhotos} startIndex={active} onClose={() => setLb(false)} />}
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data: property } = await supabaseClient
      .from('properties').select('*').eq('id', params.id).single();
    if (!property) return { notFound: true };

    const { data: photoRows } = await supabaseClient
      .from('property_photos').select('url, position').eq('property_id', params.id).order('position');

    return {
      props: {
        property,
        photos: (photoRows || []).map(p => p.url),
      },
    };
  } catch {
    return { notFound: true };
  }
}
