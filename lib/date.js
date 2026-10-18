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

// Jours de location = blocs de 24 h (3→7 nov = 4 jours), minimum 1 (aller-retour le même jour).
// Même règle que Dzaryx (rentalDays côté backend) : plus jamais de « jours inclus » +1.
export const rentalDays = (start, end) => (start && end ? Math.max(1, daysBetween(start, end)) : 0);
