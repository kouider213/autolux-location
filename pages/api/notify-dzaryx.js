// Webhook → Ibrahim backend (Railway) — notifie Dzaryx en temps réel
// Appelé sur: nouvelle réservation, nouvel avis, changement statut

const IBRAHIM_BACKEND = process.env.IBRAHIM_BACKEND_URL || 'https://ibrahim-backend-production.up.railway.app';
// Failover : si Railway est mort, on notifie le backend backup (Render)
// IBRAHIM_BACKEND_BACKUPS="https://xxx.onrender.com" (séparés par virgule)
const BACKENDS = [IBRAHIM_BACKEND, ...(process.env.IBRAHIM_BACKEND_BACKUPS || '').split(',').map(s => s.trim()).filter(Boolean)];
const WEBHOOK_SECRET  = process.env.IBRAHIM_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;

  try {
    if (!WEBHOOK_SECRET) {
      console.warn('[notify-dzaryx] IBRAHIM_WEBHOOK_SECRET manquant — skip notification');
      return res.status(200).json({ ok: true, skipped: true });
    }

    let lastStatus = null;
    for (const backend of BACKENDS) {
      try {
        const response = await fetch(`${backend}/api/fik-site/notify`, {
          method:  'POST',
          headers: {
            'Content-Type':     'application/json',
            'x-webhook-secret': WEBHOOK_SECRET,
          },
          body: JSON.stringify({ type, data }),
          signal: AbortSignal.timeout(8000),
        });
        if (response.ok) return res.status(200).json({ ok: true });
        lastStatus = response.status;
        const err = await response.text().catch(() => 'unknown');
        console.error(`[notify-dzaryx] ${backend} responded ${response.status}: ${err}`);
        // 5xx = backend mort → backup ; 4xx = inutile de retenter ailleurs
        if (response.status < 500) break;
      } catch (err) {
        console.error(`[notify-dzaryx] ${backend} unreachable: ${err.message}`);
        lastStatus = 'network';
      }
    }
    res.status(200).json({ ok: true, backend_error: lastStatus }); // non-bloquant
  } catch (err) {
    // Non-bloquant — ne pas bloquer le site si Ibrahim est down
    console.error('[notify-dzaryx] Error:', err.message);
    res.status(200).json({ ok: true, error: err.message });
  }
}
