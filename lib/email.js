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

// Suivi d'importation — email auto à chaque changement de statut
const IMPORT_LABELS = {
  REQUESTED: { fr: 'Demande reçue',     ar: 'تم استلام الطلب',      en: 'Request received' },
  SEARCHING: { fr: 'Recherche en cours', ar: 'جاري البحث',          en: 'Searching' },
  FOUND:     { fr: 'Véhicule trouvé',   ar: 'تم العثور على السيارة', en: 'Vehicle found' },
  PURCHASED: { fr: 'Acheté',            ar: 'تم الشراء',            en: 'Purchased' },
  SHIPPING:  { fr: 'En transport',      ar: 'في النقل',            en: 'In transit' },
  CUSTOMS:   { fr: 'Dédouanement',      ar: 'التخليص الجمركي',     en: 'Customs clearance' },
  READY:     { fr: 'Prêt à récupérer',  ar: 'جاهزة للاستلام',      en: 'Ready for pick-up' },
  DELIVERED: { fr: 'Livré',             ar: 'تم التسليم',          en: 'Delivered' },
  CANCELLED: { fr: 'Annulé',            ar: 'ملغى',                en: 'Cancelled' },
};

export function importStatusEmail({ client_name, ref, status, lang = 'fr' }) {
  const lab = (IMPORT_LABELS[status] || IMPORT_LABELS.REQUESTED);
  const label = lab[lang] || lab.fr;
  const html = wrap('Suivi de votre importation 🚗', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${client_name || ''},<br/>Votre commande d'importation <b>${ref}</b> a une nouvelle étape :</p>
    <div style="margin:16px 0;padding:14px 18px;background:#faf6e8;border:1px solid #e9b94944;border-radius:10px;text-align:center">
      <span style="color:#7a5c00;font-size:12px;text-transform:uppercase;letter-spacing:1px">Statut actuel</span><br/>
      <span style="color:#111;font-size:20px;font-weight:800">${label}</span>
    </div>
    <p style="margin-top:16px"><a href="https://fikconciergerie.com/suivi-import/${ref}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">Suivre mon importation</a></p>
    <p style="color:#777;font-size:13px;margin-top:14px">Une question ? Répondez-nous sur WhatsApp. Merci de votre confiance 🙏</p>
  `);
  return { subject: `Importation ${ref} — ${label}`, html };
}

const GOOGLE_REVIEW_URL = 'https://g.page/r/CSluTI58e1CwEBM/review';

export function reviewRequestEmail(b) {
  const html = wrap('Comment s\'est passée votre location ?', `
    <p style="color:#555;font-size:14px;line-height:1.6">Bonjour ${b.client_name},<br/>Merci d'avoir choisi Fik Conciergerie ! Un avis Google nous aide énormément — il prend 30 secondes.</p>
    <p style="margin-top:16px"><a href="${GOOGLE_REVIEW_URL}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">⭐ Laisser un avis Google</a></p>
    <p style="margin-top:14px;font-size:12px;color:#999">Ou sur notre site : <a href="https://fikconciergerie.com/avis/${b.booking_id}" style="color:#999">cliquez ici</a>.</p>
  `);
  return { subject: 'Votre avis compte — Fik Conciergerie', html };
}
