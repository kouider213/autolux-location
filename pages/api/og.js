import { ImageResponse } from 'next/og';

export const config = { runtime: 'edge' };

// Image de partage (Open Graph) 1200x630 générée dynamiquement.
// Utilisée comme aperçu quand on partage le lien (WhatsApp, Facebook, etc.).
export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
          background: 'radial-gradient(120% 120% at 50% 0%, #1a1505 0%, #0a0a0a 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* barre dorée haut */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, transparent, #e2b614, transparent)' }} />

        {/* clé / logo stylisé */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 110, height: 110, borderRadius: 28, background: 'rgba(226,182,20,0.12)', border: '2px solid rgba(226,182,20,0.4)', marginBottom: 34 }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#e2b614' }}>F</div>
        </div>

        <div style={{ display: 'flex', fontSize: 78, fontWeight: 900, letterSpacing: -2 }}>
          <span style={{ color: '#ffffff' }}>Fik&nbsp;</span>
          <span style={{ color: '#e2b614' }}>Conciergerie</span>
        </div>

        <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.55)', marginTop: 18, textAlign: 'center' }}>
          Voiture · Immobilier · Import · Séjour — Oran, Algérie
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 40 }}>
          {['Sans caution', 'Kilométrage illimité', '7j/7 · WhatsApp'].map((tx) => (
            <div key={tx} style={{ display: 'flex', fontSize: 24, color: '#e2b614', background: 'rgba(226,182,20,0.10)', border: '1px solid rgba(226,182,20,0.25)', padding: '10px 22px', borderRadius: 999 }}>
              {tx}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
