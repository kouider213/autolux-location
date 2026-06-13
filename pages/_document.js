import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Microsoft Clarity — heatmaps + session recordings */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","wzu6j89axc");
        `}} />
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
          areaServed: [
            { '@type': 'City', name: 'Oran' },
            { '@type': 'Country', name: 'Algérie' },
          ],
          address: { '@type': 'PostalAddress', addressLocality: 'Oran', postalCode: '31000', addressRegion: 'Oran', addressCountry: 'DZ', streetAddress: 'Oran' },
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
            'https://share.google/N4itFBIAR9Z1JX8Aw',
          ],
        }) }} />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script src="/widget.js" async />
      </body>
    </Html>
  );
}
