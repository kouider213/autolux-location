import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackPageView } from '../lib/tracker';

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

  useEffect(() => {
    // Don't load widget on admin pages
    if (router.pathname.startsWith('/admin')) return;
    if (document.getElementById('ibr-widget-script')) return;
    const s = document.createElement('script');
    s.id = 'ibr-widget-script';
    s.src = 'https://ibrahim-backend-production.up.railway.app/api/widget/embed.js';
    s.async = true;
    document.body.appendChild(s);
  }, [router.pathname]);

  // Hide widget on admin pages (handles navigation after initial load)
  useEffect(() => {
    const widget = document.getElementById('ibr-widget-root') || document.querySelector('[id^="ibr-"]');
    if (widget) widget.style.display = router.pathname.startsWith('/admin') ? 'none' : '';
  }, [router.pathname]);

    return (
          <>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
              <meta name="theme-color" content="#e2b614" />
              <link rel="manifest" href="/manifest.json" />
              <link rel="apple-touch-icon" href="/icons/icon-192.png" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              {/* Open Graph — partage WhatsApp/Facebook/Instagram */}
              <meta property="og:type"        content="website" />
              <meta property="og:site_name"   content="Fik Conciergerie" />
              <meta property="og:title"       content="Fik Conciergerie — Location de Véhicules Premium Oran" />
              <meta property="og:description" content="Location de voitures premium à Oran. Sans caution. Réservation rapide 7j/7. Citadines, SUV, berlines." />
              <meta property="og:url"         content="https://autolux-location.vercel.app" />
              <meta property="og:locale"      content="fr_FR" />
              {/* Twitter Card */}
              <meta name="twitter:card"        content="summary_large_image" />
              <meta name="twitter:title"       content="Fik Conciergerie — Location Premium Oran" />
              <meta name="twitter:description" content="Location de voitures premium à Oran. Sans caution. 7j/7." />
              <title>Fik Conciergerie</title>
      </Head>
        <Component {...pageProps} />
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