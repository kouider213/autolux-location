// Webhook → Ibrahim backend (Railway) — notifie Dzaryx en temps réel
// Appelé sur: nouvelle réservation, nouvel avis, changement statut

const IBRAHIM_BACKEND = process.env.IBRAHIM_BACKEND_URL || 'https://ibrahim-backend-production.up.railway.app';
const WEBHOOK_SECRET  = process.env.IBRAHIM_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;

  try {
    if (!WEBHOOK_SECRET) {
      console.warn('[notify-dzaryx] IBRAHIM_WEBHOOK_SECRET manquant — skip notification');
      return res.status(200).json({ ok: true, skipped: true });
    }

    const response = await fetch(`${IBRAHIM_BACKEND}/api/fik-site/notify`, {
      method:  'POST',
      headers: {
        'Content-Type':     'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({ type, data }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => 'unknown');
      console.error(`[notify-dzaryx] Backend responded ${response.status}: ${err}`);
      return res.status(200).json({ ok: true, backend_error: response.status }); // non-bloquant
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    // Non-bloquant — ne pas bloquer le site si Ibrahim est down
    console.error('[notify-dzaryx] Error:', err.message);
    res.status(200).json({ ok: true, error: err.message });
  }
}
