// Traduction automatique du contenu dynamique (descriptions, FAQ, conditions, annonces).
// Appelle le moteur backend /api/translate (Gemini + cache Redis). Cache aussi en
// localStorage côté navigateur → instantané au 2e affichage. Ne casse jamais : en cas
// d'échec, renvoie le texte original.
import { useState, useEffect } from 'react';
import { useLang } from './i18n';

const BACKEND = process.env.NEXT_PUBLIC_IBRAHIM_BACKEND
  || 'https://ibrahim-backend-production.up.railway.app';

const mem = {}; // cache session
const AR_RE = /[؀-ۿ]/;

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* quota */ } }

export async function translateMany(texts, target) {
  if (target === 'fr' || !Array.isArray(texts) || texts.length === 0) return texts;
  const result = new Array(texts.length);
  const missing = [], missingIdx = [];

  texts.forEach((t, i) => {
    const s = String(t ?? '');
    if (!s.trim()) { result[i] = t; return; }
    // L'arabe déjà saisi n'a pas besoin d'être traduit vers l'arabe
    if (target === 'ar' && AR_RE.test(s)) { result[i] = s; return; }
    const ck = target + '' + s;
    const cached = mem[ck] ?? lsGet('tr:' + target + ':' + s);
    if (cached != null) { result[i] = cached; mem[ck] = cached; }
    else { missing.push(s); missingIdx.push(i); }
  });

  if (missing.length > 0) {
    try {
      const r = await fetch(BACKEND + '/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: missing, target }),
      });
      const d = await r.json();
      const tr = Array.isArray(d.translations) ? d.translations : missing;
      tr.forEach((val, j) => {
        const i = missingIdx[j];
        result[i] = val;
        mem[target + '' + missing[j]] = val;
        lsSet('tr:' + target + ':' + missing[j], val);
      });
    } catch {
      missingIdx.forEach((i, j) => { result[i] = missing[j]; });
    }
  }
  return result;
}

// Hook : traduit une chaîne ou un tableau vers la langue courante (fr = inchangé).
export function useTranslated(input) {
  const { lang } = useLang();
  const isArr = Array.isArray(input);
  const [out, setOut] = useState(input);

  useEffect(() => {
    let alive = true;
    if (lang === 'fr' || input == null) { setOut(input); return; }
    const texts = isArr ? input : [input];
    translateMany(texts, lang).then(res => { if (alive) setOut(isArr ? res : res[0]); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, isArr ? input.join('') : input]);

  return out;
}
