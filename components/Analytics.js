import Script from 'next/script';

// Pixels analytics/pub. Ne chargent QUE si la variable d'env correspondante existe.
// GA4  : NEXT_PUBLIC_GA_ID        (ex. G-XXXXXXX)
// Meta : NEXT_PUBLIC_FB_PIXEL_ID  (ex. 1234567890)
// Sans ces variables, rien n'est injecté → zéro impact, site inchangé.
export default function Analytics() {
  const GA = process.env.NEXT_PUBLIC_GA_ID;
  const FB = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <>
      {GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA}', { anonymize_ip: true });
          `}</Script>
        </>
      )}

      {FB && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
