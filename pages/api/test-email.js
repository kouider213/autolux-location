// Test rapide de l'envoi email. Visite : /api/test-email?to=ton@email.com
// Dit clairement si la clé Resend est configurée et si l'envoi a marché.
import { sendEmail } from '../../lib/email';

export default async function handler(req, res) {
  const to = req.query.to;
  const hasKey = !!process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev (défaut)';

  if (!hasKey) {
    return res.status(200).json({
      ok: false,
      configured: false,
      message: "RESEND_API_KEY n'est PAS configurée sur Vercel. Ajoute-la dans Vercel > Settings > Environment Variables, puis redeploy.",
      from,
    });
  }
  if (!to || !/@/.test(to)) {
    return res.status(400).json({ ok: false, configured: true, message: 'Ajoute ?to=ton@email.com à l\'URL.', from });
  }

  const r = await sendEmail(to, 'Test — Fik Conciergerie', '<p>Ceci est un email de test depuis ton site. Si tu le reçois, tout marche ✅</p>');
  return res.status(200).json({
    ok: !!r.ok,
    configured: true,
    from,
    sent_to: to,
    result: r,
    message: r.ok ? 'Email envoyé ! Vérifie ta boîte (et les spams).' : 'Échec — domaine pas vérifié dans Resend, ou email destinataire non autorisé en mode test.',
  });
}
