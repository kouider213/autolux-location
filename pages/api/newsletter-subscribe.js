// Inscription newsletter (public). Email + langue. Anti-doublon via index unique.
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail, newsletterWelcomeEmail } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { email, lang = 'fr', source = 'site' } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const clean = String(email).trim().toLowerCase();
  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'config serveur manquante' });

  // L'index unique est sur lower(email) (expression) → onConflict:'email' échoue ("no unique constraint
  // matching", swallowé à tort comme doublon). On insère + réactive un éventuel désabonné explicitement.
  const { error } = await admin
    .from('newsletter_subscribers')
    .insert({ email: clean, lang, source, status: 'active' });

  if (error) {
    if (/duplicate key|already exists/i.test(error.message)) {
      // Déjà inscrit → on réactive (au cas où désabonné) — idempotent
      await admin.from('newsletter_subscribers').update({ status: 'active', lang }).ilike('email', clean);
    } else {
      console.error('[newsletter]', error.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Email de bienvenue (non bloquant)
  const { subject, html } = newsletterWelcomeEmail();
  sendEmail(clean, subject, html).catch(() => {});

  return res.json({ ok: true });
}
