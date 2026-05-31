import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Building2, MapPin, BedDouble, Maximize, MessageCircle, Bell, CheckCircle, ArrowRight, Home, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const COMING_FEATURES = [
  { icon: Building2, label: 'Appartements',  desc: 'Studios, F2, F3, F4 en centre-ville et quartiers prisés' },
  { icon: Home,      label: 'Villas',         desc: 'Villas familiales avec jardins, piscines, standing supérieur' },
  { icon: MapPin,    label: 'Locaux commerciaux', desc: 'Bureaux, commerces, entrepôts à Oran et environs' },
  { icon: Star,      label: 'Terrains',       desc: 'Terrains constructibles, zones résidentielles et commerciales' },
];

const WHY = [
  'Annonces vérifiées et à jour',
  'Photos HD en galerie',
  'Visite virtuelle disponible',
  'Contact direct propriétaire',
  'Estimation gratuite',
  'Accompagnement juridique',
];

export default function ImmoPage({ properties }) {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  const handleNotify = async (e) => {
    e.preventDefault();
    if (!email || sent) return;
    // Save to Supabase notifications or just open WhatsApp
    const msg = `Bonjour Fik Conciergerie, je souhaite être notifié(e) au lancement de la section immobilière. Email: ${email}`;
    window.open(`https://wa.me/32466311469?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  const hasListings = properties && properties.length > 0;

  return (
    <>
      <Head>
        <title>Immobilier Oran — Fik Conciergerie</title>
        <meta name="description" content="Bientôt disponible — Fik Conciergerie lance sa section immobilière à Oran. Appartements, villas, locaux commerciaux." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0e] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            {/* Coming Soon badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Bientôt disponible</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              L'immobilier à Oran <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent italic">
                comme vous le méritez
              </span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Fik Conciergerie étend son expertise à l'immobilier. Appartements, villas, locaux commerciaux — des biens sélectionnés avec soin à Oran et ses environs.
            </p>

            {/* Notify form */}
            {!sent ? (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Votre email pour être notifié(e)"
                  className="flex-1 input-dark text-sm" required />
                <button type="submit"
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all whitespace-nowrap">
                  <Bell size={15} />Me notifier
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-3 max-w-sm mx-auto">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Nous vous contacterons au lancement !</span>
              </div>
            )}
          </div>
        </div>

        {/* Coming features */}
        <div className="px-5 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold text-white mb-2">Ce qui arrive bientôt</h2>
              <p className="text-white/30 text-sm">Une sélection de biens immobiliers à Oran</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMING_FEATURES.map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">{f.label}</h3>
                      <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why */}
        <div className="px-5 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#141420] to-[#141414] border border-blue-500/15 rounded-3xl p-8">
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Pourquoi faire confiance à <span className="text-blue-400">Fik</span> pour votre immobilier ?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WHY.map(w => (
                  <div key={w} className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                    <span className="text-white/60 text-sm">{w}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.05]">
                <p className="text-white/35 text-sm mb-4">
                  Vous avez un bien à vendre ou à louer ? Contactez-nous dès maintenant pour le mettre en avant sur notre plateforme.
                </p>
                <a href="https://wa.me/32466311469?text=Bonjour%20Fik%20Conciergerie%2C%20je%20suis%20propri%C3%A9taire%20et%20je%20souhaite%20mettre%20mon%20bien%20en%20vente%2Flocation."
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-[0_4px_16px_rgba(37,211,102,0.2)]">
                  <MessageCircle size={15} />Je suis propriétaire — me contacter
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA voitures */}
        <div className="px-5 pb-24">
          <div className="max-w-4xl mx-auto bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold mb-1">En attendant, découvrez notre flotte automobile</p>
              <p className="text-white/35 text-sm">Véhicules premium à louer à Oran. Sans caution. 7j/7.</p>
            </div>
            <Link href="/cars" className="btn-gold whitespace-nowrap flex-shrink-0">
              Voir les véhicules <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { properties: [] }, revalidate: 60 };
    const { data } = await supabase.from('properties').select('*').eq('available', true).order('created_at', { ascending: false });
    return { props: { properties: data || [] }, revalidate: 60 };
  } catch {
    return { props: { properties: [] }, revalidate: 60 };
  }
}
