// Formatage prix selon devise — DZD = "DA", EUR = "€"
export const curSymbol = (c) => (c === 'EUR' ? '€' : 'DA');

// priceFmt(12000, 'DZD') -> "12 000 DA"  |  priceFmt(55, 'EUR') -> "55 €"
export function priceFmt(amount, currency = 'DZD') {
  if (amount == null || amount === '') return null;
  const n = Number(amount);
  if (Number.isNaN(n)) return null;
  return `${n.toLocaleString('fr-FR')} ${curSymbol(currency)}`;
}
