import { supabase } from '../lib/supabase';

const BASE = 'https://autolux-location.vercel.app';

function SitemapXML() { return null; }

export async function getServerSideProps({ res }) {
  let carIds = [];
  try {
    if (supabase) {
      const { data } = await supabase.from('cars').select('id').eq('available', true);
      carIds = (data || []).map(c => c.id);
    }
  } catch { /* non-blocking */ }

  const staticPages = ['', '/cars', '/reservation', '/reviews', '/conditions', '/contact'];
  const carPages    = carIds.map(id => `/cars/${id}`);
  const allPages    = [...staticPages, ...carPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE}${page}</loc>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/cars/') ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default SitemapXML;
