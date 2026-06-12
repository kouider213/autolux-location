// Favoris voitures — stockés dans le navigateur (localStorage). Aucun compte requis.
import { useState, useEffect, useCallback } from 'react';

const KEY = 'fik:favorites';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); window.dispatchEvent(new Event('fik:favchange')); } catch { /* quota */ }
}

export function useFavorites() {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener('fik:favchange', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('fik:favchange', sync); window.removeEventListener('storage', sync); };
  }, []);

  const toggle = useCallback((id) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    write(next);
    setIds(next);
  }, []);

  const isFav = useCallback((id) => ids.includes(id), [ids]);
  return { ids, toggle, isFav, count: ids.length };
}
