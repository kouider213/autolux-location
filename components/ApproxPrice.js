// Affiche un prix approximatif dans la devise du visiteur (diaspora).
// N'affiche rien si la devise visiteur = devise du prix.
import { useCurrency } from '../lib/currency';

export default function ApproxPrice({ amount, from = 'DZD', className = '' }) {
  const { cur, format } = useCurrency();
  const norm = from === 'DA' ? 'DZD' : from;
  if (!amount || cur === norm) return null;
  return <span className={`text-white/35 text-xs ${className}`}>≈ {format(amount, norm)}</span>;
}
