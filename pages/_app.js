import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackPageView } from '../lib/tracker';
import { LangProvider } from '../lib/i18n';
import AnnouncementBanner from '../components/AnnouncementBanner';
import CookieBanner from '../components/CookieBanner';

const Toaster = dynamic(() => import('react-hot-toast').then(mod => mod.Toaster), { ssr: false });

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Track initial page
    trackPageView(router.pathname);
    // Track on route change
    const handleRouteChange = (url) => trackPageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, []);

  // Chatbot retiré : le site présente déjà toutes les infos (location, vente,
  // immo, conditions, FAQ, contact WhatsApp). Plus de bulle d'assistance.
  // Si on veut le réactiver un jour : recharger le script du widget ici.
  useEffect(() => {
    const widget = document.getElementById('ibr-widget-root') || document.querySelector('[id^="ibr-"]');
    if (widget) widget.remove();
    const script = document.getElementById('ibr-widget-script');
    if (script) script.remove();
  }, [router.pathname]);

    return (
          <>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#080808" />
              <link rel="manifest" href="/manifest.json" />
              <link rel="apple-touch-icon" href="/icons/icon-192.png" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              {/* SEO de base */}
              <meta name="description" content="Fik Conciergerie — Location de voitures, vente de véhicules et immobilier à Oran, Algérie. Sans caution, kilométrage illimité, 7j/7. Réservation par WhatsApp." />
              <meta name="keywords" content="location voiture Oran, louer voiture Algérie, vente voiture Oran, immobilier Oran, location auto Oran, Fik Conciergerie, voiture occasion Algérie, importer voiture Algérie" />
              <meta name="author" content="Fik Conciergerie" />
              <meta name="robots" content="index, follow" />
              <link rel="canonical" href={`https://autolux-location.vercel.app${router.asPath === '/' ? '' : router.asPath.split('?')[0]}`} />
              {/* hreflang FR/AR — même URL, langue bascule côté client */}
              <link rel="alternate" hrefLang="fr" href={`https://autolux-location.vercel.app${router.asPath === '/' ? '' : router.asPath.split('?')[0]}`} />
              <link rel="alternate" hrefLang="ar" href={`https://autolux-location.vercel.app${router.asPath === '/' ? '' : router.asPath.split('?')[0]}`} />
              <link rel="alternate" hrefLang="x-default" href={`https://autolux-location.vercel.app${router.asPath === '/' ? '' : router.asPath.split('?')[0]}`} />
              {/* Géolocalisation Oran (SEO local) */}
              <meta name="geo.region" content="DZ-31" />
              <meta name="geo.placename" content="Oran" />
              <meta name="geo.position" content="35.6976;-0.6369" />
              <meta name="ICBM" content="35.6976, -0.6369" />
              {/* Open Graph — partage WhatsApp/Facebook/Instagram */}
              <meta property="og:type"        content="website" />
              <meta property="og:site_name"   content="Fik Conciergerie" />
              <meta property="og:title"       content="Fik Conciergerie — Location, Vente & Immobilier à Oran" />
              <meta property="og:description" content="Location de voitures sans caution, véhicules à vendre et immobilier à Oran. Kilométrage illimité, 7j/7. Réservez par WhatsApp." />
              <meta property="og:url"         content="https://autolux-location.vercel.app" />
              <meta property="og:image"       content="https://autolux-location.vercel.app/logo.png" />
              <meta property="og:locale"      content="fr_FR" />
              <meta property="og:locale:alternate" content="ar_DZ" />
              {/* Twitter Card */}
              <meta name="twitter:card"        content="summary_large_image" />
              <meta name="twitter:title"       content="Fik Conciergerie — Location Premium Oran" />
              <meta name="twitter:description" content="Location de voitures premium à Oran. Sans caution. 7j/7." />
              <meta name="twitter:image"       content="https://autolux-location.vercel.app/logo.png" />
              {/* JSON-LD — Google comprend que c'est une entreprise locale */}
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'AutoRental',
                name: 'Fik Conciergerie',
                description: 'Location de voitures, vente de véhicules et immobilier à Oran, Algérie.',
                url: 'https://autolux-location.vercel.app',
                logo: 'https://autolux-location.vercel.app/logo.png',
                image: 'https://autolux-location.vercel.app/logo.png',
                telephone: '+32466311469',
                priceRange: '€€',
                address: { '@type': 'PostalAddress', addressLocality: 'Oran', addressRegion: 'Oran', addressCountry: 'DZ', streetAddress: 'Hay Badr' },
                geo: { '@type': 'GeoCoordinates', latitude: 35.6976, longitude: -0.6369 },
                areaServed: { '@type': 'City', name: 'Oran' },
                openingHours: 'Mo-Su 00:00-23:59',
                sameAs: [],
              }) }} />
              <title>Fik Conciergerie — Location, Vente & Immobilier à Oran</title>
      </Head>
        <LangProvider>
          {!router.pathname.startsWith('/admin') && <AnnouncementBanner />}
          <Component {...pageProps} />
          {!router.pathname.startsWith('/admin') && <CookieBanner />}
        </LangProvider>
        <Toaster
          position="top-right"
          toastOptions={{
                      style: {
                                    background: '#1e1e1e',
                                    color: '#f0f0f0',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontFamily: 'DM Sans, sans-serif',
                      },
                      success: { iconTheme: { primary: '#e2b614', secondary: '#141414' } },
                      error: { iconTheme: { primary: '#ef4444', secondary: '#141414' } },
          }}
      />
  </>
  );
}