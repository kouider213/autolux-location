import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head />
      <body>
        <Main />
        <NextScript />
        <script
          src="https://ibrahim-backend-production.up.railway.app/api/widget/embed.js"
          async
        />
      </body>
    </Html>
  );
}