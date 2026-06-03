import { supabase } from '../../lib/supabase';
import { DEFAULT_SETTINGS } from '../../lib/settings';
import { DEFAULT_FAQ } from '../../lib/faq';

// Contexte LIVE pour le chatbot "Fik".
// Le backend du chatbot appelle cette URL pour avoir toutes les infos à jour
// (voitures, prix, vente, immo, conditions, FAQ, contact) sans copier-coller.
// GET /api/assistant-context            -> texte prêt pour le prompt (défaut)
// GET /api/assistant-context?format=json -> données structurées

const cur = (c) => (c === 'EUR' ? '€' : 'DA');

export default async function handler(req, res) {
  // CORS : le chatbot est sur un autre domaine (Railway)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=120'); // 2 min de cache
  if (req.method === 'OPTIONS') return res.status(200).end();

  let settings = DEFAULT_SETTINGS, cars = [], sale = [], immo = [], conditions = null, faq = DEFAULT_FAQ;

  try {
    if (supabase) {
      const [s, c, v, p, cond, f] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).single(),
        supabase.from('cars').select('name, resale_price, currency, category, seats, fuel, transmission, available').eq('available', true),
        supabase.from('vehicles_for_sale').select('brand, model, year, price, currency, fuel, mileage, status').neq('status', 'vendu'),
        supabase.from('properties').select('title, city, district, transaction, price, currency, bedrooms, surface, status').neq('status', 'vendu').neq('status', 'loue'),
        supabase.from('site_conditions').select('*').order('position', { ascending: true }),
        supabase.from('site_faq').select('*').order('position', { ascending: true }),
      ]);
      if (s.data) settings = { ...DEFAULT_SETTINGS, ...s.data };
      cars = c.data || [];
      sale = v.data || [];
      immo = p.data || [];
      if (cond.data && cond.data.length) {
        conditions = cond.data;
      }
      if (f.data && f.data.length) faq = f.data;
    }
  } catch { /* fallback defaults */ }

  const wa = (settings.whatsapp || '').replace(/\D/g, '');

  // ---- format JSON ----
  if (req.query.format === 'json') {
    return res.status(200).json({
      business: 'Fik Conciergerie', city: 'Oran, Algérie',
      whatsapp: wa, address: settings.address, maps: settings.maps_url,
      rental_rules: {
        caution: false, acompte: '3 jours', km: 'illimité (toute l\'Algérie)',
        assurance: true, clim: true, age_min: 35,
        livraison: 'aéroport d\'Oran offerte ou retrait magasin',
      },
      cars, vehicles_for_sale: sale, properties: immo, conditions, faq,
    });
  }

  // ---- format texte (défaut, prêt pour le prompt LLM) ----
  const L = [];
  L.push('# CONTEXTE LIVE — FIK CONCIERGERIE (Oran, Algérie)');
  L.push('Source à jour. Ne jamais inventer de prix : si absent, dire "je confirme sur WhatsApp".');
  L.push('');
  L.push('## CONTACT');
  L.push(`- WhatsApp : ${wa || '(non défini)'} (tout passe par WhatsApp, pas de compte obligatoire)`);
  if (settings.address) L.push(`- Adresse : ${settings.address}`);
  if (settings.phone) L.push(`- Téléphone : ${settings.phone}`);
  L.push('');
  L.push('## LOCATION DE VOITURE — RÈGLES');
  L.push('- Sans caution (aucun dépôt bloqué).');
  L.push('- Acompte de 3 jours pour bloquer un véhicule.');
  L.push('- Kilométrage illimité sur toute l\'Algérie.');
  L.push('- Assurance incluse, climatisation et chauffage inclus.');
  L.push('- Âge minimum : 35 ans (exigence assurance, non négociable).');
  L.push('- Livraison gratuite à l\'aéroport d\'Oran, ou retrait au magasin.');
  L.push('');

  if (cars.length) {
    L.push('## VOITURES DE LOCATION DISPONIBLES');
    cars.forEach(c => L.push(`- ${c.name} — ${c.resale_price ? c.resale_price + ' ' + cur(c.currency) + '/jour' : 'prix sur demande'} · ${c.category || ''} ${c.seats ? c.seats + ' places' : ''} ${c.fuel || ''} ${c.transmission || ''}`.replace(/\s+/g, ' ').trim()));
    L.push('');
  }
  if (sale.length) {
    L.push('## VOITURES À VENDRE');
    sale.forEach(v => L.push(`- ${v.brand} ${v.model}${v.year ? ' (' + v.year + ')' : ''} — ${v.price ? v.price.toLocaleString() + ' ' + cur(v.currency) : 'prix sur demande'} · ${v.fuel || ''} ${v.mileage != null ? v.mileage + ' km' : ''}`.replace(/\s+/g, ' ').trim()));
    L.push('');
  }
  if (immo.length) {
    L.push('## BIENS IMMOBILIERS');
    immo.forEach(p => L.push(`- ${p.title} — ${(p.transaction === 'vente' ? 'À vendre' : 'À louer')} ${p.price ? p.price.toLocaleString() + ' ' + cur(p.currency) + (p.transaction === 'vente' ? '' : '/mois') : 'prix sur demande'} · ${[p.district, p.city].filter(Boolean).join(', ')} ${p.bedrooms ? p.bedrooms + ' ch' : ''} ${p.surface ? p.surface + ' m²' : ''}`.replace(/\s+/g, ' ').trim()));
    L.push('');
  }

  L.push('## AUTRES SERVICES');
  L.push('- Commande/import de véhicule sur mesure (le client décrit, on trouve/importe).');
  L.push('- Espace propriétaires : confier sa voiture/son bien, via WhatsApp.');
  L.push('');

  if (conditions) {
    const pick = (it) => it.text_fr || it.text_ar || '';
    const bySec = {};
    conditions.forEach(it => { (bySec[it.section] = bySec[it.section] || []).push(pick(it)); });
    const names = { intro: 'Général', rental: 'Location', sale: 'Vente', immo: 'Immobilier', owner: 'Propriétaires' };
    L.push('## CONDITIONS');
    Object.entries(bySec).forEach(([sec, items]) => {
      L.push(`### ${names[sec] || sec}`);
      items.filter(Boolean).forEach(t => L.push(`- ${t}`));
    });
    L.push('');
  }

  if (faq.length) {
    L.push('## FAQ');
    faq.forEach(f => {
      const q = f.question_fr || f.question_ar; const a = f.answer_fr || f.answer_ar;
      if (q) L.push(`Q: ${q}\nR: ${a || ''}`);
    });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send(L.join('\n'));
}
