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

export async function trackPageView(page, carId = null) {
  if (typeof window === 'undefined') return;
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
      }),
    });
  } catch { /* non-blocking */ }
}
