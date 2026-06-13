// Traduction hébergée SUR le site (Vercel) — indépendante de Railway.
// Groq (gratuit) → repli Railway → texte original. Ne renvoie jamais d'erreur bloquante.
import { translateSmart } from '../../lib/groqTranslate';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { texts, target } = req.body || {};
  if (!Array.isArray(texts) || !target) return res.status(400).json({ error: 'texts (array) + target requis' });
  const translations = await translateSmart(texts, target);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({ translations });
}
