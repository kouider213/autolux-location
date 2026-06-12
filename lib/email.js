// Envoi d'emails transactionnels via Resend (HTTP, gratuit ~3000/mois).
// Sans clé configurée → ne fait rien (jamais d'erreur bloquante).
// Config (Vercel env) : RESEND_API_KEY + RESEND_FROM="Fik Conciergerie <contact@tondomaine.com>"
const KEY  = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'Fik Conciergerie <onboarding@resend.dev>';

const wrap = (title, body) => `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#111;border-radius:14px 14px 0 0;padding:20px 24px">
      <div style="color:#e9b949;font-weight:800;font-size:18px;letter-spacing:.5px">FIK CONCIERGERIE</div>
      <div style="color:#888;font-size:12px">Oran, Algérie</div>
    </div>
    <div style="background:#fff;border:1px solid #eee;border-top:0;border-radius:0 0 14px 14px;padding:24px">
      <h1 style="font-size:18px;color:#111;margin:0 0 14px">${title}</h1>
      ${body}
      <p style="margin-top:24px;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:14px">
        Fik Conciergerie — Hay Badr, Oran · WhatsApp pour toute question.
      </p>
    </div>
  </div></body></html>`;

export async function sendEmail(to, subject, html) {
  if (!KEY || !to || !/@/.test(to)) return { skipped: true };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) { console.error('[email] resend', r.status, await r.text().catch(() => '')); return { error: true }; }
    return { ok: true };
  } catch (e) { console.error('[email]', e.message); return { error: true }; }
}

const money = (n, c) => `${Number(n || 0).toLocaleString('fr-FR')} ${c === 'DZD' || c === 'DA' ? 'DA' : '€'}`;
const row = (l, v) => `<tr><td style="padding:6px 0;color:#777;font-size:14px">${l}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#111;font-size:14px">${v}</td></tr>`;

// ── Templates ──────────────────────────────────────────────────
export function bookingReceivedEmail(b) {
  const html = wrap('Votre demande de réservation est bien reçue', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${b.client_name},<br/>Nous avons bien reçu votre demande. Notre équipe vous confirmera la disponibilité par WhatsApp sous 24h.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      ${row('Véhicule', b.car_name || '—')}
      ${row('Du', b.start_date)}${row('Au', b.end_date)}
      ${b.total ? row('Total estimé', money(b.total, b.currency)) : ''}
    </table>
    ${b.booking_id ? `<p style="margin-top:16px"><a href="https://fikconciergerie.com/suivi/${b.booking_id}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Suivre ma réservation</a></p>` : ''}
  `);
  return { subject: 'Demande de réservation reçue — Fik Conciergerie', html };
}

export function bookingConfirmedEmail(b) {
  const html = wrap('Votre réservation est confirmée ✅', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${b.client_name},<br/>Bonne nouvelle, votre réservation est <b>confirmée</b> !</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      ${row('Véhicule', b.car_name || '—')}
      ${row('Du', b.start_date)}${row('Au', b.end_date)}
      ${b.total ? row('Total', money(b.total, b.currency)) : ''}
    </table>
    ${b.booking_id ? `<p style="margin-top:16px"><a href="https://fikconciergerie.com/suivi/${b.booking_id}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Voir ma réservation</a></p>` : ''}
    <p style="color:#777;font-size:13px;margin-top:14px">Rappel : passeport + permis valides. Aucune caution. Merci de votre confiance 🙏</p>
  `);
  return { subject: 'Réservation confirmée — Fik Conciergerie', html };
}

// Rappel J-1 : la location commence demain
export function bookingReminderEmail(b) {
  const html = wrap('Votre location commence demain 🚗', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${b.client_name},<br/>Petit rappel : votre location démarre <b>demain</b>. On a hâte de vous accueillir !</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      ${row('Véhicule', b.car_name || '—')}
      ${row('Récupération', b.start_date)}${row('Retour', b.end_date)}
      ${b.pickup ? row('Lieu de prise', b.pickup) : ''}
    </table>
    <p style="color:#777;font-size:13px;margin-top:14px">À prévoir : <b>passeport + permis valides</b>. Aucune caution. Une question ? Répondez-nous sur WhatsApp.</p>
    ${b.booking_id ? `<p style="margin-top:16px"><a href="https://fikconciergerie.com/suivi/${b.booking_id}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Voir ma réservation</a></p>` : ''}
  `);
  return { subject: 'Rappel — votre location commence demain', html };
}

// Bienvenue newsletter
export function newsletterWelcomeEmail() {
  const html = wrap('Bienvenue chez Fik Conciergerie 🎉', `
    <p style="color:#555;font-size:14px;line-height:1.6">Merci de votre inscription ! Vous recevrez nos meilleures offres location, vente de véhicules, immobilier et packs séjour à Oran — en avant-première.</p>
    <p style="margin-top:16px"><a href="https://fikconciergerie.com/cars" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Découvrir nos véhicules</a></p>
  `);
  return { subject: 'Bienvenue chez Fik Conciergerie', html };
}

// Campagne newsletter (contenu libre saisi par l'admin)
export function newsletterCampaignEmail(title, bodyHtml, email) {
  const unsub = email ? `https://fikconciergerie.com/api/newsletter-unsubscribe?email=${encodeURIComponent(email)}` : 'https://fikconciergerie.com';
  const html = wrap(title, `
    <div style="color:#444;font-size:14px;line-height:1.7">${bodyHtml}</div>
    <p style="margin-top:18px;font-size:11px;color:#aaa"><a href="${unsub}" style="color:#aaa">Se désinscrire</a></p>
  `);
  return { subject: title, html };
}

export function reviewRequestEmail(b) {
  const html = wrap('Comment s\'est passée votre location ?', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${b.client_name},<br/>Merci d'avoir choisi Fik Conciergerie ! Votre avis nous aide énormément — il prend 30 secondes.</p>
    <p style="margin-top:16px"><a href="https://fikconciergerie.com/avis/${b.booking_id}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Laisser mon avis</a></p>
  `);
  return { subject: 'Votre avis compte — Fik Conciergerie', html };
}
