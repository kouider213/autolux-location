import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Calendar, MessageCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShareButtons from '../../components/ShareButtons';
import { useLang } from '../../lib/i18n';
import { useSettings, waNumber } from '../../lib/settings';
import { getPublishedPosts, getPostBySlug, pickTitle, pickBody, pickExcerpt } from '../../lib/blog';

const BASE = 'https://autolux-location.vercel.app';

export default function BlogPost({ post }) {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());

  if (!post) {
    return (
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen text-center px-5">
          <div>
            <p className="text-white/50 mb-4">{t('blog.notfound')}</p>
            <Link href="/blog" className="text-gold-400 hover:text-gold-300 text-sm">← {t('blog.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const title = pickTitle(post, lang);
  const body  = pickBody(post, lang);
  const excerpt = pickExcerpt(post, lang);
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Head>
        <title>{title} — Fik Conciergerie</title>
        <meta name="description" content={excerpt || title} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt || title} />
        {post.cover_url && <meta property="og:image" content={post.cover_url} />}
        <link rel="canonical" href={`${BASE}/blog/${post.slug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BlogPosting',
          headline: title, description: excerpt || title,
          image: post.cover_url || `${BASE}/logo.png`,
          datePublished: post.created_at, dateModified: post.updated_at || post.created_at,
          author: { '@type': 'Organization', name: 'Fik Conciergerie' },
          publisher: { '@type': 'Organization', name: 'Fik Conciergerie', logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` } },
          mainEntityOfPage: `${BASE}/blog/${post.slug}`,
        }) }} />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        <article className="pt-24 pb-24 px-5">
          <div className="max-w-2xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/40 hover:text-gold-400 text-sm mb-6 transition-colors">
              <ArrowLeft size={14} /> {t('blog.back')}
            </Link>

            {post.created_at && <span className="flex items-center gap-1.5 text-white/30 text-xs mb-3"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{title}</h1>

            <div className="mb-6"><ShareButtons url={`${BASE}/blog/${post.slug}`} title={title} /></div>

            {post.cover_url && (
              <div className="rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
                <img src={post.cover_url} alt={title} className="w-full object-cover" />
              </div>
            )}

            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-white/65 text-base leading-relaxed whitespace-pre-line">{p}</p>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
              <p className="text-white/40 text-sm mb-5">{t('blog.cta')}</p>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 px-8 rounded-xl transition-all">
                <MessageCircle size={17} /> {t('blog.cta_btn')}
              </a>
            </div>
          </div>
        </article>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { props: { post: null }, revalidate: 30 };
  return { props: { post }, revalidate: 30 };
}
