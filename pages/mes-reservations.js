import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Phone, Search, Loader2, Car, ArrowRight, Star, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATUS = {
  PENDING:   { label: 'En attente',  cls: 'bg-amber-500/15 text-amber-400' },
  ACCEPTED:  { label: 'Confirmée',   cls: 'bg-emerald-500/15 text-emerald-400' },
  CONFIRMED: { label: 'Confirmée',   cls: 'bg-emerald-500/15 text-emerald-400' },
  ACTIVE:    { label: 'En cours',    cls: 'bg-blue-500/15 text-blue-400' },
  COMPLETED: { label: 'Terminée',    cls: 'bg-white/10 text-white/50' },
  REJECTED:  { label: 'Refusée',     cls: 'bg-red-500/15 text-red-400' },
};
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');

export default function MesReservations() {
  const [phone, setPhone]   = useState('');
  const [list, setList]     = useState(null);
  const [loading, setLoad]  = useState(false);

  const search = async () => {
    if (phone.trim().length < 4) return;
    setLoad(true); setList(null);
    try {
      const r = await fetch('/api/my-bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: phone }),
      });
      const d = await r.json();
      setList(d.bookings || []);
    } catch { setList([]); }
    setLoad(false);
  };

  return (
    <>
      <Head>
        <title>Mes réservations — Fik Conciergerie</title>
        <meta name="description" content="Retrouvez vos réservations Fik Conciergerie avec votre numéro de téléphone." />
      </Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">Espace client</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Mes réservations</h1>
            <p className="text-white/40 text-sm">Entrez votre <b className="text-white/70">numéro de réservation</b>, votre <b className="text-white/70">email</b> ou votre <b className="text-white/70">téléphone</b>.</p>
          </div>

          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="N° réservation, email ou téléphone…"
                className="input-dark w-full pl-10 py-3 text-sm" />
            </div>
            <button onClick={search} disabled={loading}
              className="btn-gold px-5 flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>

          {list !== null && (
            list.length === 0 ? (
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-10 text-center">
                <Car size={28} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-1">Aucune réservation trouvée pour ce numéro.</p>
                <p className="text-white/25 text-xs">Vérifiez le numéro, ou <Link href="/reservation" className="text-gold-400">réservez maintenant</Link>.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white/30 text-xs">{list.length} réservation{list.length > 1 ? 's' : ''}</p>
                {list.map(b => {
                  const st = STATUS[b.status] || { label: b.status, cls: 'bg-white/10 text-white/40' };
                  return (
                    <div key={b.id} className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <div className="flex">
                        {b.image && <div className="w-24 shrink-0"><img src={b.image} alt={b.car} className="w-full h-full object-cover" /></div>}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-white font-semibold text-sm">{b.car}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
                          </div>
                          <p className="text-white/30 text-[10px] font-mono mb-1">N° {b.ref}</p>
                          <p className="text-white/40 text-xs mb-1">{b.start} → {b.end}</p>
                          {b.total ? <p className="text-gold-400 text-sm font-bold">{Number(b.total).toLocaleString('fr-FR')} {sym(b.currency)}</p> : null}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Link href={`/suivi/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-3 py-1.5 rounded-lg">
                              Suivi <ArrowRight size={12} />
                            </Link>
                            {b.status === 'COMPLETED' && (
                              <Link href={`/avis/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/15 text-amber-400 px-3 py-1.5 rounded-lg">
                                <Star size={11} />Laisser un avis
                              </Link>
                            )}
                            {['COMPLETED', 'REJECTED'].includes(b.status) && (
                              <Link href="/reservation" className="inline-flex items-center gap-1 text-xs font-semibold bg-gold-500/15 text-gold-400 px-3 py-1.5 rounded-lg">
                                <RefreshCw size={11} />Re-réserver
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
