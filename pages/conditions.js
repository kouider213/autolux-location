import Head from 'next/head';
import Link from 'next/link';
import { Shield, CakeSlice, BookOpen, Wallet, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLang } from '../lib/i18n';

const CONDITIONS = [
  { icon: CakeSlice, tk: 'cd.c1t', dk: 'cd.c1d', accent: 'text-gold-400',    bg: 'bg-gold-500/10',    border: 'border-gold-500/20' },
  { icon: Shield,    tk: 'cd.c2t', dk: 'cd.c2d', accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: BookOpen,  tk: 'cd.c3t', dk: 'cd.c3d', accent: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { icon: Wallet,    tk: 'cd.c4t', dk: 'cd.c4d', accent: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
];

export default function ConditionsPage() {
  const { t } = useLang();
  return (
    <>
      <Head>
        <title>Conditions de Location — Fik Conciergerie</title>
        <meta name="description" content="Conditions générales de location Fik Conciergerie. Âge minimum 35 ans, sans caution, passeport conservé." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Header */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">{t('cd.badge')}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
              {t('cd.t1')} <span className="text-gold-gradient italic">{t('cd.t2')}</span>
            </h1>
            <p className="text-white/35 mt-5 max-w-xl mx-auto leading-relaxed">
              {t('cd.sub')}
            </p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-3xl mx-auto">

            {/* Intro WhatsApp */}
            <div className="relative mb-10">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#25D366]/20 via-[#25D366]/5 to-transparent" />
              <div className="relative bg-[#0d1510] border border-[#25D366]/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-11 h-11 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1.5">{t('cd.intro_t')}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{t('cd.intro_d')}</p>
                </div>
              </div>
            </div>

            {/* Section : Location voiture */}
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-gold-500 rounded-full" />{t('cd.sec_rental')}</h2>

            {/* Conditions list */}
            <div className="space-y-4 mb-12">
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
                      <h3 className="text-white font-semibold text-base leading-tight">{t(item.tk)}</h3>
                      <span className="text-white/15 font-display text-2xl font-bold select-none flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-white/45 leading-relaxed text-sm mt-2">{t(item.dk)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Section : Vente de véhicules */}
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-purple-400 rounded-full" />{t('cd.sec_sale')}</h2>
            <div className="card-dark p-6 mb-12">
              <ul className="space-y-3">
                {['cd.sale1','cd.sale2','cd.sale3','cd.sale4'].map(k => (
                  <li key={k} className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 bg-purple-400/60 rounded-full flex-shrink-0" /><span className="text-white/50 text-sm leading-relaxed">{t(k)}</span></li>
                ))}
              </ul>
            </div>

            {/* Section : Immobilier */}
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-blue-400 rounded-full" />{t('cd.sec_immo')}</h2>
            <div className="card-dark p-6 mb-12">
              <ul className="space-y-3">
                {['cd.immo1','cd.immo2','cd.immo3','cd.immo4'].map(k => (
                  <li key={k} className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 bg-blue-400/60 rounded-full flex-shrink-0" /><span className="text-white/50 text-sm leading-relaxed">{t(k)}</span></li>
                ))}
              </ul>
            </div>

            {/* Section : Propriétaires & vendeurs */}
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-gold-500 rounded-full" />{t('cd.sec_owner')}</h2>
            <div className="card-dark p-6 mb-12">
              <ul className="space-y-3">
                {['cd.owner1','cd.owner2','cd.owner3','cd.owner4'].map(k => (
                  <li key={k} className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 bg-gold-500/60 rounded-full flex-shrink-0" /><span className="text-white/50 text-sm leading-relaxed">{t(k)}</span></li>
                ))}
              </ul>
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
                    <h3 className="text-amber-400 font-semibold mb-2">{t('cd.important')}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">
                      {t('cd.important_d')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider-gold mb-12" />

            {/* CTA */}
            <div className="text-center">
              <p className="text-white/30 text-sm mb-6">{t('cd.cta_q')}</p>
              <Link href="/reservation" className="btn-gold px-10 py-4 text-base">
                {t('nav.book_now')}
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

