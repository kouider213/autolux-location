// Conversion de devise approximative pour la diaspora.
// Base = DZD. Taux indicatifs (1 unité étrangère = X DZD), rafraîchis si une API répond.
import { useState, useEffect, useCallback } from 'react';

const KEY = 'fik:currency';
const RATES_KEY = 'fik:fxrates';

// Taux de secours (mis à jour ~2026). 1 EUR ≈ 145 DZD (marché), etc.
const FALLBACK = { DZD: 1, EUR: 145, USD: 134, GBP: 170, CAD: 98 };

export const CURRENCIES = [
  { code: 'DZD', label: 'DA', name: 'Dinar' },
  { code: 'EUR', label: '€', name: 'Euro' },
  { code: 'USD', label: '$', name: 'Dollar US' },
  { code: 'GBP', label: '£', name: 'Livre' },
  { code: 'CAD', label: 'C$', name: 'Dollar CA' },
];

const SYMBOL = { DZD: 'DA', EUR: '€', USD: '$', GBP: '£', CAD: 'C$' };

function detect() {
  try {
    const lang = (navigator.language || 'fr').toLowerCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/algiers|africa\/algiers/i.test(tz)) return 'DZD';
    if (/\bgb\b|en-gb|london/i.test(lang + tz)) return 'GBP';
    if (/\bus\b|en-us|new_york|los_angeles|chicago/i.test(lang + tz)) return 'USD';
    if (/canada|toronto|montreal|en-ca|fr-ca/i.test(lang + tz)) return 'CAD';
    if (/paris|brussels|madrid|berlin|rome|fr-fr|fr-be|es|de|it/i.test(lang + tz)) return 'EUR';
  } catch {}
  return 'EUR'; // diaspora par défaut
}

function loadRates() {
  try {
    const raw = JSON.parse(localStorage.getItem(RATES_KEY) || 'null');
    if (raw && raw.rates && Date.now() - raw.at < 7 * 864e5) return raw.rates;
  } catch {}
  return FALLBACK;
}

export function useCurrency() {
  const [cur, setCurState] = useState('DZD');
  const [rates, setRates] = useState(FALLBACK);

  useEffect(() => {
    let saved;
    try { saved = localStorage.getItem(KEY); } catch {}
    setCurState(saved || detect());
    setRates(loadRates());

    // Rafraîchit les taux en arrière-plan (API gratuite, sans clé). Échec silencieux.
    fetch('https://open.er-api.com/v6/latest/DZD')
      .then(r => r.json())
      .then(d => {
        if (!d || !d.rates) return;
        const r = { DZD: 1 };
        for (const c of ['EUR', 'USD', 'GBP', 'CAD']) {
          if (d.rates[c]) r[c] = 1 / d.rates[c]; // 1 devise = X DZD
        }
        setRates(r);
        try { localStorage.setItem(RATES_KEY, JSON.stringify({ at: Date.now(), rates: r })); } catch {}
      })
      .catch(() => {});
  }, []);

  const setCur = useCallback((c) => {
    setCurState(c);
    try { localStorage.setItem(KEY, c); window.dispatchEvent(new Event('fik:curchange')); } catch {}
  }, []);

  useEffect(() => {
    const sync = () => { try { setCurState(localStorage.getItem(KEY) || 'DZD'); } catch {} };
    window.addEventListener('fik:curchange', sync);
    return () => window.removeEventListener('fik:curchange', sync);
  }, []);

  // Convertit `amount` (dans la devise `from`) vers la devise sélectionnée
  const convert = useCallback((amount, from = 'DZD') => {
    const a = Number(amount) || 0;
    const inDzd = a * (rates[from] || FALLBACK[from] || 1);
    return inDzd / (rates[cur] || FALLBACK[cur] || 1);
  }, [rates, cur]);

  const format = useCallback((amount, from = 'DZD') => {
    const v = convert(amount, from);
    const rounded = cur === 'DZD' ? Math.round(v / 10) * 10 : Math.round(v);
    return `${rounded.toLocaleString('fr-FR')} ${SYMBOL[cur]}`;
  }, [convert, cur]);

  return { cur, setCur, convert, format, symbol: SYMBOL[cur] };
}

export { SYMBOL };
