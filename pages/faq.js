import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import { getFaq, DEFAULT_FAQ } from '../lib/faq';

export default function FaqPage() {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [faq, setFaq] = useState(DEFAULT_FAQ);
  const [open, setOpen] = useState(0);

  useEffect(() => { getFaq().then(setFaq); }, []);

  const q = (item) => (lang === 'ar' ? (item.question_ar || item.question_fr) : (item.question_fr || item.question_ar)) || '';
  const a = (item) => (lang === 'ar' ? (item.answer_ar || item.answer_fr) : (item.answer_fr || item.answer_ar)) || '';

  return (
    <>
      <Head>
        <title>{t('faq.meta_title')}</title>
        <meta name="description" content={t('faq.meta_desc')} />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative max-w-3xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">{t('faq.badge')}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
              {t('faq.t1')} <span className="text-gold-gradient italic">{t('faq.t2')}</span>
            </h1>
            <p className="text-white/35 mt-5 max-w-xl mx-auto leading-relaxed">{t('faq.sub')}</p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-3xl mx-auto space-y-3">
            {faq.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.id ?? i} className="card-dark overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-start">
                    <span className="text-white font-semibold text-sm md:text-base">{q(item)}</span>
                    <ChevronDown size={18} className={`text-gold-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-white/55 text-sm leading-relaxed px-5 pb-5">{a(item)}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA */}
            <div className="text-center pt-10">
              <p className="text-white/30 text-sm mb-5">{t('faq.cta')}</p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 px-8 rounded-xl transition-all">
                <MessageCircle size={17} /> {t('faq.ask')}
              </a>
              <div className="mt-4">
                <Link href="/reservation" className="text-gold-400 hover:text-gold-300 text-sm inline-flex items-center gap-1">
                  {t('nav.book_now')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
