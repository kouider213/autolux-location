import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { getSettings } from '../lib/settings';
import { useTranslated } from '../lib/autoTranslate';

// Bandeau d'annonce sitewide. Affiché si l'admin a rempli le champ "announcement"
// dans Paramètres. Masqué sur l'admin. Refermable (mémorisé par texte).
// Le texte saisi (FR) est auto-traduit FR/AR/EN selon la langue du visiteur.
export default function AnnouncementBanner() {
  const [raw, setRaw]       = useState('');   // texte FR brut (clé de fermeture stable)
  const [closed, setClosed] = useState(true);
  const msg = useTranslated(raw);             // texte affiché, traduit

  useEffect(() => {
    getSettings().then(s => {
      const a = (s.announcement || '').trim();
      setRaw(a);
      if (a) {
        const dismissed = typeof window !== 'undefined' && localStorage.getItem('annc_dismissed') === a;
        setClosed(!!dismissed);
      }
    });
  }, []);

  // Décale la Navbar (top-[var(--annc-h)]) selon présence du bandeau
  const visible = !!raw && !closed;
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--annc-h', visible ? '38px' : '0px');
    return () => document.documentElement.style.setProperty('--annc-h', '0px');
  }, [visible]);

  if (!visible) return null;

  const close = () => {
    setClosed(true);
    try { localStorage.setItem('annc_dismissed', raw); } catch {}
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-noir-950">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <Megaphone size={15} className="flex-shrink-0" />
        <p className="text-sm font-semibold leading-tight">{msg}</p>
        <button onClick={close} aria-label="Fermer"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-noir-950/15 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
