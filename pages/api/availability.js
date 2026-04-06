import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { carId, startDate, endDate } = req.query;

  if (!carId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const { data, error } = await supabase.rpc('check_car_availability', {
    p_car_id: carId,
    p_start: startDate,
    p_end: endDate,
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ available: data });
}
