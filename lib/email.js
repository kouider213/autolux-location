// Envoi d'emails transactionnels via Resend (HTTP, gratuit ~3000/mois).
// Sans clé configurée → ne fait rien (jamais d'erreur bloquante).
// Config (Vercel env) : RESEND_API_KEY + RESEND_FROM="Fik Conciergerie <contact@tondomaine.com>"
// Tous les emails client sont TRILINGUES (fr/ar/en) selon la langue du client.
const KEY  = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'Fik Conciergerie <onboarding@resend.dev>';

// ── Identité de marque ─────────────
const SITE    = 'https://fikconciergerie.com';
const LOGO    = `${SITE}/logo.png`;
const WA_NUM  = '32466311469';
const WA_DISP = '+32 466 31 14 69';
const ADDRESS = 'Rue Derbouz Draoua, Houari, Oran 31300, Algérie';
const MAPS    = 'https://share.google/N4itFBIAR9Z1JX8Aw';
const REVIEW  = 'https://g.page/r/CSluTI58e1CwEBM/review';

// Helper langue
const LG = (lang) => (lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr');
const T = (lang, o) => o[LG(lang)] || o.fr;

// Chrome traduit
const CHROME = {
  question: { fr: 'Une question ? Notre équipe répond 7j/7.', ar: 'هل لديك سؤال؟ فريقنا متاح 7 أيام/7.', en: 'A question? Our team replies 7/7.' },
  site:     { fr: '🌐 Notre site', ar: '🌐 موقعنا', en: '🌐 Our site' },
  review:   { fr: '⭐ Laisser un avis Google', ar: '⭐ اترك تقييماً على Google', en: '⭐ Leave a Google review' },
};

// wrap(title, body, opts?) — opts: { preheader, footNote, lang }
const wrap = (title, body, opts = {}) => {
  const { preheader = '', footNote = '', lang = 'fr' } = opts;
  const ar = LG(lang) === 'ar';
  const dir = ar ? 'rtl' : 'ltr';
  const align = ar ? 'right' : 'left';
  return `<!doctype html><html dir="${dir}" lang="${LG(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif" dir="${dir}">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ''}
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <div style="background:#0d0d0d;border-radius:16px 16px 0 0;padding:26px 24px;text-align:center">
      <img src="${LOGO}" alt="Fik Conciergerie" width="54" height="54" style="display:inline-block;object-fit:contain;border:0" />
      <div style="color:#e9b949;font-weight:800;font-size:20px;letter-spacing:1.5px;margin-top:8px">FIK CONCIERGERIE</div>
      <div style="color:#8a8a8a;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:2px">Conciergerie Premium · Oran</div>
    </div>

    <div style="background:#ffffff;border:1px solid #ececec;border-top:0;padding:28px 24px;text-align:${align}">
      <h1 style="font-size:19px;color:#111;margin:0 0 16px;line-height:1.3">${title}</h1>
      ${body}
    </div>

    <div style="background:#161616;padding:22px 24px;text-align:center">
      <p style="color:#cfcfcf;font-size:13px;margin:0 0 14px">${T(lang, CHROME.question)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>
        <td style="padding:0 5px"><a href="https://wa.me/${WA_NUM}" style="background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:11px 18px;border-radius:9px;display:inline-block">💬 WhatsApp</a></td>
        <td style="padding:0 5px"><a href="${SITE}" style="background:#e9b949;color:#1a1500;text-decoration:none;font-weight:700;font-size:13px;padding:11px 18px;border-radius:9px;display:inline-block">${T(lang, CHROME.site)}</a></td>
      </tr></table>
    </div>

    <div style="background:#0d0d0d;border-radius:0 0 16px 16px;padding:20px 24px;text-align:center">
      <p style="margin:0 0 6px;font-size:13px"><a href="https://wa.me/${WA_NUM}" style="color:#e9b949;text-decoration:none;font-weight:600">${WA_DISP}</a></p>
      <p style="margin:0 0 6px;font-size:12px;color:#9a9a9a"><a href="${MAPS}" style="color:#9a9a9a;text-decoration:none">📍 ${ADDRESS}</a></p>
      <p style="margin:0 0 12px;font-size:12px"><a href="${REVIEW}" style="color:#9a9a9a;text-decoration:none">${T(lang, CHROME.review)}</a></p>
      <p style="margin:0;font-size:11px;color:#5a5a5a">© ${new Date().getFullYear()} Fik Conciergerie — Oran, Algérie.${footNote ? ` · ${footNote}` : ''}</p>
    </div>

  </div></body></html>`;
};

export async function sendEmail(to, subject, html) {
  if (!KEY) return { skipped: true, reason: 'RESEND_API_KEY manquante' };
  if (!to || !/@/.test(to)) return { skipped: true, reason: 'email invalide' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    const txt = await r.text().catch(() => '');
    if (!r.ok) { console.error('[email] resend', r.status, txt); return { error: true, status: r.status, detail: txt.slice(0, 300) }; }
    return { ok: true };
  } catch (e) { console.error('[email]', e.message); return { error: true, detail: e.message }; }
}

const money = (n, c) => `${Number(n || 0).toLocaleString('fr-FR')} ${c === 'DZD' || c === 'DA' ? 'DA' : '€'}`;
const row = (l, v) => `<tr><td style="padding:6px 0;color:#777;font-size:14px">${l}</td><td style="padding:6px 0;font-weight:600;color:#111;font-size:14px">${v}</td></tr>`;
const btn = (href, label) => `<p style="margin-top:16px"><a href="${href}" style="background:#e9b949;color:#1a1500;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px;display:inline-block">${label}</a></p>`;

// Libellés communs (lignes de tableau)
const LBL = {
  hello:   { fr: 'Bonjour', ar: 'مرحباً', en: 'Hello' },
  vehicle: { fr: 'Véhicule', ar: 'السيارة', en: 'Vehicle' },
  from:    { fr: 'Du', ar: 'من', en: 'From' },
  to:      { fr: 'Au', ar: 'إلى', en: 'To' },
  total:   { fr: 'Total', ar: 'المجموع', en: 'Total' },
  totalEst:{ fr: 'Total estimé', ar: 'المجموع التقديري', en: 'Estimated total' },
  track:   { fr: 'Suivre ma réservation', ar: 'تتبّع حجزي', en: 'Track my booking' },
  status:  { fr: 'Statut', ar: 'الحالة', en: 'Status' },
};

// ── Réservation : statuts (trilingue) ──────────────────────────────
const BOOKING_STATUS = {
  PENDING: {
    label: { fr: 'En attente de confirmation', ar: 'في انتظار التأكيد', en: 'Awaiting confirmation' },
    line: {
      fr: "Nous vous remercions pour votre demande de réservation. Notre équipe l'étudie avec la plus grande attention et reviendra vers vous dans les plus brefs délais.",
      ar: 'نشكرك على طلب الحجز. يدرس فريقنا طلبك بكل عناية وسيعود إليك في أقرب وقت ممكن.',
      en: 'Thank you for your booking request. Our team is reviewing it carefully and will get back to you very soon.',
    },
  },
  ACCEPTED: {
    label: { fr: 'Confirmée ✅', ar: 'مؤكَّدة ✅', en: 'Confirmed ✅' },
    line: {
      fr: "Nous avons le plaisir de vous confirmer votre réservation. Toute l'équipe Fik Conciergerie se réjouit de vous accueillir et reste à votre entière disposition.",
      ar: 'يسعدنا أن نؤكد لك حجزك. يتشرف فريق Fik Conciergerie باستقبالك ويبقى رهن إشارتك.',
      en: 'We are pleased to confirm your booking. The whole Fik Conciergerie team looks forward to welcoming you and remains at your full disposal.',
    },
  },
  ACTIVE: {
    label: { fr: 'En cours 🚗', ar: 'جارية 🚗', en: 'Ongoing 🚗' },
    line: {
      fr: "Votre location est désormais en cours. Nous vous souhaitons une excellente route et restons à votre disposition pour toute question.",
      ar: 'إيجارك جارٍ الآن. نتمنى لك رحلة ممتعة ونبقى رهن إشارتك لأي استفسار.',
      en: 'Your rental is now ongoing. We wish you a great trip and remain available for any question.',
    },
  },
  COMPLETED: {
    label: { fr: 'Terminée', ar: 'منتهية', en: 'Completed' },
    line: {
      fr: "Votre location est à présent terminée. Nous vous remercions chaleureusement de votre confiance — ce fut un réel plaisir de vous accompagner.",
      ar: 'انتهى إيجارك الآن. نشكرك جزيل الشكر على ثقتك — كان من دواعي سرورنا خدمتك.',
      en: 'Your rental is now complete. We warmly thank you for your trust — it was a real pleasure to assist you.',
    },
  },
  REJECTED: {
    label: { fr: 'Indisponible à ces dates', ar: 'غير متوفّر في هذه التواريخ', en: 'Unavailable on these dates' },
    line: {
      fr: "Nous sommes sincèrement navrés : nous ne sommes malheureusement pas disponibles sur ces dates. Notre équipe serait toutefois ravie de vous proposer d'autres options qui vous conviennent — n'hésitez pas à nous contacter.",
      ar: 'نأسف بصدق: لسنا متاحين للأسف في هذه التواريخ. لكن يسعد فريقنا أن يقترح عليك تواريخ أخرى تناسبك — لا تتردد في التواصل معنا.',
      en: "We are sincerely sorry: we are unfortunately not available on these dates. Our team would be glad to suggest other options that suit you — feel free to contact us.",
    },
  },
  CANCELLED: {
    label: { fr: 'Annulée', ar: 'ملغاة', en: 'Cancelled' },
    line: {
      fr: "Votre réservation a bien été annulée. Pour toute question, ou si vous souhaitez réserver à nouveau, notre équipe reste à votre entière disposition.",
      ar: 'تم إلغاء حجزك. لأي استفسار أو إذا رغبت في الحجز مجدداً، يبقى فريقنا رهن إشارتك.',
      en: 'Your booking has been cancelled. For any question, or to book again, our team remains at your full disposal.',
    },
  },
};
BOOKING_STATUS.CONFIRMED = BOOKING_STATUS.ACCEPTED;

const detailsTable = (b, lang) => `
    <table style="width:100%;border-collapse:collapse;margin-top:6px">
      ${b.car_name ? row(T(lang, LBL.vehicle), b.car_name) : ''}
      ${b.start_date ? row(T(lang, LBL.from), b.start_date) : ''}${b.end_date ? row(T(lang, LBL.to), b.end_date) : ''}
      ${b.total ? row(T(lang, LBL.total), money(b.total, b.currency)) : ''}
    </table>`;

// ── Templates ──────────────────────────────────────────────────
export function bookingReceivedEmail(b) {
  const lang = LG(b.lang);
  const title = T(lang, { fr: 'Votre demande de réservation est bien reçue', ar: 'تم استلام طلب حجزك', en: 'Your booking request has been received' });
  const line = T(lang, {
    fr: 'Nous vous remercions pour votre confiance. Votre demande de réservation a bien été reçue : notre équipe vérifie la disponibilité et reviendra vers vous très rapidement, par WhatsApp ou par email.',
    ar: 'نشكرك على ثقتك. تم استلام طلب حجزك: يتحقق فريقنا من التوفّر وسيعود إليك سريعاً عبر واتساب أو البريد الإلكتروني.',
    en: 'Thank you for your trust. Your booking request has been received: our team is checking availability and will get back to you very soon, by WhatsApp or email.',
  });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(lang, LBL.hello)} ${b.client_name},<br/>${line}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      ${row(T(lang, LBL.vehicle), b.car_name || '—')}
      ${row(T(lang, LBL.from), b.start_date)}${row(T(lang, LBL.to), b.end_date)}
      ${b.total ? row(T(lang, LBL.totalEst), money(b.total, b.currency)) : ''}
    </table>
    ${b.booking_id ? btn(`${SITE}/suivi/${b.booking_id}`, T(lang, LBL.track)) : ''}
  `, { lang, preheader: title });
  return { subject: T(lang, { fr: 'Demande de réservation reçue — Fik Conciergerie', ar: 'تم استلام طلب الحجز — Fik Conciergerie', en: 'Booking request received — Fik Conciergerie' }), html };
}

export function bookingConfirmedEmail(b) { return bookingStatusEmail({ ...b, status: 'ACCEPTED' }); }

export function bookingStatusEmail(b) {
  const lang = LG(b.lang);
  const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.PENDING;
  const label = T(lang, st.label);
  const title = T(lang, { fr: 'Mise à jour de votre réservation', ar: 'تحديث بخصوص حجزك', en: 'Update on your booking' });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(lang, LBL.hello)} ${b.client_name || ''},<br/>${T(lang, st.line)}</p>
    <div style="margin:16px 0;padding:14px 18px;background:#faf6e8;border:1px solid #e9b94944;border-radius:10px;text-align:center">
      <span style="color:#7a5c00;font-size:12px;text-transform:uppercase;letter-spacing:1px">${T(lang, LBL.status)}</span><br/>
      <span style="color:#111;font-size:20px;font-weight:800">${label}</span>
    </div>
    ${detailsTable(b, lang)}
    ${b.booking_id ? btn(`${SITE}/suivi/${b.booking_id}`, T(lang, LBL.track)) : ''}
  `, { lang, preheader: `${T(lang, LBL.status)} : ${label}` });
  return { subject: T(lang, { fr: `Réservation ${label} — Fik Conciergerie`, ar: `حجزك: ${label} — Fik Conciergerie`, en: `Booking ${label} — Fik Conciergerie` }), html };
}

