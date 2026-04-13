import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact — Fik Conciergerie</title>
        <meta name="description" content="Contactez Fik Conciergerie à Oran. WhatsApp, adresse et horaires d'ouverture 24h/24 7j/7." />
      </Head>
      <div className="grain min-h-screen bg-noir-950">
        <Navbar />
        <div className="pt-28 pb-24 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-14">
              <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Nous trouver</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3">Contactez-nous</h1>
              <p className="text-white/40 mt-4 max-w-xl mx-auto leading-relaxed">
                Notre équipe est disponible 24h/24, 7j/7 pour répondre à toutes vos questions.
              </p>
            </div>

            {/* Cartes contact */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">

              {/* WhatsApp */}
              <a
                href="https://wa.me/32466311469"
                target="_blank"
                rel="noopener noreferrer"
                className="card-dark p-6 flex flex-col items-center text-center gap-4 hover:border-gold-500/30 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  💬
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">WhatsApp</h3>
                  <p className="text-gold-500 font-medium">+32 466 31 14 69</p>
                  <p className="text-white/40 text-sm mt-1">Réponse immédiate</p>
                </div>
              </a>

              {/* Adresse */}
              <a
                href="https://maps.google.com/maps?q=M8GM%2BQMV+Oran+Algeria"
                target="_blank"
                rel="noopener noreferrer"
                className="card-dark p-6 flex flex-col items-center text-center gap-4 hover:border-gold-500/30 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  📍
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Adresse</h3>
                  <p className="text-gold-500 font-medium">M8GM+QMV</p>
                  <p className="text-white/40 text-sm mt-1">Oran, Algérie</p>
                </div>
              </a>

              {/* Horaires */}
              <div className="card-dark p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  🕐
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Horaires</h3>
                  <p className="text-gold-500 font-medium">24h/24 — 7j/7</p>
                  <p className="text-white/40 text-sm mt-1">Toujours disponible</p>
                </div>
              </div>
            </div>

            {/* Carte Google Maps */}
            <div className="card-dark overflow-hidden mb-10">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Notre localisation</h2>
                <a
                  href="https://maps.google.com/maps?q=M8GM%2BQMV+Oran+Algeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-xs py-2 px-4"
                >
                  📍 Ouvrir dans GPS
                </a>
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                <iframe
                  src="https://maps.google.com/maps?q=M8GM%2BQMV+Oran+Algeria&output=embed&z=16"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Fik Conciergerie localisation"
                />
              </div>
            </div>

            {/* Note horaires */}
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-2xl p-6 mb-10">
              <h3 className="text-gold-400 font-semibold mb-2">⏰ Disponibilité</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Nous sommes disponibles <strong className="text-white">24h/24 et 7j/7</strong>, y compris les jours fériés. 
                Pour toute réservation ou question, contactez-nous directement sur WhatsApp pour une réponse immédiate.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="https://wa.me/32466311469"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-10 py-4 text-base inline-block"
              >
                💬 Nous contacter sur WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
              }
