import Head from 'next/head';
import Link from 'next/link';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLang } from '../lib/i18n';
import { getPublishedPosts, pickTitle, pickExcerpt } from '../lib/blog';

export default function BlogPage({ posts }) {
  const { t, lang } = useLang();
  const list = posts || [];

  return (
    <>
      <Head>
        <title>{t('blog.meta_title')}</title>
        <meta name="description" content={t('blog.meta_desc')} />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        <div className="relative pt-28 pb-14 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">{t('blog.badge')}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
              {t('blog.t1')} <span className="text-gold-gradient italic">{t('blog.t2')}</span>
            </h1>
            <p className="text-white/35 mt-5 max-w-xl mx-auto leading-relaxed">{t('blog.sub')}</p>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-5xl mx-auto">
            {list.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6"><Newspaper size={32} className="text-gold-400" /></div>
                <p className="text-white/40">{t('blog.empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map(p => (
                  <Link key={p.id} href={`/blog/${p.slug}`}
                    className="group bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-gold-500/25 hover:-translate-y-1.5 transition-all duration-300">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={pickTitle(p, lang)} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-[#111] flex items-center justify-center"><Newspaper size={28} className="text-white/[0.06]" /></div>
                      )}
                    </div>
                    <div className="p-5">
                      {p.created_at && <span className="flex items-center gap-1.5 text-white/30 text-xs mb-2"><Calendar size={11} /> {new Date(p.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>}
                      <h2 className="text-white font-bold text-base leading-snug mb-2 line-clamp-2">{pickTitle(p, lang)}</h2>
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{pickExcerpt(p, lang)}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-gold-400 text-sm font-medium">{t('blog.read')} <ArrowRight size={13} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const posts = await getPublishedPosts();
  return { props: { posts }, revalidate: 30 };
}
