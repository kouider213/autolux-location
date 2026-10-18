import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { useSettings, waNumber } from '../lib/settings';
import { getFaq, DEFAULT_FAQ } from '../lib/faq';

export default function FaqPage() {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [faq, setFaq] = useState(DEFAULT_FAQ);
  const [open, setOpen] = useState(0);

  useEffect(() => { getFaq().then(setFaq); }, []);

  // Sources : arabe humain si présent (pour 'ar'), sinon français → traduit auto vers la langue courante
  const srcQ = faq.map((it) => (lang === 'ar' ? (it.question_ar || it.question_fr) : (it.question_fr || it.question_ar)) || '');
  const srcA = faq.map((it) => (lang === 'ar' ? (it.answer_ar || it.answer_fr) : (it.answer_fr || it.answer_ar)) || '');
  const trQ = useTranslated(srcQ);
  const trA = useTranslated(srcA);
  const q = (_item, i) => trQ[i] ?? srcQ[i] ?? '';
  const a = (_item, i) => trA[i] ?? srcA[i] ?? '';

  return (
    <>
      <Head>
        <title>{t('faq.meta_title')}</title>
        <meta name="description" content={t('faq.meta_desc')} />
        {faq.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((it) => ({
              '@type': 'Question',
              name: it.question_fr || it.question_ar || '',
              acceptedAnswer: { '@type': 'Answer', text: (it.answer_fr || it.answer_ar || '').replace(/<[^>]+>/g, '') },
            })).filter((x) => x.name && x.acceptedAnswer.text),
          }) }} />
        )}
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* PC : titre + encart contact collants à gauche, questions numérotées à droite ; téléphone/tablette : empilés */}
        <div className="relative px-5 md:px-10 pt-28 lg:pt-36 pb-24 overflow-x-clip">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14">
            <aside className="lg:col-span-4 text-center lg:text-start">
              <div className="lg:sticky lg:top-28">
                <span className="section-badge">{t('faq.badge')}</span>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mt-5 leading-tight">
                  {t('faq.t1')} <span className="text-gold-gradient italic">{t('faq.t2')}</span>
                </h1>
                <p className="text-white/50 mt-5 leading-relaxed max-w-xl mx-auto lg:mx-0">{t('faq.sub')}</p>
                <div className="hidden lg:block gold-frame rounded-3xl p-6 mt-10">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400 mb-4"><MessageCircle size={20} /></div>
                  <p className="text-white font-semibold mb-1">{t('faq.cta')}</p>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="btn-gold w-full py-3.5 text-sm justify-center mt-4"><MessageCircle size={16} /> {t('faq.ask')}</a>
                  <Link href="/reservation" className="mt-4 text-gold-400 hover:text-gold-300 text-sm inline-flex items-center gap-1">{t('nav.book_now')} <ArrowRight size={14} /></Link>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-8 space-y-3">
              {faq.map((item, i) => {
                const isOpen = open === i;
                return (
                  <div key={item.id ?? i} className={`rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'gold-frame' : 'bg-white/[0.02] border border-white/[0.07] hover:border-white/15'}`}>
                    <button onClick={() => setOpen(isOpen ? -1 : i)}
                      className="w-full flex items-center gap-4 p-5 md:p-6 text-start">
                      <span className={`font-display text-sm md:text-base font-bold w-8 flex-shrink-0 tabular-nums ${isOpen ? 'text-gold-400' : 'text-white/25'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 text-white font-semibold text-sm md:text-lg">{q(item, i)}</span>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-gold-500 text-black rotate-180' : 'bg-white/[0.05] text-gold-400'}`}><ChevronDown size={16} /></span>
                    </button>
                    <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="text-white/60 text-sm md:text-base leading-relaxed px-5 md:px-6 pb-6 ps-[4.25rem] md:ps-[4.75rem]">{a(item, i)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CTA téléphone/tablette */}
              <div className="lg:hidden gold-frame rounded-3xl p-6 text-center mt-8">
                <p className="text-white/70 text-sm mb-4">{t('faq.cta')}</p>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="btn-gold w-full sm:w-auto py-3.5 px-8 text-sm justify-center"><MessageCircle size={16} /> {t('faq.ask')}</a>
                <div className="mt-4">
                  <Link href="/reservation" className="text-gold-400 hover:text-gold-300 text-sm inline-flex items-center gap-1">{t('nav.book_now')} <ArrowRight size={14} /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
