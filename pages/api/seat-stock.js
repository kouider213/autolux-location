// Sièges bébé encore libres sur une période : stock (Admin › Paramètres) moins les sièges
// demandés dans les résas qui chevauchent (lus dans bookings.notes, ligne « 👶 Siège bébé »).
// GET ?start=YYYY-MM-DD&end=YYYY-MM-DD → { coque: n|null, siege: n|null, rehausseur: n|null } (null = illimité)
import { supabaseAdmin } from '../../lib/supabase';
import { getExtras, SEAT_NOTE_KEYS } from '../../lib/extras';

export default async function handler(req, res) {
  const { start, end } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || '')) {
    return res.status(400).json({ error: 'Dates invalides' });
  }
  const admin = supabaseAdmin();
  if (!admin) return res.status(200).json({ coque: null, siege: null, rehausseur: null });

  const { data: st } = await admin.from('site_settings').select('content').eq('id', 1).single();
  const ex = getExtras(st);
  const stock = {};
  for (const k of Object.keys(SEAT_NOTE_KEYS)) {
    const v = ex[`stock_${k}`];
    stock[k] = v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v);
  }
  if (Object.values(stock).every(v => v === null)) return res.status(200).json(stock);

  const { data: bookings } = await admin.from('bookings')
    .select('notes')
    .in('status', ['PENDING', 'CONFIRMED', 'ACTIVE', 'ACCEPTED'])
    .lte('start_date', end)
    .gte('end_date', start)
    .ilike('notes', '%Siège bébé%');

  const used = { coque: 0, siege: 0, rehausseur: 0 };
  for (const b of bookings || []) {
    const line = (b.notes || '').split('\n').find(l => l.includes('Siège bébé')) || '';
    for (const [k, word] of Object.entries(SEAT_NOTE_KEYS)) used[k] += line.split(word).length - 1;
  }
  const out = {};
  for (const k of Object.keys(stock)) out[k] = stock[k] === null ? null : Math.max(0, stock[k] - used[k]);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(out);
}
