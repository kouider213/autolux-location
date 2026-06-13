// Traduction côté serveur via le backend Dzaryx (/api/translate, Groq). Best-effort.
const BACKEND = process.env.NEXT_PUBLIC_IBRAHIM_BACKEND || 'https://ibrahim-backend-production.up.railway.app';

export async function translateTexts(texts, target) {
  if (!Array.isArray(texts) || texts.length === 0 || target === 'fr') return texts;
  try {
    const r = await fetch(BACKEND + '/api/translate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target }),
    });
    const d = await r.json();
    return Array.isArray(d.translations) && d.translations.length === texts.length ? d.translations : texts;
  } catch { return texts; }
}

// Traduit du HTML en préservant les balises (<img>, <a href>, <b>…) : seul le texte visible est traduit.
export async function translateHtml(html, target) {
  if (!html || target === 'fr') return html;
  const parts = String(html).split(/(<[^>]+>)/g); // indices pairs = texte, impairs = balises
  const idxs = [], texts = [];
  parts.forEach((p, i) => { if (i % 2 === 0 && p.trim()) { idxs.push(i); texts.push(p); } });
  if (texts.length === 0) return html;
  const tr = await translateTexts(texts, target);
  idxs.forEach((i, j) => { parts[i] = tr[j] ?? parts[i]; });
  return parts.join('');
}
