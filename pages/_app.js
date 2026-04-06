import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#e2b614" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>AutoLux Location</title>
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
