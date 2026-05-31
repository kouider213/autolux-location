import Link from 'next/link';
import Head from 'next/head';
import { Car, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Head><title>Page introuvable — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-5 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="relative w-24 h-24 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center">
            <Car size={40} className="text-gold-400/60" />
          </div>
        </div>
        <p className="font-display text-8xl font-black text-gold-500/20 mb-4 leading-none">404</p>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-white/35 text-sm max-w-xs mb-10 font-body leading-relaxed">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-gold px-8 py-3"><Home size={16} />Accueil</Link>
          <Link href="/cars" className="btn-outline px-8 py-3"><Car size={15} />Nos véhicules</Link>
        </div>
      </div>
    </>
  );
}
