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
          '@type': 'AutoRental',
          name: 'Fik Conciergerie',
          description: 'Conciergerie premium à Oran : location et vente de véhicules, immobilier, packs séjour. Sans caution, 7j/7.',
          url: 'https://fikconciergerie.com',
          logo: 'https://fikconciergerie.com/logo.png',
          image: 'https://fikconciergerie.com/logo.png',
          areaServed: { '@type': 'City', name: 'Oran' },
          address: { '@type': 'PostalAddress', addressLocality: 'Oran', addressCountry: 'DZ', streetAddress: 'Hay Badr' },
          priceRange: '€€',
          openingHours: 'Mo-Su 07:00-23:00',
          sameAs: [],
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
