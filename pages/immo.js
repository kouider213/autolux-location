import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Building2, MapPin, MessageCircle, Bell, CheckCircle, ArrowRight, Home, Star, Maximize, BedDouble, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const TYPE_ICONS = { appartement: Building2, villa: Home, maison: Home, local: MapPin, bureau: MapPin, terrain: Maximize };

function PropertyCard({ property }) {
  const photos = (property.property_photos || []).sort((a,b) => a.position - b.position);
  const mainPhoto = photos[0]?.url;
  const Icon = TYPE_ICONS[property.type] || Building2;

  return (
    <div className="group bg-[#141414] border border-white/[0.06] hover:border-gold-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Photo ou Coming Soon */}
      <div className="relative aspect-video bg-[#1a1a1a] overflow-hidden">
        {mainPhoto ? (
          <img src={mainPhoto} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1a1a2e] to-[#141414]">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
              <Icon size={28} className="text-blue-400/60" />
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-xs font-semibold">Photos bientôt</span>
            </div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white/70 capitalize backdrop-blur-sm">{property.type}</span>
        </div>
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 text-[10px] bg-black/60 text-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
            {photos.length} photos
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-sm mb-1 truncate">{property.title}</h3>
        <p className="text-white/35 text-xs mb-3 flex items-center gap-1">
          <MapPin size={10} />{property.district ? `${property.district}, ` : ''}{property.city}
        </p>

        <div className="flex items-center gap-3 mb-4 text-white/40 text-xs">
          {property.surface && <span className="flex items-center gap-1"><Maximize size={10} />{property.surface}m²</span>}
          {property.rooms && <span className="flex items-center gap-1"><BedDouble size={10} />{property.rooms}p</span>}
          {property.floor != null && property.floor >= 0 && <span>Étage {property.floor}</span>}
        </div>

        <div className="flex items-end justify-between">
          <div>
            {property.price
              ? <>
                  <div className="text-gold-400 font-black text-xl leading-none">{Number(property.price).toLocaleString()}€</div>
                  <div className="text-white/25 text-[10px] capitalize">{property.price_type}</div>
                </>
              : <div className="text-white/30 text-sm">Prix sur demande</div>
            }
          </div>
          <a href={`https://wa.me/32466311469?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien : ${property.title}. Pouvez-vous me donner plus d'informations ?`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-[#25D366]/20"
            onClick={e => e.stopPropagation()}>
            <MessageCircle size={12} />Contact
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ImmoPage({ properties }) {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const hasListings = properties && properties.length > 0;

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email || sent) return;
    const msg = `Bonjour Fik Conciergerie, je souhaite être notifié(e) au lancement de la section immobilière. Email: ${email}`;
    window.open(`https://wa.me/32466311469?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <>
      <Head>
        <title>Immobilier Oran — Fik Conciergerie</title>
        <meta name="description" content="Appartements, villas, locaux commerciaux à Oran. Fik Conciergerie — votre partenaire immobilier." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Header */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0e] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto">
            <div className={hasListings ? 'flex flex-col md:flex-row md:items-end justify-between gap-6' : 'text-center'}>
              <div>
                {!hasListings && (
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Bientôt disponible</span>
                  </div>
                )}
                {hasListings && <span className="section-badge mb-4 inline-block">Immobilier</span>}
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                  {hasListings ? (
                    <>Nos biens <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent italic">immobiliers</span></>
                  ) : (
                    <>L'immobilier à Oran <br /><span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent italic">comme vous le méritez</span></>
                  )}
                </h1>
                <p className="text-white/40 max-w-xl leading-relaxed">
                  {hasListings
                    ? `${properties.length} bien${properties.length > 1 ? 's' : ''} disponible${properties.length > 1 ? 's' : ''} à Oran. Contactez-nous directement pour plus d'informations.`
                    : 'Fik Conciergerie étend son expertise à l\'immobilier. Appartements, villas, locaux — des biens sélectionnés avec soin.'}
                </p>
              </div>

              {/* Notification form — toujours visible */}
              {!hasListings && (
                <div className="max-w-md mx-auto w-full mt-8">
                  {!sent ? (
                    <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Votre email pour être notifié(e)"
                        className="flex-1 input-dark text-sm" required />
                      <button type="submit" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-5 rounded-xl transition-all whitespace-nowrap">
                        <Bell size={14} />Me notifier
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3">
                      <CheckCircle size={15} /><span className="text-sm">Nous vous contacterons au lancement !</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listings ou Coming Soon content */}
        <div className="px-5 pb-24">
          <div className="max-w-7xl mx-auto">

            {hasListings ? (
              // Grille biens
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {properties.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              // Coming Soon — contenu informatif
              <div className="space-y-16">
                {/* Types */}
                <div>
                  <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">Ce qui arrive bientôt</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Building2, label: 'Appartements', desc: 'Studios, F2, F3, F4 en centre-ville' },
                      { icon: Home,      label: 'Villas',        desc: 'Villas familiales standing supérieur' },
                      { icon: MapPin,    label: 'Locaux',        desc: 'Bureaux, commerces, entrepôts' },
                      { icon: Star,      label: 'Terrains',      desc: 'Zones résidentielles et commerciales' },
                    ].map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 text-center">
                          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Icon size={20} className="text-blue-400" />
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-1">{f.label}</h3>
                          <p className="text-white/30 text-xs">{f.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Propriétaire CTA */}
                <div className="bg-gradient-to-br from-[#141420] to-[#141414] border border-blue-500/15 rounded-3xl p-8 text-center max-w-2xl mx-auto">
                  <h3 className="font-display text-2xl font-bold text-white mb-3">Vous êtes propriétaire ?</h3>
                  <p className="text-white/40 text-sm mb-6 leading-relaxed">Mettez votre bien en avant sur notre plateforme dès le lancement. Contactez-nous maintenant pour réserver votre place.</p>
                  <a href="https://wa.me/32466311469?text=Bonjour%20Fik%20Conciergerie%2C%20je%20suis%20propri%C3%A9taire%20et%20souhaite%20mettre%20mon%20bien%20en%20avant."
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
                    <MessageCircle size={16} />Je suis propriétaire
                  </a>
                </div>
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
    if (!supabase) return { props: { properties: [] }, revalidate: 60 };
    const { data } = await supabase
      .from('properties')
      .select('*, property_photos(url, position)')
      .eq('available', true)
      .order('created_at', { ascending: false });
    return { props: { properties: data || [] }, revalidate: 60 };
  } catch {
    return { props: { properties: [] }, revalidate: 60 };
  }
}
