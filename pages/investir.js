import Head from 'next/head';
import Link from 'next/link';
import { Building2, KeyRound, ShieldCheck, Plane, TrendingUp, MessageCircle, Home, Car, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings, waLink } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { T } from '../lib/autoTranslate';

const STEPS = [
  { icon: MessageCircle, title: 'Tu nous contactes', desc: 'Depuis l\'étranger, par WhatsApp. On comprend ton projet : louer, acheter, investir.' },
  { icon: Building2,     title: 'On sélectionne', desc: 'On te propose des biens vérifiés à Oran (photos, vidéos, emplacement Google Maps).' },
  { icon: ShieldCheck,   title: 'On sécurise',   desc: 'Visite, négociation, papiers, état des lieux — on gère tout sur place pour toi.' },
  { icon: KeyRound,      title: 'Clé en main',   desc: 'Gestion locative, entretien, encaissement. Tu suis tout à distance.' },
];

const OFFERS = [
  { icon: Home,        title: 'Immobilier locatif', desc: 'Achète un bien à Oran, on le loue et le gère pour toi. Revenu passif, zéro souci.' },
  { icon: TrendingUp,  title: 'Achat / Revente',    desc: 'Accompagnement complet à l\'achat ou à la vente d\'un bien : estimation, papiers, sécurité.' },
  { icon: Car,         title: 'Véhicules',          desc: 'Location à ton arrivée ou achat d\'un véhicule — livré et prêt, sans caution.' },
  { icon: Plane,       title: 'Conciergerie séjour', desc: 'Tu viens en vacances ? Logement, voiture, services : tout prêt avant d\'atterrir.' },
];

export default function InvestirPage() {
  const settings = useSettings();
  const { lang } = useLang();
  const wa = (msg) => waLink(settings, msg);

  return (
    <>
      <Head>
        <title>Investir à Oran depuis l'étranger — Fik Conciergerie</title>
        <meta name="description" content="Algériens du monde : investissez à Oran en toute confiance. Immobilier locatif, achat/revente, véhicules, conciergerie clé en main gérée sur place par Fik Conciergerie." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 right-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Plane size={11} /> <T>Pour les Algériens du monde</T>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
              <T>Investir à Oran,</T> <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic"><T>depuis n'importe où</T></span>
            </h1>
            <p className="text-white/40 max-w-xl mx-auto text-base leading-relaxed mb-8">
              <T>Tu vis à l'étranger et tu veux investir, acheter, louer ou passer des vacances au pays ? On est tes yeux et tes mains à Oran. Confiance, transparence, clé en main.</T>
            </p>
            <a href={wa('Bonjour Fik Conciergerie, je vis à l\'étranger et je souhaite investir / acheter / louer à Oran. Pouvez-vous m\'accompagner ?')}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
              <MessageCircle size={18} /> <T>Parler à un conseiller</T>
            </a>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-6xl mx-auto">

            {/* Offres */}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-2"><T>Ce qu'on fait pour toi</T></h2>
            <p className="text-white/30 text-center text-sm mb-10"><T>Un seul interlocuteur de confiance, sur place à Oran.</T></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
              {OFFERS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#111]/80 border border-white/[0.07] rounded-2xl p-6 hover:border-gold-500/30 transition-colors">
                  <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-gold-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2"><T>{title}</T></h3>
                  <p className="text-white/45 text-sm leading-relaxed"><T>{desc}</T></p>
                </div>
              ))}
            </div>

            {/* Étapes */}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-10"><T>Comment ça marche</T></h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="relative bg-[#111]/60 border border-white/[0.06] rounded-2xl p-5">
                  <span className="absolute -top-3 -left-3 w-8 h-8 bg-gold-500 text-noir-950 rounded-full flex items-center justify-center font-display font-black text-sm">{i + 1}</span>
                  <Icon size={20} className="text-gold-400 mb-3 mt-2" />
                  <h3 className="text-white font-bold text-sm mb-1.5"><T>{title}</T></h3>
                  <p className="text-white/40 text-xs leading-relaxed"><T>{desc}</T></p>
                </div>
              ))}
            </div>

            {/* Pourquoi Fik */}
            <div className="bg-gradient-to-br from-gold-500/[0.08] to-transparent border border-gold-500/15 rounded-3xl p-8 md:p-12 text-center mb-16">
              <ShieldCheck size={32} className="text-gold-400 mx-auto mb-5" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4"><T>Pourquoi nous faire confiance</T></h2>
              <p className="text-white/45 max-w-2xl mx-auto text-sm leading-relaxed mb-8">
                <T>Biens vérifiés, vidéos et emplacement réel sur carte, accompagnement papiers, et un suivi transparent à distance. On traite ton investissement comme le nôtre.</T>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/immo" className="inline-flex items-center gap-2 btn-gold py-3 px-6"><Building2 size={15} /> <T>Voir les biens</T></Link>
                <Link href="/vente-voitures" className="inline-flex items-center gap-2 btn-outline py-3 px-6"><Car size={15} /> <T>Voitures à vendre</T></Link>
                <a href={wa('Bonjour, je souhaite investir à Oran depuis l\'étranger.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl"><MessageCircle size={15} /> WhatsApp</a>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-white/25 text-sm">
              <MapPin size={13} /> <T>Oran, Algérie — service 7j/7 pour la diaspora</T>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
