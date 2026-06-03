import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { useLang } from '../lib/i18n';

// Bandeau cookies léger (RGPD). Mémorise le choix dans localStorage.
export default function CookieBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('cookie_ok') !== '1') setShow(true); } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem('cookie_ok', '1'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-[#141414] border border-white/[0.1] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <Cookie size={17} className="text-gold-400" />
        </div>
        <p className="text-white/55 text-xs sm:text-sm leading-relaxed flex-1 text-center sm:text-start">{t('cookie.text')}</p>
        <button onClick={accept} className="btn-gold px-6 py-2.5 text-sm whitespace-nowrap w-full sm:w-auto justify-center">{t('cookie.accept')}</button>
      </div>
    </div>
  );
}
