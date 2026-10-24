// Client-side page tracking utility

let sessionId = null;

function getSessionId() {
  if (typeof window === 'undefined') return null;
  if (!sessionId) {
    sessionId = sessionStorage.getItem('fk_sid');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('fk_sid', sessionId);
    }
  }
  return sessionId;
}

function getDevice() {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

// « C'est nous » : l'appareil qui ouvre l'admin ou le lien ?moi=1 est retenu (?moi=0 pour annuler) →
// Dzaryx ne compte pas les visites de l'équipe comme des visiteurs.
function isOwnerDevice(page) {
  try {
    const moi = new URLSearchParams(window.location.search).get('moi');
    if (moi === '1' || /^\/admin(\/|$)/.test(page)) localStorage.setItem('fk_owner', '1');
    if (moi === '0') localStorage.removeItem('fk_owner');
    return localStorage.getItem('fk_owner') === '1';
  } catch { return false; }
}

export async function trackPageView(page, carId = null) {
  if (typeof window === 'undefined') return;
  // Pixels publicitaires (retargeting) — ne font rien si non chargés (env absente)
  try { if (window.gtag) window.gtag('event', 'page_view', { page_path: page }); } catch {}
  try { if (window.fbq) window.fbq('track', 'PageView'); } catch {}
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        referrer: document.referrer || null,
        device: getDevice(),
        session_id: getSessionId(),
        car_id: carId || null,
        owner: isOwnerDevice(page),
        webdriver: !!navigator.webdriver,
      }),
    });
  } catch { /* non-blocking */ }
}

// Évènement de conversion (réservation, commande import, lead…).
// Envoie vers GA4 + Meta Pixel s'ils sont chargés. Non-bloquant, jamais d'erreur visible.
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  // Aussi dans nos propres stats (page « #event:… ») : Dzaryx calcule le parcours visiteur → voiture → réservation → envoyée
  try {
    const body = JSON.stringify({ page: `#event:${name}`, device: getDevice(), session_id: getSessionId(), owner: isOwnerDevice(''), webdriver: !!navigator.webdriver });
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' })))) {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch {}
  try { if (window.gtag) window.gtag('event', name, params); } catch {}
  try {
    if (window.fbq) {
      // Map vers les évènements standard Meta quand ça correspond
      const STD = { reservation_complete: 'Lead', import_order: 'Lead', lead: 'Lead', contact: 'Contact' };
      if (STD[name]) window.fbq('track', STD[name], params);
      else window.fbq('trackCustom', name, params);
    }
  } catch {}
}
