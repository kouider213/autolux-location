// Send notification to Dzaryx (Ibrahim AI backend)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;
  const DZARYX_URL = process.env.DZARYX_NOTIFY_URL || 'https://ibrahim-backend-production.up.railway.app';

  let message = '';

  if (type === 'new_booking') {
    message = [
      `🚗 *Nouvelle réservation — Fik Conciergerie*`,
      ``,
      `Véhicule: ${data.car_name}`,
      `Client: ${data.client_name} · ${data.client_phone}`,
      `Âge: ${data.client_age} ans`,
      `Dates: ${data.start_date} → ${data.end_date}`,
      `Total: ${data.total}€`,
      data.notes ? `Notes: ${data.notes}` : null,
    ].filter(Boolean).join('\n');
  }

  if (type === 'new_review') {
    message = `⭐ Nouvel avis de ${data.client_name} (${data.rating}/5): "${data.comment}"`;
  }

  if (type === 'booking_status') {
    message = `📋 Réservation #${data.id?.substring(0,8)} → statut: ${data.status} (${data.car_name} / ${data.client_name})`;
  }

  try {
    // Notify Dzaryx via Ibrahim backend
    const resp = await fetch(`${DZARYX_URL}/api/dzaryx/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type, data }),
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) throw new Error(`Dzaryx responded ${resp.status}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    // Non-critical — log but don't fail
    console.error('Dzaryx notify error:', err.message);
    res.status(200).json({ ok: true, warn: err.message });
  }
}