// Rappel J-1
export function bookingReminderEmail(b) {
  const lang = LG(b.lang);
  const title = T(lang, { fr: 'Votre location commence demain 🚗', ar: 'إيجارك يبدأ غداً 🚗', en: 'Your rental starts tomorrow 🚗' });
  const line = T(lang, {
    fr: 'Petit rappel : votre location démarre <b>demain</b>. Toute l\'équipe a hâte de vous accueillir !',
    ar: 'تذكير بسيط: يبدأ إيجارك <b>غداً</b>. يتشوّق فريقنا لاستقبالك!',
    en: 'A quick reminder: your rental starts <b>tomorrow</b>. The whole team looks forward to welcoming you!',
  });
  const note = T(lang, {
    fr: 'À prévoir : <b>passeport + permis valides</b>. Aucune caution.',
    ar: 'المطلوب: <b>جواز سفر + رخصة سياقة ساريان</b>. بدون أي ضمان.',
    en: 'Please bring: <b>valid passport + driving licence</b>. No deposit required.',
  });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(lang, LBL.hello)} ${b.client_name},<br/>${line}</p>
    ${detailsTable({ ...b, total: b.total }, lang)}
    <p style="color:#777;font-size:13px;margin-top:14px">${note}</p>
    ${b.booking_id ? btn(`${SITE}/suivi/${b.booking_id}`, T(lang, LBL.track)) : ''}
  `, { lang });
  return { subject: T(lang, { fr: 'Rappel — votre location commence demain', ar: 'تذكير — إيجارك يبدأ غداً', en: 'Reminder — your rental starts tomorrow' }), html };
}

// Bienvenue newsletter (trilingue)
export function newsletterWelcomeEmail(lang = 'fr') {
  const L = LG(lang);
  const title = T(L, { fr: 'Bienvenue chez Fik Conciergerie 🎉', ar: 'مرحباً بك في Fik Conciergerie 🎉', en: 'Welcome to Fik Conciergerie 🎉' });
  const line = T(L, {
    fr: 'Merci de votre inscription ! Vous recevrez nos meilleures offres location, vente de véhicules, immobilier et packs séjour à Oran — en avant-première.',
    ar: 'شكراً لاشتراكك! ستصلك أفضل عروضنا في الإيجار وبيع السيارات والعقارات وباقات الإقامة في وهران — حصرياً وقبل الجميع.',
    en: 'Thank you for subscribing! You will receive our best car rental, vehicle sales, real estate and stay packages offers in Oran — first.',
  });
  const cta = T(L, { fr: 'Découvrir nos véhicules', ar: 'اكتشف سياراتنا', en: 'Discover our vehicles' });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${line}</p>
    ${btn(`${SITE}/cars`, cta)}
  `, { lang: L, preheader: line.slice(0, 90) });
  return { subject: title, html };
}

