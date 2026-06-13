import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Phone, Search, Loader2, Car, ArrowRight, Star, RefreshCw, Ship, FolderKanban } from 'lucide-react';
import { statusLabel } from '../lib/importStatus';
import { dossierStatusLabel } from '../lib/dossierStatus';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';

const STATUS_CLS = {
  PENDING:   'bg-amber-500/15 text-amber-400',
  ACCEPTED:  'bg-emerald-500/15 text-emerald-400',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-400',
  ACTIVE:    'bg-blue-500/15 text-blue-400',
  COMPLETED: 'bg-white/10 text-white/50',
  REJECTED:  'bg-red-500/15 text-red-400',
};
const STATUS_LABEL = {
  fr: { PENDING: 'En attente', ACCEPTED: 'Confirmée', CONFIRMED: 'Confirmée', ACTIVE: 'En cours', COMPLETED: 'Terminée', REJECTED: 'Refusée' },
  ar: { PENDING: 'قيد الانتظار', ACCEPTED: 'مؤكَّدة', CONFIRMED: 'مؤكَّدة', ACTIVE: 'جارية', COMPLETED: 'منتهية', REJECTED: 'مرفوضة' },
  en: { PENDING: 'Pending', ACCEPTED: 'Confirmed', CONFIRMED: 'Confirmed', ACTIVE: 'Ongoing', COMPLETED: 'Completed', REJECTED: 'Declined' },
};
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');

