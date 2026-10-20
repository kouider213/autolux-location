import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Robots (Google, aperçus WhatsApp/Facebook, lecteurs automatiques, navigateurs pilotés par un programme)
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|jina|python|axios|node-fetch|curl|wget|puppeteer|playwright|selenium|phantom|facebookexternalhit|whatsapp|telegram|vercel|monitor|uptime|scanner|bing|yandex|semrush|ahrefs/i;
// Nos machines : le serveur Dzaryx / PC cloud (+ FIK_OWNER_IPS séparées par des virgules)
const OUR_IPS = new Set(['45.9.190.54', ...(process.env.FIK_OWNER_IPS || '').split(',').map(s => s.trim()).filter(Boolean)]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { page, referrer, device, session_id, car_id, owner, webdriver } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  const ua = String(req.headers['user-agent'] || '').slice(0, 300);
  // visitor : 'visiteur' (vrai visiteur), 'nous' (équipe FIK / Dzaryx) ou 'robot'
  const visitor = OUR_IPS.has(ip) || owner === true || /^\/admin(\/|$)/.test(page || '') ? 'nous'
    : webdriver === true || !ua || BOT_RE.test(ua) ? 'robot' : 'visiteur';
  // Empreinte de l'adresse IP (jamais l'IP en clair) : un autre appareil sur le même wifi que nous = nous aussi
  const ip_hash = ip ? createHash('sha256').update(`fik|${ip}`).digest('hex').slice(0, 16) : null;

  // Pays / ville : donnés par Vercel (en-têtes x-vercel-ip-*), sinon ipapi.co
  let country = null, city = null;
  try {
    const cc = req.headers['x-vercel-ip-country'];
    if (cc) country = new Intl.DisplayNames(['fr'], { type: 'region' }).of(String(cc)) || String(cc);
    if (req.headers['x-vercel-ip-city']) city = decodeURIComponent(String(req.headers['x-vercel-ip-city']));
  } catch { /* non-blocking */ }
  try {
    if (!country && visitor === 'visiteur' && ip && ip !== '::1' && ip !== '127.0.0.1') {
      const geo = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(2000) });
      if (geo.ok) {
        const geoData = await geo.json();
        country = geoData.country_name || null;
        city    = geoData.city || null;
      }
    }
  } catch { /* non-blocking */ }

  try {
    // Track page view
    const row = { page, referrer: referrer || null, device: device || 'unknown', country, city, session_id: session_id || null };
    const { error } = await supabase.from('page_views').insert([{ ...row, visitor, ip_hash, ua }]);
    // Colonnes pas encore créées (Dzaryx les ajoute à son démarrage) : on garde au moins la visite
    if (error) await supabase.from('page_views').insert([row]);

    // Track car view if car_id provided
    if (car_id && visitor === 'visiteur') {
      await supabase.from('car_views').insert([{
        car_id, device: device || 'unknown', country,
      }]);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
