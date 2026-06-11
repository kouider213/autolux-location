import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

// Gabarit commun des pages légales / institutionnelles (typo lisible, dark/gold).
export default function LegalPage({ title, subtitle, updated, children }) {
  return (
    <>
      <Head>
        <title>{title} — Fik Conciergerie</title>
        <meta name="description" content={subtitle || title} />
      </Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-3xl mx-auto">
          <span className="section-badge mb-4 inline-block">Fik Conciergerie</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-white/40 text-sm mb-2">{subtitle}</p>}
          {updated && <p className="text-white/25 text-xs mb-8">Dernière mise à jour : {updated}</p>}
          <div className="legal-content space-y-6 mt-8">{children}</div>
        </div>
      </div>
      <Footer />
      <style jsx global>{`
        .legal-content h2 { color: #e9b949; font-size: 1.05rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: .5rem; }
        .legal-content p, .legal-content li { color: rgba(255,255,255,.55); font-size: .95rem; line-height: 1.7; }
        .legal-content ul { list-style: disc; padding-left: 1.3rem; }
        .legal-content li { margin-bottom: .4rem; }
        .legal-content strong { color: rgba(255,255,255,.85); }
        .legal-content a { color: #e9b949; }
      `}</style>
    </>
  );
}
