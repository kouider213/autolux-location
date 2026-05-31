import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { page, referrer, device, session_id, car_id } = req.body;

  // Detect country via ipapi.co (free, no key needed)
  let country = null, city = null;
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
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
    await supabase.from('page_views').insert([{
      page, referrer: referrer || null, device: device || 'unknown',
      country, city, session_id: session_id || null,
    }]);

    // Track car view if car_id provided
    if (car_id) {
      await supabase.from('car_views').insert([{
        car_id, device: device || 'unknown', country,
      }]);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
