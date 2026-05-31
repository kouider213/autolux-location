import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Maximize, BedDouble, Building2, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, Home, Layers } from 'lucide-react';
import Navbar from '../../components/Navbar';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PropertyDetail({ property, photos }) {
  const [active, setActive] = useState(0);

  if (!property) return (
    <>
      <div className="grain min-h-screen bg-[#0e0e0e]"><Navbar />
        <div className="flex items-center justify-center min-h-screen text-center px-5">
          <div><Building2 size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/50 mb-4">Bien introuvable</p>
            <Link href="/immo" className="text-gold-400 hover:text-gold-300 text-sm">← Retour à l'immobilier</Link>
          </div>
        </div>
      </div>
    </>
  );

  const whatsappMsg = `Bonjour Fik Conciergerie,\n\nJe suis intéressé(e) par le bien :\n*${property.title}*\n${property.price ? `Prix: ${Number(property.price).toLocaleString()}€ (${property.price_type})` : 'Prix sur demande'}\n\nMerci de me contacter.`;
  const whatsappUrl = `https://wa.me/32466311469?text=${encodeURIComponent(whatsappMsg)}`;

  const specs = [
    property.surface && { icon: Maximize, label: 'Surface', value: `${property.surface} m²` },
    property.rooms   && { icon: BedDouble, label: 'Pièces',  value: `${property.rooms} pièces` },
    property.floor != null && { icon: Layers, label: 'Étage', value: property.floor === 0 ? 'RDC' : `${property.floor}ème étage` },
    property.type    && { icon: Building2, label: 'Type',    value: property.type },
    property.city    && { icon: MapPin,    label: 'Ville',   value: property.city },
    property.district && { icon: MapPin,   label: 'Quartier', value: property.district },
  ].filter(Boolean);

  const allPhotos = photos || [];

  return (
    <>
      <Head>
        <title>{property.title} — Fik Conciergerie Immobilier</title>
        <meta name="description" content={`${property.title} à ${property.city}. ${property.price ? Number(property.price).toLocaleString() + '€' : 'Prix sur demande'}. Fik Conciergerie.`} />
      </Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-24 pb-0 px-5 max-w-6xl mx-auto">
          <Link href="/immo" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 group transition-colors">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />Retour à l'immobilier
          </Link>
        </div>

        <div className="px-5 pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Galerie */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06]" style={{ aspectRatio: '4/3' }}>
                {allPhotos.length > 0 ? (
                  <>
                    <img src={allPhotos[active]} alt={`${property.title} ${active+1}`} className="w-full h-full object-cover" />
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
                      <span className="text-blue-400 text-sm">Photos bientôt disponibles</span>
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
                      className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-gold-500' : 'border-white/[0.06] opacity-50 hover:opacity-100'}`}>
                      <img src={src} alt={`${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/30 text-xs tracking-widest uppercase">{property.type}</span>
                  {property.available && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Disponible</span>}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{property.title}</h1>
                {(property.district || property.city) && (
                  <p className="flex items-center gap-1.5 text-white/40 text-sm mb-4">
                    <MapPin size={14} />{[property.district, property.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {property.price ? (
                  <div>
                    <div className="font-display font-black text-gold-400 text-4xl leading-none">{Number(property.price).toLocaleString()}€</div>
                    <div className="text-white/30 text-sm capitalize mt-1">{property.price_type}</div>
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
                  <p className="text-white/25 text-xs uppercase tracking-widest mb-2">Description</p>
                  <p className="text-white/55 text-sm leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* CTA */}
              <div className="space-y-3 mt-auto">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)] text-base">
                  <MessageCircle size={18} />Contacter pour ce bien
                </a>
                <Link href="/immo" className="flex items-center justify-center gap-2 w-full btn-outline py-3.5">
                  <Home size={15} />Voir tous les biens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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
