// Traduction autonome : Groq (gratuit) en priorité, repli backend Railway, puis texte original.
// → tant qu'on a GROQ_API_KEY sur Vercel, la traduction ne dépend de RIEN d'autre (ni Railway).
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const RAILWAY = process.env.NEXT_PUBLIC_IBRAHIM_BACKEND || 'https://ibrahim-backend-production.up.railway.app';

const LANG_NAME = { fr: 'French', ar: 'Arabic', en: 'English' };

// Traduction via Groq (API compatible OpenAI). Renvoie un tableau aligné ou null si échec.
async function groqTranslate(texts, target) {
  if (!GROQ_KEY) return null;
  const lang = LANG_NAME[target] || target;
  const prompt = `Translate each element of this JSON array into ${lang}. Keep meaning natural and professional. Do NOT translate proper nouns, brand names, URLs, emails or numbers. Return ONLY a JSON array of strings, same length and order, nothing else.\n\n${JSON.stringify(texts)}`;
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a precise translation engine. Output only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const content = d?.choices?.[0]?.message?.content || '';
    // Le modèle peut renvoyer { "translations": [...] } ou directement [...]
    let parsed;
    try { parsed = JSON.parse(content); } catch { return null; }
    const arr = Array.isArray(parsed) ? parsed : (parsed.translations || parsed.result || parsed.items);
    if (Array.isArray(arr) && arr.length === texts.length) return arr.map(String);
    return null;
  } catch { return null; }
}

// Repli backend Railway (ancien moteur).
async function railwayTranslate(texts, target) {
  try {
    const r = await fetch(RAILWAY + '/api/translate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target }),
    });
    const d = await r.json();
    return Array.isArray(d.translations) && d.translations.length === texts.length ? d.translations : null;
  } catch { return null; }
}

// Traduction "intelligente" : Groq → Railway → original (ne casse jamais).
export async function translateSmart(texts, target) {
  if (!Array.isArray(texts) || texts.length === 0 || !target) return texts;
  return (await groqTranslate(texts, target)) || (await railwayTranslate(texts, target)) || texts;
}
