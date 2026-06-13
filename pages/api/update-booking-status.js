import { createClient } from '@supabase/supabase-js';
import { sendEmail, bookingConfirmedEmail, bookingStatusEmail } from '../../lib/email';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

  const { bookingId, status, finalPrice } = req.body;

  if (!bookingId || !status) {
        return res.status(400).json({ error: 'bookingId et status sont requis' });
  }

  const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Statut invalide' });
    }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[update-booking-status] Variables manquantes:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
        return res.status(503).json({
                error: 'Configuration serveur incomplète',
                hint: 'Ajouter SUPABASE_SERVICE_ROLE_KEY dans les variables Vercel',
        });
  }

  // Service role key : contourne le RLS pour les opérations admin
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
  });

  const updatePayload = { status };

  if (status === 'ACCEPTED' && finalPrice !== undefined && finalPrice !== null && finalPrice !== '') {
        const price = Number(finalPrice);
        if (!isNaN(price) && price > 0) {
                updatePayload.final_price = price;

          const { data: booking } = await supabase
                  .from('bookings')
                  .select('base_price_snapshot')
                  .eq('id', bookingId)
                  .single();

          if (booking?.base_price_snapshot) {
                    updatePayload.profit = price - booking.base_price_snapshot;
          }
        }
  }

  const { error, count } = await supabase
      .from('bookings')
      .update(updatePayload, { count: 'exact' })
      .eq('id', bookingId);

  if (error) {
        console.error('[update-booking-status] Erreur Supabase:', error);
        return res.status(500).json({ error: error.message });
  }

  if (count === 0) {
        console.warn('[update-booking-status] Aucune ligne mise à jour — bookingId:', bookingId);
        return res.status(404).json({ error: 'Réservation introuvable ou non modifiée' });
  }

  // Email auto au client si email présent (confirmée OU refusée) — non bloquant
  if (status === 'ACCEPTED' || status === 'REJECTED') {
    try {
      const { data: b } = await supabase
        .from('bookings')
        .select('client_name, client_email, start_date, end_date, final_price, currency, cars(name)')
        .eq('id', bookingId).single();
      if (b?.client_email && /@/.test(b.client_email)) {
        const payload = {
          client_name: b.client_name, car_name: b.cars?.name,
          start_date: b.start_date, end_date: b.end_date,
          total: b.final_price, currency: b.currency, booking_id: bookingId, status,
        };
        const { subject, html } = status === 'ACCEPTED' ? bookingConfirmedEmail(payload) : bookingStatusEmail(payload);
        sendEmail(b.client_email, subject, html).catch(() => {});
      }
    } catch { /* non bloquant */ }
  }

  console.log(`[update-booking-status] OK — booking ${bookingId} => ${status}`);
    return res.status(200).json({ success: true, status, count });
}
