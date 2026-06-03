import { useState } from 'react';
import { Share2, Check, MessageCircle, Facebook, Link2 } from 'lucide-react';

// Boutons de partage : WhatsApp, Facebook, copier le lien + partage natif mobile.
export default function ShareButtons({ url, title = '', label = 'Partager' }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' && !url ? window.location.href : url;
  const enc = encodeURIComponent(fullUrl || '');
  const encT = encodeURIComponent(title);

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url: fullUrl }); } catch {}
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const btn = "w-9 h-9 rounded-xl flex items-center justify-center transition-all";

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/30 text-xs me-1 hidden sm:inline">{label}</span>
      <a href={`https://wa.me/?text=${encT}%20${enc}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        className={`${btn} bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20`}><MessageCircle size={15} /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
        className={`${btn} bg-blue-500/10 text-blue-400 hover:bg-blue-500/20`}><Facebook size={15} /></a>
      <button onClick={copy} aria-label="Copier le lien" className={`${btn} bg-white/[0.05] text-white/50 hover:bg-white/10 hover:text-white`}>
        {copied ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} />}
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button onClick={nativeShare} aria-label="Partager" className={`${btn} bg-gold-500/10 text-gold-400 hover:bg-gold-500/20`}><Share2 size={15} /></button>
      )}
    </div>
  );
}