// Campagne newsletter (contenu libre admin)
export function newsletterCampaignEmail(title, bodyHtml, email) {
  const unsub = email ? `${SITE}/api/newsletter-unsubscribe?email=${encodeURIComponent(email)}` : SITE;
  const rendered = String(bodyHtml || '').replace(/\r\n|\r|\n/g, '<br/>');
  const html = wrap(title, `<div style="color:#444;font-size:14px;line-height:1.7">${rendered}</div>`,
    { preheader: title, footNote: `<a href="${unsub}" style="color:#5a5a5a;text-decoration:underline">Se désinscrire</a>` });
  return { subject: title, html };
}

// ── Importation : statuts (trilingue) ──────────────────────────────
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
  const L = LG(lang);
  const label = T(L, IMPORT_LABELS[status] || IMPORT_LABELS.REQUESTED);
  const title = T(L, { fr: 'Suivi de votre importation 🚗', ar: 'متابعة استيراد سيارتك 🚗', en: 'Your import tracking 🚗' });
  const intro = T(L, {
    fr: `Votre commande d'importation <b>${ref}</b> a une nouvelle étape :`,
    ar: `طلب استيرادك <b>${ref}</b> وصل إلى مرحلة جديدة:`,
    en: `Your import order <b>${ref}</b> has a new step:`,
  });
  const cur = T(L, { fr: 'Statut actuel', ar: 'الحالة الحالية', en: 'Current status' });
  const cta = T(L, { fr: 'Suivre mon importation', ar: 'تتبّع استيرادي', en: 'Track my import' });
  const foot = T(L, {
    fr: 'Une question ? Répondez-nous sur WhatsApp. Merci de votre confiance 🙏',
    ar: 'هل لديك سؤال؟ راسلنا عبر واتساب. شكراً لثقتك 🙏',
    en: 'A question? Reply to us on WhatsApp. Thank you for your trust 🙏',
  });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(L, LBL.hello)} ${client_name || ''},<br/>${intro}</p>
    <div style="margin:16px 0;padding:14px 18px;background:#faf6e8;border:1px solid #e9b94944;border-radius:10px;text-align:center">
      <span style="color:#7a5c00;font-size:12px;text-transform:uppercase;letter-spacing:1px">${cur}</span><br/>
      <span style="color:#111;font-size:20px;font-weight:800">${label}</span>
    </div>
    ${btn(`${SITE}/suivi-import/${ref}`, cta)}
    <p style="color:#777;font-size:13px;margin-top:14px">${foot}</p>
  `, { lang: L, preheader: `${cur} : ${label}` });
  return { subject: T(L, { fr: `Importation ${ref} — ${label}`, ar: `استيراد ${ref} — ${label}`, en: `Import ${ref} — ${label}` }), html };
}

// ── Suivi de dossier (achat véhicule / immobilier) — trilingue ─────
const DOSSIER_LABELS = {
  voiture: {
    REQUESTED: { fr: 'Demande reçue', ar: 'تم استلام الطلب', en: 'Request received' },
    RESERVED:  { fr: 'Véhicule réservé', ar: 'تم حجز السيارة', en: 'Vehicle reserved' },
    DOCUMENTS: { fr: 'Dossier & documents', ar: 'الملف والوثائق', en: 'Documents' },
    PAYMENT:   { fr: 'Paiement', ar: 'الدفع', en: 'Payment' },
    READY:     { fr: 'Prêt à récupérer', ar: 'جاهزة للاستلام', en: 'Ready for pick-up' },
    DELIVERED: { fr: 'Livré', ar: 'تم التسليم', en: 'Delivered' },
  },
  immo: {
    REQUESTED: { fr: 'Demande reçue', ar: 'تم استلام الطلب', en: 'Request received' },
    VISIT:     { fr: 'Visite programmée', ar: 'تمت برمجة الزيارة', en: 'Visit scheduled' },
    REVIEW:    { fr: 'Dossier en cours', ar: 'الملف قيد الدراسة', en: 'Under review' },
    CONTRACT:  { fr: 'Contrat', ar: 'العقد', en: 'Contract' },
    FINALIZED: { fr: 'Finalisé', ar: 'تم الإنهاء', en: 'Finalized' },
  },
  pack: {
    REQUESTED: { fr: 'Demande reçue', ar: 'تم استلام الطلب', en: 'Request received' },
    CONFIRMED: { fr: 'Pack confirmé', ar: 'تم تأكيد الباقة', en: 'Pack confirmed' },
    DEPOSIT:   { fr: 'Acompte versé', ar: 'تم دفع العربون', en: 'Deposit paid' },
    PREPARED:  { fr: 'Séjour préparé', ar: 'تم تحضير الإقامة', en: 'Stay prepared' },
    ONGOING:   { fr: 'Séjour en cours', ar: 'الإقامة جارية', en: 'Stay ongoing' },
    COMPLETED: { fr: 'Terminé', ar: 'منتهي', en: 'Completed' },
  },
  CANCELLED: { fr: 'Annulé', ar: 'ملغى', en: 'Cancelled' },
};

export function dossierStatusEmail({ client_name, ref, kind = 'voiture', status, subject, lang = 'fr' }) {
  const L = LG(lang);
  const set = DOSSIER_LABELS[kind] || DOSSIER_LABELS.voiture;
  const label = T(L, status === 'CANCELLED' ? DOSSIER_LABELS.CANCELLED : (set[status] || set.REQUESTED));
  const title = T(L, { fr: 'Mise à jour de votre dossier', ar: 'تحديث بخصوص ملفك', en: 'Update on your file' });
  const intro = T(L, {
    fr: `Votre dossier <b>${ref}</b>${subject ? ` (${subject})` : ''} a évolué :`,
    ar: `ملفك <b>${ref}</b>${subject ? ` (${subject})` : ''} تطوّر:`,
    en: `Your file <b>${ref}</b>${subject ? ` (${subject})` : ''} has progressed:`,
  });
  const cur = T(L, { fr: 'Statut actuel', ar: 'الحالة الحالية', en: 'Current status' });
  const cta = T(L, { fr: 'Suivre mon dossier', ar: 'تتبّع ملفي', en: 'Track my file' });
  const foot = T(L, {
    fr: 'Une question ? Répondez-nous sur WhatsApp. Merci de votre confiance 🙏',
    ar: 'هل لديك سؤال؟ راسلنا عبر واتساب. شكراً لثقتك 🙏',
    en: 'A question? Reply on WhatsApp. Thank you for your trust 🙏',
  });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(L, LBL.hello)} ${client_name || ''},<br/>${intro}</p>
    <div style="margin:16px 0;padding:14px 18px;background:#faf6e8;border:1px solid #e9b94944;border-radius:10px;text-align:center">
      <span style="color:#7a5c00;font-size:12px;text-transform:uppercase;letter-spacing:1px">${cur}</span><br/>
      <span style="color:#111;font-size:20px;font-weight:800">${label}</span>
    </div>
    ${btn(`${SITE}/suivi-dossier/${ref}`, cta)}
    <p style="color:#777;font-size:13px;margin-top:14px">${foot}</p>
  `, { lang: L, preheader: `${cur} : ${label}` });
  return { subject: T(L, { fr: `Dossier ${ref} — ${label}`, ar: `ملف ${ref} — ${label}`, en: `File ${ref} — ${label}` }), html };
}

