import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { translateToFR } from '../lib/autoTranslate';

// Bouton admin : traduit en français un texte libre écrit par un client en arabe/anglais.
export default function TranslateToFr({ text, lang }) {
  const [tr, setTr] = useState(null);
  const [loading, setLoading] = useState(false);
  const lg = lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr';
  if (!text || !String(text).trim() || lg === 'fr') return null;

  const go = async () => { setLoading(true); try { setTr(await translateToFR(text)); } finally { setLoading(false); } };

  if (tr) return (
    <p className="mt-1 text-emerald-300/80 text-xs flex items-start gap-1.5"><Languages size={12} className="mt-0.5 flex-shrink-0" /><span><span className="text-emerald-400/60">FR :</span> {tr}</span></p>
  );
  return (
    <button onClick={go} disabled={loading} className="mt-1 text-gold-400 hover:text-gold-300 text-xs flex items-center gap-1">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}Traduire en français
    </button>
  );
}
