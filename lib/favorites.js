// Favoris multi-produits (voiture, vente, immo, pack) — stockés dans le navigateur
// (localStorage). Aucun compte requis. Clé = "type:id" (ex. "car:uuid", "immo:uuid").
import { useState, useEffect, useCallback } from 'react';

const KEY = 'fik:favorites';

function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    // Rétro-compat : anciens favoris = simples ids voiture → préfixe "car:"
    return arr.map((x) => (typeof x === 'string' && x.includes(':') ? x : `car:${x}`));
  } catch { return []; }
}
function write(keys) {
  try { localStorage.setItem(KEY, JSON.stringify(keys)); window.dispatchEvent(new Event('fik:favchange')); } catch { /* quota */ }
}

const k = (type, id) => `${type}:${id}`;

export function useFavorites() {
  const [keys, setKeys] = useState([]);
  useEffect(() => {
    setKeys(read());
    const sync = () => setKeys(read());
    window.addEventListener('fik:favchange', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('fik:favchange', sync); window.removeEventListener('storage', sync); };
  }, []);

  const toggle = useCallback((id, type = 'car') => {
    const key = k(type, id);
    const cur = read();
    const next = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
    write(next);
    setKeys(next);
  }, []);

  const isFav = useCallback((id, type = 'car') => keys.includes(k(type, id)), [keys]);

  // ids par type : { car: [...], immo: [...], vente: [...], pack: [...] }
  const byType = useCallback(() => {
    const out = { car: [], immo: [], vente: [], pack: [] };
    for (const key of keys) {
      const i = key.indexOf(':');
      const type = key.slice(0, i); const id = key.slice(i + 1);
      if (!out[type]) out[type] = [];
      out[type].push(id);
    }
    return out;
  }, [keys]);

  return { keys, toggle, isFav, byType, count: keys.length };
}
