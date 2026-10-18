// Formatage prix selon devise — DZD = "DA", EUR = "€"
export const curSymbol = (c) => (c === 'EUR' ? '€' : 'DA');

// priceFmt(12000, 'DZD') -> "12 000 DA"  |  priceFmt(55, 'EUR') -> "55 €"
export function priceFmt(amount, currency = 'DZD') {
  if (amount == null || amount === '') return null;
  const n = Number(amount);
  if (Number.isNaN(n)) return null;
  return `${n.toLocaleString('fr-FR')} ${curSymbol(currency)}`;
}

// Numéro lisible : 32466311469 → +32 466 31 14 69 ; 213551234567 → +213 551 23 45 67 ; 33612345678 → +33 6 12 34 56 78
export function formatIntl(n) {
  const d = String(n || '').replace(/\D/g, '');
  const cc = ['213', '32', '33'].find(c => d.startsWith(c));
  if (!cc) return `+${d}`;
  const rest = d.slice(cc.length);
  const head = cc === '33' ? 1 : 3;
  return `+${cc} ${rest.slice(0, head)} ${rest.slice(head).replace(/(\d{2})(?=\d)/g, '$1 ')}`.trim();
}