export function reviewRequestEmail(b) {
  const lang = LG(b.lang);
  const title = T(lang, { fr: "Comment s'est passée votre location ?", ar: 'كيف كانت تجربة إيجارك؟', en: 'How was your rental?' });
  const line = T(lang, {
    fr: "Merci d'avoir choisi Fik Conciergerie ! Un avis Google nous aide énormément — il prend 30 secondes.",
    ar: 'شكراً لاختيارك Fik Conciergerie! تقييمك على Google يساعدنا كثيراً — لا يستغرق سوى 30 ثانية.',
    en: 'Thank you for choosing Fik Conciergerie! A Google review helps us a lot — it takes 30 seconds.',
  });
  const cta = T(lang, { fr: '⭐ Laisser un avis Google', ar: '⭐ اترك تقييماً على Google', en: '⭐ Leave a Google review' });
  const html = wrap(title, `
    <p style="color:#555;font-size:14px;line-height:1.6">${T(lang, LBL.hello)} ${b.client_name},<br/>${line}</p>
    ${btn(REVIEW, cta)}
    <p style="margin-top:14px;font-size:12px;color:#999"><a href="${SITE}/avis/${b.booking_id}" style="color:#999">${SITE}/avis/${b.booking_id}</a></p>
  `, { lang });
  return { subject: T(lang, { fr: 'Votre avis compte — Fik Conciergerie', ar: 'رأيك يهمّنا — Fik Conciergerie', en: 'Your review matters — Fik Conciergerie' }), html };
}
