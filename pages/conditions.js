import Head from 'next/head';
import Link from 'next/link';
import { Shield, CakeSlice, BookOpen, Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const CONDITIONS = [
  {
    icon: CakeSlice,
    title: 'Âge minimum : 35 ans',
    desc: 'Nous demandons un âge minimum de 35 ans afin d\'assurer une conduite responsable, conformément aux exigences de nos assurances.',
    accent: 'text-gold-400',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/20',
  },
  {
    icon: Shield,
    title: 'Aucune caution exigée',
    desc: 'Contrairement à la plupart des agences, nous ne demandons aucune caution. La confiance est au cœur de notre service.',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: BookOpen,
    title: 'Passeport conservé',
    desc: 'Votre passeport sera conservé pendant toute la durée de la location et vous sera restitué à la remise du véhicule.',
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Wallet,
    title: 'Acompte requis',
    desc: 'Un acompte est demandé pour confirmer et bloquer votre véhicule. Son montant sera précisé lors de la confirmation.',
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
];

export default function ConditionsPage() {
  return (
    <>
      <Head>
        <title>Conditions de Location — AutoLux</title>
        <meta name="description" content="Conditions générales de location AutoLux. Âge minimum 35 ans, sans caution, passeport conservé." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Header */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">Transparence</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
              Conditions de <span className="text-gold-gradient italic">location</span>
            </h1>
            <p className="text-white/35 mt-5 max-w-xl mx-auto leading-relaxed">
              Pour garantir un service sérieux, sécurisé et confortable pour tous,
              voici nos conditions générales de location.
            </p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-3xl mx-auto">

            {/* Conditions list */}
            <div className="space-y-4 mb-10">
              {CONDITIONS.map((item, i) => (
                <div
                  key={i}
                  className="card-dark p-6 flex gap-5 items-start hover:border-white/[0.1] transition-all duration-300 group"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={20} className={item.accent} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-white font-semibold text-base leading-tight">{item.title}</h3>
                      <span className="text-white/15 font-display text-2xl font-bold select-none flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-white/45 leading-relaxed text-sm mt-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning card */}
            <div className="relative mb-12">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent" />
              <div className="relative bg-[#1a1500] border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-semibold mb-2">Important</h3>
                    <p className="text-white/45 text-sm leading-relaxed">
                      Toute réservation effectuée par une personne de <strong className="text-white/70">moins de 35 ans</strong> sera automatiquement refusée.
                      En cas de fausse déclaration d'âge, la réservation sera annulée <strong className="text-white/70">sans remboursement</strong> de l'acompte.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider-gold mb-12" />

            {/* CTA */}
            <div className="text-center">
              <p className="text-white/30 text-sm mb-6">Vous avez pris connaissance de nos conditions ?</p>
              <Link href="/reservation" className="btn-gold px-10 py-4 text-base">
                Réserver maintenant
                <ArrowRight size={16} />
              </Link>
              <p className="text-white/20 text-xs mt-4">Sans caution • Confirmation WhatsApp • {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
