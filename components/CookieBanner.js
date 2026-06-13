import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useLang } from '../lib/i18n';

const CLARITY_ID = 'wzu6j89axc';

// Charge Microsoft Clarity (heatmaps/audience) — seulement après consentement (RGPD).
function loadClarity() {
  if (typeof window === 'undefined' || window.clarity || document.getElementById('clarity-tag')) return;
  (function (c, l, a, r, i) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r); t.async = 1; t.id = 'clarity-tag'; t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
}

// Bandeau cookies RGPD : Accepter / Refuser + lien confidentialité. Analytics chargé uniquement si accepté.
export default function CookieBanner() {
  const { t, lang } = useLang();
  const ar = lang === 'ar';
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const choice = localStorage.getItem('cookie_consent');
      if (choice === 'accepted') loadClarity();      // déjà accepté → recharge l'analytics
      else if (choice !== 'declined') setShow(true);  // pas de choix → affiche le bandeau
    } catch { setShow(true); }
  }, []);

  const decide = (accepted) => {
    try { localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'declined'); localStorage.setItem('cookie_ok', '1'); } catch {}
    if (accepted) loadClarity();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto bg-[#141414] border border-white/[0.1] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <Cookie size={17} className="text-gold-400" />
        </div>
        <p className="text-white/55 text-xs sm:text-sm leading-relaxed flex-1 text-center sm:text-start">
          {t('cookie.text')}{' '}
          <Link href="/confidentialite" className="text-gold-400 underline hover:text-gold-300">{t('cookie.privacy')}</Link>
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => decide(false)} className="flex-1 sm:flex-none border border-white/12 text-white/60 hover:text-white rounded-xl px-5 py-2.5 text-sm whitespace-nowrap">{t('cookie.refuse')}</button>
          <button onClick={() => decide(true)} className="btn-gold flex-1 sm:flex-none px-6 py-2.5 text-sm whitespace-nowrap justify-center">{t('cookie.accept')}</button>
        </div>
      </div>
    </div>
  );
}
