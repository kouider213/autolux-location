// Système d'override de contenu éditable depuis l'admin (site_settings.content JSONB).
// Chaque page lit son texte/image via cText/cImg avec un FALLBACK = la valeur actuelle
// hardcodée. Tant que l'admin n'a rien saisi → le site ne change pas (zéro risque).
//
// Forme stockée dans site_settings.content :
//   { "home_services_title": { fr:"…", ar:"…", en:"…" }, "ent_hero_img": "https://…" }

// Texte éditable : override (langue demandée → fr → fallback passé par la page).
export function cText(settings, key, lang, fallback = '') {
  const o = settings?.content?.[key];
  if (o && typeof o === 'object') {
    const v = (o[lang] || o.fr || '').trim();
    if (v) return v;
  }
  return fallback;
}

// Image éditable : override URL, sinon fallback (image actuelle du site).
export function cImg(settings, key, fallback = '') {
  const v = settings?.content?.[key];
  return (typeof v === 'string' && v.trim()) ? v.trim() : fallback;
}

// Schéma pour l'éditeur admin — groupé par page. type: 'text' (FR/AR/EN) | 'image'.
// Le placeholder = la valeur par défaut du site (affichée si vide).
export const CONTENT_FIELDS = [
  { group: 'Accueil', items: [
    { key: 'home_services_title', type: 'text', label: 'Titre section services (1ère partie, avant le mot doré)', def: 'Nos' },
    { key: 'home_why_title',      type: 'text', label: 'Titre section "pourquoi" (1ère partie, avant le mot doré)', def: 'Pourquoi' },
  ] },
  { group: 'Entreprises', items: [
    { key: 'ent_hero_img',     type: 'image', label: 'Photo hero (Mercedes/chauffeur)' },
    { key: 'ent_hero_title_a', type: 'text', label: 'Titre hero (1ère partie)', def: 'Vos équipes à Oran,' },
    { key: 'ent_hero_title_b', type: 'text', label: 'Titre hero (partie dorée)', def: 'prises en charge de A à Z' },
    { key: 'ent_hero_sub',     type: 'text', label: 'Sous-titre hero', def: 'Pour les sociétés et leurs partenaires algériens : véhicule avec chauffeur, logement et accompagnement clé en main.' },
    { key: 'ent_pack1_name',   type: 'text', label: 'Pack 1 — nom', def: 'Platinium' },
    { key: 'ent_pack1_desc',   type: 'text', label: 'Pack 1 — description', def: 'Mobilité + logement pour vos équipes' },
    { key: 'ent_pack2_name',   type: 'text', label: 'Pack 2 — nom', def: 'Gold' },
    { key: 'ent_pack2_desc',   type: 'text', label: 'Pack 2 — description', def: 'Confort supérieur pour cadres et délégations' },
    { key: 'ent_pack3_name',   type: 'text', label: 'Pack 3 — nom', def: 'Diamant' },
    { key: 'ent_pack3_desc',   type: 'text', label: 'Pack 3 — description', def: 'Clé en main total : on gère tout sur place' },
  ] },
];
