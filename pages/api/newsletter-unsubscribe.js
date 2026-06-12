// Désinscription newsletter via lien email (GET).
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (email && /@/.test(email)) {
    const admin = supabaseAdmin();
    if (admin) await admin.from('newsletter_subscribers')
      .update({ status: 'unsubscribed' }).eq('email', email);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Désinscription</title></head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0e0e0e;color:#fff;font-family:system-ui,Segoe UI,Arial,sans-serif;text-align:center;padding:24px">
  <div><h1 style="font-size:20px">Vous êtes désinscrit ✅</h1><p style="color:#888;font-size:14px">Vous ne recevrez plus nos emails. <a href="https://fikconciergerie.com" style="color:#e9b949">Retour au site</a></p></div>
  </body></html>`);
}
