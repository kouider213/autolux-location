import Head from 'next/head';
import Link from 'next/link';
import { Check, MessageCircle, ArrowRight, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLang } from '../lib/i18n';
import { T } from '../lib/autoTranslate';
import { useSettings, waLink } from '../lib/settings';

const BASE = 'https://fikconciergerie.com';

// Page d'atterrissage SEO (1 mot-clé = 1 page). Contenu FR auto-traduit AR/EN via <T>.
export default function SeoLanding({
  slug, metaTitle, metaDesc, h1a, h1b, intro, bullets = [], why = [], faq = [],
  ctaPrimary, ctaSecondary, breadcrumbName, serviceType = 'Service',
}) {
  const { lang } = useLang();
  const settings = useSettings();
  const wa = (msg) => waLink(settings, msg);
  const [open, setOpen] = useState(0);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': serviceType,
        name: `${h1a} ${h1b}`.trim(),
        description: metaDesc,
        provider: { '@type': 'LocalBusiness', name: 'Fik Conciergerie', address: { '@type': 'PostalAddress', addressLocality: 'Oran', addressCountry: 'DZ' } },
        areaServed: { '@type': 'City', name: 'Oran' },
        url: `${BASE}/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE },
          { '@type': 'ListItem', position: 2, name: breadcrumbName, item: `${BASE}/${slug}` },
        ],
      },
      faq.length > 0 ? {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      } : null,
    ].filter(Boolean),
  };

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`${BASE}/${slug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
              <MapPin size={11} /> Oran, Algérie
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
              <T>{h1a}</T> <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic"><T>{h1b}</T></span>
            </h1>
            <p className="text-white/45 max-w-2xl mx-auto text-base leading-relaxed mb-8"><T>{intro}</T></p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {ctaPrimary && <Link href={ctaPrimary.href} className="inline-flex items-center gap-2 btn-gold py-3.5 px-7"><T>{ctaPrimary.label}</T> <ArrowRight size={15} /></Link>}
              {ctaSecondary && <a href={wa(ctaSecondary.wa)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold py-3.5 px-7 rounded-xl"><MessageCircle size={16} /> WhatsApp</a>}
            </div>
          </div>
        </div>

        <div className="pb-28 px-5">
          <div className="max-w-4xl mx-auto">

            {/* Bullets */}
            {bullets.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
                {bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#111]/80 border border-white/[0.07] rounded-2xl p-5">
                    <span className="w-7 h-7 shrink-0 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center"><Check size={14} className="text-gold-400" /></span>
                    <p className="text-white/60 text-sm leading-relaxed"><T>{b}</T></p>
                  </div>
                ))}
              </div>
            )}

            {/* Why / paragraphes */}
            {why.length > 0 && (
              <div className="space-y-5 mb-16">
                {why.map((w, i) => (
                  <div key={i}>
                    {w.h && <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-2"><T>{w.h}</T></h2>}
                    <p className="text-white/45 text-sm leading-relaxed"><T>{w.p}</T></p>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ */}
            {faq.length > 0 && (
              <div className="mb-16">
                <h2 className="font-display text-2xl font-bold text-white text-center mb-8"><T>Questions fréquentes</T></h2>
                <div className="space-y-2.5">
                  {faq.map((f, i) => (
                    <div key={i} className="bg-[#111]/70 border border-white/[0.07] rounded-2xl overflow-hidden">
                      <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-3 p-4 text-start">
                        <span className="text-white font-semibold text-sm"><T>{f.q}</T></span>
                        <ChevronDown size={16} className={`text-gold-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                      </button>
                      {open === i && <div className="px-4 pb-4 text-white/45 text-sm leading-relaxed"><T>{f.a}</T></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA final */}
            <div className="bg-gradient-to-br from-gold-500/[0.08] to-transparent border border-gold-500/15 rounded-3xl p-8 md:p-10 text-center">
              <h2 className="font-display text-2xl font-bold text-white mb-3"><T>Prêt à réserver ?</T></h2>
              <p className="text-white/45 text-sm mb-6"><T>Réponse rapide sur WhatsApp, 7j/7. Sans caution, papiers gérés sur place.</T></p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {ctaPrimary && <Link href={ctaPrimary.href} className="inline-flex items-center gap-2 btn-gold py-3 px-6"><T>{ctaPrimary.label}</T></Link>}
                {ctaSecondary && <a href={wa(ctaSecondary.wa)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl"><MessageCircle size={15} /> WhatsApp</a>}
              </div>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
