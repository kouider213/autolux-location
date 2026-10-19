// Options de réservation (page /reservation) : lieux de prise/retour, vol, 2e conducteur,
// Wi-Fi 4G, carte SIM, plein au retour, sièges bébé (gratuits, stock limité).
// Prix réglés dans Admin › Paramètres, rangés dans site_settings.content.extras (pas de colonne).
// Prix vide = « à confirmer » (non ajouté au total), 0 = offert.

export const DEFAULT_EXTRAS = {
  driver2_day: '',       // € / jour
  wifi_day: '',          // € / jour
  sim: '',               // € une fois
  fuel_fee: '',          // € une fois (frais de service, carburant facturé en plus)
  delivery_airport: '',  // € par trajet (prise OU retour à l'aéroport)
  delivery_address: '',  // € par trajet (prise OU retour à une adresse)
  stock_coque: '',       // nb de sièges possédés — vide = illimité
  stock_siege: '',
  stock_rehausseur: '',
};

export function getExtras(settings) {
  return { ...DEFAULT_EXTRAS, ...(settings?.content?.extras || {}) };
}

// '' / null → null (à confirmer), sinon nombre
export const priceOf = (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

const L3 = (lang, frT, enT, arT) => (lang === 'ar' ? arT : lang === 'en' ? enT : frT);

// ── Lieux
export const PLACES = ['agence', 'aeroport', 'adresse'];
export function placeLabel(p, lang) {
  if (p === 'aeroport') return L3(lang, 'Aéroport d\'Oran', 'Oran airport', 'مطار وهران');
  if (p === 'adresse')  return L3(lang, 'Livraison à une adresse', 'Delivery to an address', 'توصيل إلى عنوان');
  return L3(lang, 'Agence Hay Badr', 'Hay Badr agency', 'وكالة حي بدر');
}

// ── Siège bébé : âge de l'enfant (en mois) → siège adapté
export const CHILD_AGES = [0, 6, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
export function childAgeLabel(m, lang) {
  if (m === 0) return L3(lang, 'Moins de 6 mois', 'Under 6 months', 'أقل من 6 أشهر');
  if (m === 6) return L3(lang, '6 à 12 mois', '6–12 months', '6 إلى 12 شهرًا');
  const y = m / 12;
  return L3(lang, `${y} an${y > 1 ? 's' : ''}`, `${y} year${y > 1 ? 's' : ''}`, `${y} ${y > 2 && y < 11 ? 'سنوات' : 'سنة'}`);
}
export const seatKind = (m) => (m < 12 ? 'coque' : m < 48 ? 'siege' : 'rehausseur');
export function seatLabel(kind, lang) {
  if (kind === 'coque') return L3(lang, 'coque bébé (groupe 0+)', 'infant carrier (group 0+)', 'مقعد رضيع (فئة 0+)');
  if (kind === 'siege') return L3(lang, 'siège auto (groupe 1)', 'child car seat (group 1)', 'مقعد أطفال (فئة 1)');
  return L3(lang, 'rehausseur (groupe 2/3)', 'booster seat (group 2/3)', 'مقعد رافع (فئة 2/3)');
}
export const seatForAge = (m, lang) => seatLabel(seatKind(m), lang);

// Mots-clés FR retrouvés dans bookings.notes pour compter les sièges déjà pris (voir /api/seat-stock)
export const SEAT_NOTE_KEYS = { coque: 'coque bébé', siege: 'siège auto', rehausseur: 'rehausseur' };

export function babySeatSummary(form, lang = 'fr') {
  if (!form.babySeat) return null;
  const ages = form.babyAges.filter(a => a !== '').map(Number);
  if (!ages.length) return null;
  return `${ages.length} — ` + ages.map(m => `${childAgeLabel(m, lang)} → ${seatForAge(m, lang)}`).join(' ; ');
}

// Nombre de sièges demandés par type
export function seatsWanted(form) {
  const n = { coque: 0, siege: 0, rehausseur: 0 };
  if (form.babySeat) form.babyAges.filter(a => a !== '').forEach(a => { n[seatKind(Number(a))]++; });
  return n;
}

// ── Coût des options : [{ key, label, amount|null }] (null = à confirmer)
export function extrasCost(form, ex, days, lang = 'fr') {
  const items = [];
  const add = (key, label, unit, mult = 1) => {
    const p = priceOf(unit);
    items.push({ key, label, amount: p === null ? null : p * mult });
  };
  [['pickup', L3(lang, 'Livraison', 'Delivery', 'التوصيل')], ['dropoff', L3(lang, 'Récupération', 'Collection', 'الاستلام')]].forEach(([k, word]) => {
    const p = form[k];
    if (p === 'aeroport') add(k, `${word} — ${placeLabel('aeroport', lang)}`, ex.delivery_airport);
    if (p === 'adresse')  add(k, `${word} — ${L3(lang, 'adresse', 'address', 'عنوان')}`, ex.delivery_address);
  });
  if (form.driver2) add('driver2', L3(lang, '2e conducteur', '2nd driver', 'سائق ثانٍ'), ex.driver2_day, Math.max(days, 1));
  if (form.wifi)    add('wifi', L3(lang, 'Wi-Fi 4G', '4G Wi-Fi', 'واي فاي 4G'), ex.wifi_day, Math.max(days, 1));
  if (form.sim)     add('sim', L3(lang, 'Carte SIM', 'SIM card', 'شريحة SIM'), ex.sim);
  if (form.fuel)    add('fuel', L3(lang, 'Plein au retour (service)', 'Refuel on return (service)', 'تعبئة الوقود عند الإرجاع (خدمة)'), ex.fuel_fee);
  if (form.babySeat) items.push({ key: 'baby', label: L3(lang, 'Siège bébé', 'Baby seat', 'مقعد طفل'), amount: 0 });
  const sum = items.reduce((s, i) => s + (i.amount || 0), 0);
  return { items, sum, pending: items.some(i => i.amount === null) };
}

// ── Lignes lisibles (notes de la résa, WhatsApp, Telegram)
export function extrasLines(form, lang = 'fr') {
  const out = [];
  const place = (k, word) => {
    const p = form[k] || 'agence';
    let s = `📍 ${word} : ${placeLabel(p, lang)}`;
    if (p === 'adresse' && form[k + 'Address']) s += ` — ${form[k + 'Address']}`;
    if (p === 'aeroport' && k === 'pickup' && form.flight) {
      s += ` — ${L3(lang, 'vol', 'flight', 'رحلة')} ${form.flight}${form.arrival ? `, ${L3(lang, 'arrivée', 'arrival', 'الوصول')} ${form.arrival}` : ''}`;
    }
    out.push(s);
  };
  place('pickup', L3(lang, 'Prise', 'Pick-up', 'الاستلام'));
  place('dropoff', L3(lang, 'Retour', 'Return', 'الإرجاع'));
  if (form.driver2) out.push(`👤 ${L3(lang, '2e conducteur', '2nd driver', 'سائق ثانٍ')} : ${form.driver2Name} (${form.driver2Age} ${L3(lang, 'ans', 'y/o', 'سنة')})`);
  const opts = [
    form.wifi && `📶 ${L3(lang, 'Wi-Fi 4G', '4G Wi-Fi', 'واي فاي 4G')}`,
    form.sim  && `📱 ${L3(lang, 'Carte SIM', 'SIM card', 'شريحة SIM')}`,
    form.fuel && `⛽ ${L3(lang, 'Plein au retour par nos soins', 'We refuel on return', 'نعبّئ الوقود عند الإرجاع')}`,
  ].filter(Boolean);
  if (opts.length) out.push(opts.join(' · '));
  const baby = babySeatSummary(form, lang);
  if (baby) out.push(`👶 ${L3(lang, 'Siège bébé (offert)', 'Baby seat (free)', 'مقعد طفل (مجاني)')} : ${baby}`);
  return out;
}
