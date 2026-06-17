import { supabase } from '../lib/supabase';

const BASE = 'https://fikconciergerie.com';

function SitemapXML() { return null; }

export async function getServerSideProps({ res }) {
  let carIds = [], saleIds = [], immoIds = [], blogSlugs = [], packIds = [];
  try {
    if (supabase) {
      const [cars, sale, immo, blog, packs] = await Promise.all([
        supabase.from('cars').select('id').eq('available', true),
        supabase.from('vehicles_for_sale').select('id').neq('status', 'vendu'),
        supabase.from('properties').select('id').neq('status', 'vendu').neq('status', 'loue'),
        supabase.from('blog_posts').select('slug').eq('published', true),
        supabase.from('packs').select('id'),
      ]);
      carIds    = (cars.data  || []).map(c => c.id);
      saleIds   = (sale.data  || []).map(v => v.id);
      immoIds   = (immo.data  || []).map(p => p.id);
      blogSlugs = (blog.data  || []).map(b => b.slug);
      packIds   = (packs.data || []).map(p => p.id);
    }
  } catch { /* non-blocking */ }

  const staticPages = ['', '/cars', '/vente-voitures', '/immo', '/packs', '/entreprises', '/investir', '/commande-vehicule', '/reservation', '/mes-reservations', '/reviews', '/conditions', '/faq', '/blog', '/contact', '/a-propos', '/cgv', '/mentions-legales', '/confidentialite', '/conciergerie-oran', '/location-voiture-oran', '/vente-voiture-oran', '/immobilier-oran', '/location-voiture-aeroport-oran', '/importation-voiture-algerie', '/vente-voiture-occasion-oran'];
  const carPages    = carIds.map(id => `/cars/${id}`);
  const salePages   = saleIds.map(id => `/vente-voitures/${id}`);
  const immoPages   = immoIds.map(id => `/immo/${id}`);
  const blogPages   = blogSlugs.map(s => `/blog/${s}`);
  const packPages   = packIds.map(id => `/packs/${id}`);
  const allPages    = [...staticPages, ...carPages, ...salePages, ...immoPages, ...packPages, ...blogPages];

  const prio = (page) => {
    if (page === '') return '1.0';
    if (/-oran$/.test(page)) return '0.9'; // pages SEO métier
    if (/^\/(cars|vente-voitures|immo|blog)\//.test(page)) return '0.8';
    return '0.7';
  };

  // hreflang FR/AR (même URL, langue gérée côté client)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${BASE}${page}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}${page}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE}${page}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${page}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${page}" />
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${prio(page)}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default SitemapXML;
