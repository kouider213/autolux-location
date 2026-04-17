// ============================================================
// HELPERS DATES — source unique de vérité
// Règle stricte : la DB stocke des chaînes 'YYYY-MM-DD' (type DATE),
// jamais d'objet Date sérialisé via toISOString().
// ============================================================

// Date -> 'YYYY-MM-DD' en heure locale (jamais UTC)
export const toYMD = (d) => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 'YYYY-MM-DD' -> Date (midi local pour éviter toute dérive UTC ±1 jour)
export const fromYMD = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

// Nombre de jours entre deux dates (accepte string YMD ou Date)
export const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const a = typeof start === 'string' ? fromYMD(start) : start;
  const b = typeof end === 'string' ? fromYMD(end) : end;
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
};
