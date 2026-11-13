import { supabase } from './supabase';

// Vraies voitures + prix pour les pages SEO (location Oran, aéroport) : Google lit des modèles et des prix réels.
export async function seoCarsProps(limit = 9) {
  try {
    if (!supabase) return { cars: [], fromPrice: '', toPrice: '' };
    const { data } = await supabase.from('cars').select('id, name, resale_price, currency, image_url, available').order('resale_price');
    const cars = (data || []).filter((c) => c.available !== false).slice(0, limit);
    const priced = (data || []).filter((c) => c.available !== false && Number(c.resale_price) > 0)
      .sort((x, y) => Number(x.resale_price) - Number(y.resale_price));
    const fmt = (c) => (c ? `${Number(c.resale_price).toLocaleString('fr-FR')} ${c.currency === 'EUR' ? '€' : 'DA'}` : '');
    return { cars, fromPrice: fmt(priced[0]), toPrice: fmt(priced[priced.length - 1]) };
  } catch {
    return { cars: [], fromPrice: '', toPrice: '' };
  }
}
