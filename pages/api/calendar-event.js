/**
 * API Route: /api/calendar-event
 * Crée un événement dans Google Calendar lors de l'acceptation d'une réservation.
 *
 * Variables d'environnement nécessaires (à ajouter dans Vercel) :
 *   GOOGLE_CLIENT_EMAIL  → email du compte de service Google
 *   GOOGLE_PRIVATE_KEY   → clé privée RSA (\n remplacés par sauts de ligne réels)
 *   GOOGLE_CALENDAR_ID   → ID du calendrier (ex: primary ou votre@gmail.com)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientName, clientPhone, carName, startDate, endDate, nbDays, finalPrice, notes } = req.body;
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = process.env;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    return res.status(503).json({
      error: 'Google Calendar non configuré',
      hint: 'Ajouter GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY et GOOGLE_CALENDAR_ID dans Vercel',
    });
  }

  try {
    const accessToken = await getGoogleAccessToken(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY);
    const total = (Number(finalPrice) * Number(nbDays)).toFixed(0);
    const eventEndDate = addOneDay(endDate);

    const event = {
      summary: `🚗 ${carName} — ${clientName}`,
      description: [
        `👤 Client : ${clientName}`,
        `📞 Téléphone : ${clientPhone}`,
        `🚗 Véhicule : ${carName}`,
        `⏱ Durée : ${nbDays} jour(s)`,
        `💰 Prix/jour : ${finalPrice} €`,
        `💵 Total : ${total} €`,
        notes ? `📝 Notes : ${notes}` : '',
      ].filter(Boolean).join('\n'),
      start: { date: startDate },
      end: { date: eventEndDate },
      colorId: '5',
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Erreur Google Calendar' });
    return res.status(200).json({ success: true, eventId: data.id, htmlLink: data.htmlLink });
  } catch (err) {
    console.error('Calendar error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function addOneDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function getGoogleAccessToken(clientEmail, privateKey) {
  const pem = privateKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));
  const signingInput = `${header}.${payload}`;
  const signature = await signRS256(signingInput, pem);
  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Token Google impossible: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

async function signRS256(input, pem) {
  const { webcrypto } = await import('crypto');
  const pemContents = pem.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\s/g, '');
  const binaryDer = Buffer.from(pemContents, 'base64');
  const cryptoKey = await webcrypto.subtle.importKey(
    'pkcs8', binaryDer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const encoder = new TextEncoder();
  const signature = await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(input));
  return Buffer.from(signature).toString('base64url');
}
