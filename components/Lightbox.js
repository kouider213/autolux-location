import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Visionneuse plein écran réutilisable (vente, location, immo).
// Clic sur une photo → ouverture ; flèches / swipe pour naviguer ; X ou fond pour fermer.
export default function Lightbox({ photos = [], startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const touchX = useRef(null);

  useEffect(() => { setIdx(startIndex); }, [startIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [photos.length, onClose]);

  if (!photos.length) return null;
  const next = (e) => { e?.stopPropagation(); setIdx(i => (i + 1) % photos.length); };
  const prev = (e) => { e?.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); };

  return (
    <div
      onClick={onClose}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 50) prev(); else if (dx < -50) next();
        touchX.current = null;
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button onClick={(e) => { e.stopPropagation(); onClose?.(); }}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10">
        <X size={22} />
      </button>

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-10">
          {idx + 1} / {photos.length}
        </div>
      )}

      {/* Image */}
      <img
        src={photos[idx]}
        alt={`photo ${idx + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '94vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
      />

      {/* Arrows */}
      {photos.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <ChevronLeft size={26} />
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>
  );
}