export default function MesReservations() {
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);
  const [phone, setPhone]   = useState('');
  const [list, setList]     = useState(null);
  const [imports, setImports] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoad]  = useState(false);

  const search = async () => {
    if (phone.trim().length < 4) return;
    setLoad(true); setList(null); setImports([]); setDossiers([]);
    try {
      const [rb, ri, rd] = await Promise.all([
        fetch('/api/my-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: phone }) }),
        fetch('/api/import-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: phone }) }),
        fetch('/api/dossier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: phone }) }),
      ]);
      const db = await rb.json();
      setList(db.bookings || []);
      const di = await ri.json().catch(() => ({}));
      setImports(di?.order ? [di.order] : []);
      const dd = await rd.json().catch(() => ({}));
      setDossiers(dd?.dossier ? [dd.dossier] : []);
    } catch { setList([]); }
    setLoad(false);
  };

  return (
    <>
      <Head>
        <title>{L('Mes réservations', 'حجوزاتي', 'My bookings')} — Fik Conciergerie</title>
        <meta name="description" content={L('Retrouvez vos réservations Fik Conciergerie.', 'تتبّع حجوزاتك لدى Fik Conciergerie.', 'Track your Fik Conciergerie bookings.')} />
      </Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">{L('Espace client', 'فضاء العميل', 'Client area')}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">{L('Mes réservations', 'حجوزاتي', 'My bookings')}</h1>
            <p className="text-white/40 text-sm">{L(<>Entrez votre <b className="text-white/70">numéro de réservation</b>, votre <b className="text-white/70">email</b> ou votre <b className="text-white/70">téléphone</b>.</>, <>أدخل <b className="text-white/70">رقم الحجز</b> أو <b className="text-white/70">البريد الإلكتروني</b> أو <b className="text-white/70">الهاتف</b>.</>, <>Enter your <b className="text-white/70">booking number</b>, <b className="text-white/70">email</b> or <b className="text-white/70">phone</b>.</>)}</p>
          </div>

          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search size={15} className={`absolute ${ar ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
              <input value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                placeholder={L('N° réservation, email ou téléphone…', 'رقم الحجز أو البريد أو الهاتف…', 'Booking no., email or phone…')}
                dir={ar ? 'rtl' : 'ltr'}
                className={`input-dark w-full ${ar ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'} py-3 text-sm truncate`} />
            </div>
            <button onClick={search} disabled={loading} aria-label={L('Rechercher', 'بحث', 'Search')}
              className="btn-gold px-5 shrink-0 flex items-center justify-center min-w-[52px]">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>

          {/* Commandes d'importation */}
          {imports.length > 0 && (
            <div className="space-y-3 mb-4">
              {imports.map(o => {
                const veh = [o.vehicle_brand, o.vehicle_model].filter(Boolean).join(' ') || L('Véhicule à importer', 'سيارة للاستيراد', 'Vehicle to import');
                return (
                  <div key={o.ref} className="bg-[#141414] border border-gold-500/15 rounded-2xl overflow-hidden">
                    <div className="flex">
                      {o.photos?.[0]
                        ? <div className="w-24 shrink-0"><img src={o.photos[0]} alt={veh} className="w-full h-full object-cover" /></div>
                        : <div className="w-24 shrink-0 bg-white/[0.03] flex items-center justify-center"><Ship size={22} className="text-gold-500/40" /></div>}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-white font-semibold text-sm">{veh}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-400">{statusLabel(o.status, lang)}</span>
                        </div>
                        <p className="text-white/30 text-[10px] font-mono mb-1">{L('Importation', 'استيراد', 'Import')} · {o.ref}</p>
                        <p className="text-white/40 text-xs mb-3">{L('Suivi de votre importation A→Z', 'تتبّع استيرادك من الألف إلى الياء', 'Track your import A→Z')}</p>
                        <Link href={`/suivi-import/${o.ref}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-3 py-1.5 rounded-lg">
                          {L('Suivi', 'تتبّع', 'Track')} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dossiers achat véhicule / immobilier */}
          {dossiers.length > 0 && (
            <div className="space-y-3 mb-4">
              {dossiers.map(o => (
                <div key={o.ref} className="bg-[#141414] border border-gold-500/15 rounded-2xl overflow-hidden">
                  <div className="flex">
                    {o.photos?.[0]
                      ? <div className="w-24 shrink-0"><img src={o.photos[0]} alt={o.subject || ''} className="w-full h-full object-cover" /></div>
                      : <div className="w-24 shrink-0 bg-white/[0.03] flex items-center justify-center"><FolderKanban size={22} className="text-gold-500/40" /></div>}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white font-semibold text-sm">{o.subject || (o.kind === 'immo' ? L('Dossier immobilier', 'ملف عقاري', 'Real estate file') : L('Dossier achat', 'ملف اقتناء', 'Purchase file'))}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-400">{dossierStatusLabel(o.kind, o.status, lang)}</span>
                      </div>
                      <p className="text-white/30 text-[10px] font-mono mb-1">{o.kind === 'immo' ? L('Immobilier', 'عقار', 'Real estate') : L('Achat véhicule', 'اقتناء سيارة', 'Vehicle purchase')} · {o.ref}</p>
                      <Link href={`/suivi-dossier/${o.ref}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-3 py-1.5 rounded-lg mt-2">
                        {L('Suivi', 'تتبّع', 'Track')} <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {list !== null && (
            list.length === 0 && imports.length === 0 && dossiers.length === 0 ? (
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-10 text-center">
                <Car size={28} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-1">{L('Aucune réservation trouvée.', 'لم يُعثر على أي حجز.', 'No booking found.')}</p>
                <p className="text-white/25 text-xs">{L('Vérifiez vos infos, ou ', 'تحقّق من معلوماتك، أو ', 'Check your info, or ')}<Link href="/reservation" className="text-gold-400">{L('réservez maintenant', 'احجز الآن', 'book now')}</Link>.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.length > 0 && <p className="text-white/30 text-xs">{list.length} {L(list.length > 1 ? 'réservations' : 'réservation', 'حجز', list.length > 1 ? 'bookings' : 'booking')}</p>}
                {list.map(b => {
                  const stCls = STATUS_CLS[b.status] || 'bg-white/10 text-white/40';
                  const stLabel = (STATUS_LABEL[lang] || STATUS_LABEL.fr)[b.status] || b.status;
                  return (
                    <div key={b.id} className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <div className="flex">
                        {b.image && <div className="w-24 shrink-0"><img src={b.image} alt={b.car} className="w-full h-full object-cover" /></div>}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-white font-semibold text-sm">{b.car}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${stCls}`}>{stLabel}</span>
                          </div>
                          <p className="text-white/30 text-[10px] font-mono mb-1">{L('N°', 'رقم', 'No.')} {b.ref}</p>
                          <p className="text-white/40 text-xs mb-1">{b.start} → {b.end}</p>
                          {b.total ? <p className="text-gold-400 text-sm font-bold">{Number(b.total).toLocaleString('fr-FR')} {sym(b.currency)}</p> : null}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Link href={`/suivi/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-3 py-1.5 rounded-lg">
                              {L('Suivi', 'تتبّع', 'Track')} <ArrowRight size={12} />
                            </Link>
                            {b.status === 'COMPLETED' && (
                              <Link href={`/avis/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-500/15 text-amber-400 px-3 py-1.5 rounded-lg">
                                <Star size={11} />{L('Laisser un avis', 'اترك تقييماً', 'Leave a review')}
                              </Link>
                            )}
                            {['COMPLETED', 'REJECTED'].includes(b.status) && (
                              <Link href="/reservation" className="inline-flex items-center gap-1 text-xs font-semibold bg-gold-500/15 text-gold-400 px-3 py-1.5 rounded-lg">
                                <RefreshCw size={11} />{L('Re-réserver', 'احجز مجدداً', 'Re-book')}
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
