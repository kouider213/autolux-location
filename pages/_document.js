import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Microsoft Clarity : chargé uniquement APRÈS consentement cookies (RGPD + perf) — voir components/CookieBanner.js */}
        {/* JSON-LD entreprise locale — identité Google + rich snippets */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': ['AutoRental', 'LocalBusiness'],
          '@id': 'https://fikconciergerie.com/#organization',
          name: 'Fik Conciergerie',
          alternateName: ['Fikconciergerie', 'Fik Conciergerie Oran'],
          description: 'Conciergerie premium à Oran : location et vente de véhicules, immobilier, packs séjour, importation de véhicules. Sans caution, 7j/7.',
          slogan: 'Conciergerie Premium à Oran',
          url: 'https://fikconciergerie.com',
          logo: 'https://fikconciergerie.com/logo.png',
          image: 'https://fikconciergerie.com/logo.png',
          telephone: '+32466311469',
          email: 'Fikconciergerie@gmail.com',
          areaServed: [
            { '@type': 'City', name: 'Oran' },
            { '@type': 'Country', name: 'Algérie' },
          ],
          address: { '@type': 'PostalAddress', streetAddress: 'Rue Derbouz Draoua, Houari', addressLocality: 'Oran', postalCode: '31300', addressRegion: 'Oran', addressCountry: 'DZ' },
          geo: { '@type': 'GeoCoordinates', latitude: 35.6976, longitude: -0.6369 },
          knowsLanguage: ['fr', 'ar', 'en'],
          priceRange: '€€',
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00', closes: '23:59',
          },
          makesOffer: [
            { '@type': 'Offer', name: 'Location de voiture à Oran' },
            { '@type': 'Offer', name: 'Vente de voiture à Oran' },
            { '@type': 'Offer', name: 'Importation de véhicule' },
            { '@type': 'Offer', name: 'Immobilier à Oran (location & vente)' },
            { '@type': 'Offer', name: 'Packs séjour à Oran' },
          ],
          sameAs: [
            'https://www.instagram.com/fik_conciergerie',
            'https://www.facebook.com/share/1KLWrMo7GW/',
            'https://www.tiktok.com/@fik_conciergerie',
            'https://maps.app.goo.gl/RGrRY3mUDy8MfQNv5',
          ],
        }) }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
