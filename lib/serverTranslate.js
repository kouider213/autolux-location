// Traduction côté serveur — autonome (Groq → repli Railway → original). Voir lib/groqTranslate.
import { translateSmart } from './groqTranslate';

export async function translateTexts(texts, target) {
  if (!Array.isArray(texts) || texts.length === 0 || target === 'fr') return texts;
  return translateSmart(texts, target);
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
