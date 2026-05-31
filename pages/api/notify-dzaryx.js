import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;

  let title = '';
  let message = '';

  if (type === 'new_booking') {
    title = `🚗 Nouvelle réservation — ${data.car_name}`;
    message = [
      `Client: ${data.client_name} | Tél: ${data.client_phone} | Âge: ${data.client_age} ans`,
      `Dates: ${data.start_date} → ${data.end_date}`,
      `Total: ${data.total}€`,
      data.notes ? `Notes: ${data.notes}` : null,
    ].filter(Boolean).join('\n');
  } else if (type === 'new_review') {
    title = `⭐ Nouvel avis (${data.rating}/5) — ${data.client_name}`;
    message = `"${data.comment}"`;
  } else if (type === 'booking_status') {
    title = `📋 Réservation mise à jour`;
    message = `${data.car_name} / ${data.client_name} → ${data.status}`;
  } else {
    title = data?.title || 'Notification Fik Conciergerie';
    message = data?.message || JSON.stringify(data);
  }

  try {
    const { error } = await supabase.from('notifications').insert([{
      type:     type || 'fik_event',
      channel:  'socket',
      title,
      message,
      priority: type === 'new_booking' ? 1 : 0,
      payload:  data || {},
      status:   'pending',
    }]);

    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Dzaryx notify error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
