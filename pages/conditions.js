import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { getConditions, DEFAULT_CONDITIONS } from '../lib/conditions';

const SECTION_STYLE = {
  rental: { titleKey: 'cd.sec_rental', dot: 'bg-gold-500',    bullet: 'bg-gold-500/60' },
  sale:   { titleKey: 'cd.sec_sale',   dot: 'bg-purple-400',  bullet: 'bg-purple-400/60' },
  immo:   { titleKey: 'cd.sec_immo',   dot: 'bg-blue-400',    bullet: 'bg-blue-400/60' },
  owner:  { titleKey: 'cd.sec_owner',  dot: 'bg-gold-500',    bullet: 'bg-gold-500/60' },
};

export default function ConditionsPage() {
  const { t, lang } = useLang();
  const [cond, setCond] = useState(DEFAULT_CONDITIONS);

  useEffect(() => { getConditions().then(setCond); }, []);

  const pick = (item) => (lang === 'ar' ? (item.text_ar || item.text_fr) : (item.text_fr || item.text_ar)) || '';
  const intro = (cond.intro && cond.intro[0]) ? pick(cond.intro[0]) : t('cd.intro_d');

  return (
    <>
      <Head>
        <title>Conditions — Fik Conciergerie</title>
        <meta name="description" content="Conditions générales Fik Conciergerie : location, vente, immobilier. Tout passe par WhatsApp." />
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
            <p className="text-white/35 mt-5 max-w-xl mx-auto leading-relaxed">{t('cd.sub')}</p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-3xl mx-auto">

            {/* Intro WhatsApp (éditable) */}
            <div className="relative mb-12">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#25D366]/20 via-[#25D366]/5 to-transparent" />
              <div className="relative bg-[#0d1510] border border-[#25D366]/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-11 h-11 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1.5">{t('cd.intro_t')}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{intro}</p>
                </div>
              </div>
            </div>

            {/* Sections (éditables depuis l'admin) */}
            {['rental', 'sale', 'immo', 'owner'].map(secKey => {
              const items = cond[secKey] || [];
              if (items.length === 0) return null;
              const st = SECTION_STYLE[secKey];
              return (
                <div key={secKey}>
                  <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className={`w-1 h-5 ${st.dot} rounded-full`} />{t(st.titleKey)}
                  </h2>
                  <div className="card-dark p-6 mb-12">
                    <ul className="space-y-3">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`mt-1.5 w-1.5 h-1.5 ${st.bullet} rounded-full flex-shrink-0`} />
                          <span className="text-white/55 text-sm leading-relaxed">{pick(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {/* Warning âge */}
            <div className="relative mb-12">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent" />
              <div className="relative bg-[#1a1500] border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-semibold mb-2">{t('cd.important')}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{t('cd.important_d')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider-gold mb-12" />

            {/* CTA */}
            <div className="text-center">
              <p className="text-white/30 text-sm mb-6">{t('cd.cta_q')}</p>
              <Link href="/reservation" className="btn-gold px-10 py-4 text-base">
                {t('nav.book_now')}<ArrowRight size={16} />
              </Link>
              <p className="text-white/20 text-xs mt-4">Sans caution • WhatsApp • {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
