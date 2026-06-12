import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useLang } from '../lib/i18n';

// Enregistre le service worker + bouton "Installer l'app" (Android/Chrome/Edge).
// Sur iOS Safari pas de prompt natif → on montre une astuce "Partager → Sur l'écran d'accueil".
export default function PWAInstall() {
  const { lang } = useLang();
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const dismissed = () => { try { return localStorage.getItem('fik:pwa-dismissed') === '1'; } catch { return false; } }
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone || dismissed()) return;

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS : pas d'événement → détecter Safari iOS et proposer l'astuce
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
    if (isIos && isSafari) { setIosHint(true); setShow(true); }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => { setShow(false); try { localStorage.setItem('fik:pwa-dismissed', '1'); } catch {} };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  const T = {
    title: lang === 'ar' ? 'ثبّت تطبيق Fik' : lang === 'en' ? 'Install the Fik app' : "Installer l'app Fik",
    sub: lang === 'ar' ? 'وصول أسرع، حتى بدون إنترنت.' : lang === 'en' ? 'Faster access, even offline.' : 'Accès rapide, même hors ligne.',
    btn: lang === 'ar' ? 'تثبيت' : lang === 'en' ? 'Install' : 'Installer',
    ios: lang === 'ar' ? 'اضغط على زر المشاركة ثم « إضافة إلى الشاشة الرئيسية ».' : lang === 'en' ? 'Tap Share then “Add to Home Screen”.' : 'Touchez Partager puis « Sur l\'écran d\'accueil ».',
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[60]">
      <div className="bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="Fik" className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">{T.title}</p>
          <p className="text-white/45 text-xs mt-0.5">{iosHint ? T.ios : T.sub}</p>
          {!iosHint && (
            <button onClick={install} className="mt-2.5 inline-flex items-center gap-1.5 bg-gold-500 text-noir-950 font-bold text-xs px-3.5 py-2 rounded-lg">
              <Download size={13} />{T.btn}
            </button>
          )}
        </div>
        <button onClick={dismiss} aria-label="Fermer" className="text-white/30 hover:text-white/70 flex-shrink-0"><X size={16} /></button>
      </div>
    </div>
  );
}
