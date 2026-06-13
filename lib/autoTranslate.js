// Traduction automatique du contenu dynamique (descriptions, FAQ, conditions, annonces).
// Appelle le moteur backend /api/translate (Gemini + cache Redis). Cache aussi en
// localStorage côté navigateur → instantané au 2e affichage. Ne casse jamais : en cas
// d'échec, renvoie le texte original.
import { useState, useEffect } from 'react';
import { useLang } from './i18n';

// Endpoint de traduction hébergé sur le site (autonome Groq → repli Railway).
const TRANSLATE_API = '/api/translate';

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
      const r = await fetch(TRANSLATE_API, {
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

// Traduit un texte VERS le français (pour l'admin : comprendre un message client en ar/en).
export async function translateToFR(text) {
  const s = String(text ?? '').trim();
  if (!s) return s;
  const ck = 'tr:fr:' + s;
  const cached = mem['fr' + s] ?? lsGet(ck);
  if (cached != null) return cached;
  try {
    const r = await fetch(TRANSLATE_API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [s], target: 'fr' }),
    });
    const d = await r.json();
    const out = Array.isArray(d.translations) && d.translations[0] ? d.translations[0] : s;
    mem['fr' + s] = out; lsSet(ck, out);
    return out;
  } catch { return s; }
}

// Composant : <T>texte français</T> → auto-traduit vers la langue courante.
// Pour tout texte d'interface écrit en dur. fr = inchangé. Mise en cache.
export function T({ children }) {
  const txt = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
  const out = useTranslated(txt);
  return out;
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
