import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Car, Calendar, Check, Clock, X, MessageCircle, Home, Phone, FileSignature, Camera, Wallet, ShieldCheck, AlertTriangle, Download, PenLine } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';
import { useSettings, waNumber } from '../../lib/settings';
import { useLang } from '../../lib/i18n';

const sevColor = { grave: '#ef4444', moyen: '#f59e0b', leger: '#eab308', aucun: '#22c55e' };
const curSym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');
const money = (n) => Number(n || 0).toLocaleString('fr-FR');

const STEPS = [
  { key: 'PENDING',   labels: { fr: 'Demande reçue', ar: 'تم استلام الطلب', en: 'Request received' }, icon: Clock },
  { key: 'ACCEPTED',  labels: { fr: 'Confirmée', ar: 'مؤكَّدة', en: 'Confirmed' }, icon: Check },
  { key: 'ACTIVE',    labels: { fr: 'En cours', ar: 'جارية', en: 'Ongoing' }, icon: Car },
  { key: 'COMPLETED', labels: { fr: 'Terminée', ar: 'منتهية', en: 'Completed' }, icon: Check },
];

const STATUS_INFO = {
  PENDING:   { labels: { fr: 'En attente de confirmation', ar: 'في انتظار التأكيد', en: 'Awaiting confirmation' }, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', step: 0 },
  ACCEPTED:  { labels: { fr: 'Réservation confirmée', ar: 'تم تأكيد الحجز', en: 'Booking confirmed' }, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', step: 1 },
  CONFIRMED: { labels: { fr: 'Réservation confirmée', ar: 'تم تأكيد الحجز', en: 'Booking confirmed' }, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', step: 1 },
  ACTIVE:    { labels: { fr: 'Location en cours', ar: 'الإيجار جارٍ', en: 'Rental in progress' }, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', step: 2 },
  COMPLETED: { labels: { fr: 'Location terminée', ar: 'انتهى الإيجار', en: 'Rental completed' }, color: 'text-white/50', bg: 'bg-white/5 border-white/10', step: 3 },
  REJECTED:  { labels: { fr: 'Réservation refusée', ar: 'تم رفض الحجز', en: 'Booking declined' }, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', step: -1 },
};

export default function SuiviPage() {
  const router   = useRouter();
  const WHATSAPP = waNumber(useSettings());
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);
  const { id }   = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [docs, setDocs] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // Documents client (paiement, état des lieux, contrat) — via API service-role
  useEffect(() => {
    if (!id) return;
    fetch(`/api/booking-documents?id=${id}`)
      .then(r => r.json())
      .then(d => { if (d?.ok) setDocs(d); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id || !supabase) return;
    supabase.from('bookings')
      .select('*, cars(name, image_url, category, seats, fuel)')
      .eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); }
        else setBooking(data);
        setLoading(false);
      });

    // Live update
    const sub = supabase.channel(`suivi-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${id}` },
        (payload) => setBooking(prev => ({ ...prev, ...payload.new }))
      ).subscribe();
    return () => supabase.removeChannel(sub);
  }, [id]);

  if (loading) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-black text-white/10 mb-4">404</p>
      <p className="text-white font-semibold mb-2">{L('Réservation introuvable', 'الحجز غير موجود', 'Booking not found')}</p>
      <p className="text-white/30 text-sm mb-8">{L('Vérifiez le lien reçu par WhatsApp.', 'تحقّق من الرابط المُستلَم عبر واتساب.', 'Check the link received via WhatsApp.')}</p>
      <Link href="/" className="btn-gold px-6 py-3"><Home size={15} />{L('Accueil', 'الرئيسية', 'Home')}</Link>
    </div>
  );

  const status = STATUS_INFO[booking.status] || STATUS_INFO.PENDING;
  const currentStep = status.step;
  const isRejected = booking.status === 'REJECTED';

  const days = (() => {
    if (!booking.start_date || !booking.end_date) return 0;
    return Math.round((new Date(booking.end_date) - new Date(booking.start_date)) / 86400000);
  })();

  const whatsappMsg = `Bonjour Fik Conciergerie, je souhaite avoir des informations sur ma réservation #${booking.id?.substring(0,8).toUpperCase()}.`;
  const statusLabel = (status.labels && status.labels[lang]) || status.labels?.fr || '';

  return (
    <>
      <Head><title>{L('Suivi réservation', 'تتبّع الحجز', 'Booking tracking')} — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">{L('Suivi en temps réel', 'تتبّع لحظي', 'Real-time tracking')}</span>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{L('Votre réservation', 'حجزك', 'Your booking')}</h1>
            <p className="text-white/30 text-sm font-mono">#{booking.id?.substring(0,8).toUpperCase()}</p>
          </div>

          {/* Status card */}
          <div className={`border rounded-2xl p-5 mb-6 text-center ${status.bg}`}>
            <div className={`text-lg font-bold mb-1 ${status.color}`}>{statusLabel}</div>
            {booking.status === 'PENDING' && (
              <p className="text-white/40 text-sm">{L('Notre équipe vous contactera sous 24h pour confirmer.', 'سيتواصل معك فريقنا خلال 24 ساعة للتأكيد.', 'Our team will contact you within 24h to confirm.')}</p>
            )}
            {(booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && (
              <p className="text-white/40 text-sm">{L('Votre réservation est validée. Bonne location !', 'تم تأكيد حجزك. رحلة سعيدة!', 'Your booking is confirmed. Enjoy!')}</p>
            )}
            {booking.status === 'REJECTED' && (
              <p className="text-white/40 text-sm">{L("Nous ne sommes pas disponibles à ces dates. Contactez-nous pour d'autres dates.", 'لسنا متاحين في هذه التواريخ. تواصل معنا لتواريخ أخرى.', 'We are not available on these dates. Contact us for other dates.')}</p>
            )}
          </div>

          {/* Progress steps */}
          {!isRejected && (
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done    = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-gold-500 border-gold-500' : 'bg-transparent border-white/15'
                    } ${current ? 'ring-2 ring-gold-500/30 ring-offset-2 ring-offset-[#0e0e0e]' : ''}`}>
                      <Icon size={14} className={done ? 'text-noir-950' : 'text-white/20'} />
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${done ? 'text-gold-400' : 'text-white/20'}`}>
                      {(step.labels && step.labels[lang]) || step.labels?.fr}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`absolute hidden`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Car */}
          {booking.cars && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
              {booking.cars.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img src={booking.cars.image_url} alt={booking.cars.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-white font-bold text-lg">{booking.cars.name}</h2>
                <p className="text-white/35 text-sm capitalize">{booking.cars.category} · {booking.cars.seats} {L('places', 'مقاعد', 'seats')} · {booking.cars.fuel}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5 space-y-3">
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">{L('Détails', 'التفاصيل', 'Details')}</p>
            {[
              [L('Client', 'العميل', 'Client'),  booking.client_name],
              [L('Départ', 'الانطلاق', 'Pick-up'),  booking.start_date],
              [L('Retour', 'الإرجاع', 'Return'),  booking.end_date],
              [L('Durée', 'المدة', 'Duration'),   `${days} ${L(days > 1 ? 'jours' : 'jour', 'يوم', days > 1 ? 'days' : 'day')}`],
              [L('Total', 'المجموع', 'Total'),   booking.final_price ? `${booking.final_price}€` : L('À confirmer', 'للتأكيد', 'To confirm')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/35">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* ── Paiement ───────────────────────────────────────── */}
          {docs?.payment && (docs.payment.finalPrice > 0 || docs.payment.totalPaid > 0) && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={15} className="text-gold-400" />
                <p className="text-white/70 text-sm font-semibold">{L('Paiement', 'الدفع', 'Payment')}</p>
              </div>
              <div className="space-y-2.5 text-sm">
                {docs.payment.finalPrice > 0 && (
                  <div className="flex justify-between"><span className="text-white/35">{L('Total location', 'إجمالي الإيجار', 'Rental total')}</span>
                    <span className="text-white font-medium">{money(docs.payment.finalPrice)} {curSym(docs.currency)}</span></div>
                )}
                {docs.payment.depositPaid > 0 && (
                  <div className="flex justify-between"><span className="text-white/35">{L('Acompte versé', 'العربون المدفوع', 'Deposit paid')}</span>
                    <span className="text-emerald-400 font-medium">{money(docs.payment.depositPaid)} {curSym(docs.currency)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-white/35">{L('Déjà payé', 'المدفوع', 'Already paid')}</span>
                  <span className="text-emerald-400 font-medium">{money(docs.payment.totalPaid)} {curSym(docs.currency)}</span></div>
                {docs.payment.remaining !== null && (
                  <div className="flex justify-between pt-2.5 border-t border-white/[0.06]">
                    <span className="text-white/50 font-semibold">{L('Reste à payer', 'المتبقّي', 'Remaining')}</span>
                    <span className={`font-bold ${docs.payment.remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {docs.payment.remaining > 0 ? `${money(docs.payment.remaining)} ${curSym(docs.currency)}` : L('Soldé ✓', 'مُسدَّد ✓', 'Settled ✓')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Contrat / signature électronique ───────────────── */}
          {docs?.contract && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <FileSignature size={15} className="text-gold-400" />
                <p className="text-white/70 text-sm font-semibold">{L('Contrat de location', 'عقد الإيجار', 'Rental contract')}</p>
              </div>
              {docs.contract.signed ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-400 text-sm font-semibold">{L('Contrat signé', 'تم توقيع العقد', 'Contract signed')}</p>
                    {docs.contract.signedAt && (
                      <p className="text-white/30 text-xs">{L('le', 'بتاريخ', 'on')} {new Date(docs.contract.signedAt).toLocaleDateString(ar ? 'ar' : en ? 'en-GB' : 'fr-FR')}</p>
                    )}
                  </div>
                  {docs.contract.signatureUrl && (
                    <a href={docs.contract.signatureUrl} target="_blank" rel="noopener noreferrer"
                      className="text-white/40 hover:text-gold-400 p-2"><Download size={16} /></a>
                  )}
                </div>
              ) : docs.contract.signLink ? (
                <a href={docs.contract.signLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-400 text-noir-950 font-semibold py-3 rounded-xl transition-colors">
                  <PenLine size={16} />{L('Signer mon contrat', 'توقيع عقدي', 'Sign my contract')}
                </a>
              ) : (
                <p className="text-white/30 text-sm">{L('En attente de préparation par notre équipe.', 'في انتظار التحضير من قِبل فريقنا.', 'Awaiting preparation by our team.')}</p>
              )}
            </div>
          )}

          {/* ── État des lieux avant / après (photos + dégâts) ──── */}
          {docs?.inspections?.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={15} className="text-gold-400" />
                <p className="text-white/70 text-sm font-semibold">{L('État des lieux', 'محضر الحالة', 'Condition report')}</p>
              </div>
              <div className="space-y-5">
                {docs.inspections.map((insp, ix) => (
                  <div key={ix}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                        {insp.type === 'after' ? L('Au retour', 'عند الإرجاع', 'On return') : L('Au départ', 'عند الانطلاق', 'At pick-up')}
                      </span>
                      {insp.accident && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                          <AlertTriangle size={10} /> {L('Accident signalé', 'حادث مُبلَّغ عنه', 'Accident reported')}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {insp.photos.map((url, pi) => (
                        <button key={pi} onClick={() => setLightbox(url)}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06] group">
                          <img src={url} alt={`État ${insp.type}`} className="w-full h-full object-cover" />
                          {/* Marqueurs dégâts (boîtes normalisées 0..1) */}
                          {insp.boxes.filter(b => (b.photo_index ?? 0) === pi).map((b, bi) => b.box && (
                            <span key={bi} className="absolute border-2 rounded"
                              style={{
                                left: `${b.box.x * 100}%`, top: `${b.box.y * 100}%`,
                                width: `${b.box.w * 100}%`, height: `${b.box.h * 100}%`,
                                borderColor: sevColor[b.severity] || '#f59e0b',
                              }} />
                          ))}
                        </button>
                      ))}
                    </div>
                    {insp.damages.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {insp.damages.slice(0, 5).map((d, di) => (
                          <li key={di} className="text-white/40 text-xs flex gap-1.5"><span className="text-amber-400">•</span>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[11px] mt-4 text-center">{L('Photos prises et analysées par Fik Conciergerie — transparence garantie.', 'صور مُلتقَطة ومُحلَّلة من Fik Conciergerie — شفافية مضمونة.', 'Photos taken and analysed by Fik Conciergerie — guaranteed transparency.')}</p>
            </div>
          )}

          {/* Lightbox plein écran */}
          {lightbox && (
            <div onClick={() => setLightbox(null)}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" role="dialog">
              <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-xl" />
              <button className="absolute top-5 right-5 text-white/70 p-2"><X size={24} /></button>
            </div>
          )}

          {/* Contact */}
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
            <MessageCircle size={17} />{L('Contacter Fik Conciergerie', 'تواصل مع Fik Conciergerie', 'Contact Fik Conciergerie')}
          </a>

          <p className="text-center text-white/20 text-xs mt-4">
            {L('Cette page se met à jour automatiquement en temps réel.', 'تتحدّث هذه الصفحة تلقائياً ولحظياً.', 'This page updates automatically in real time.')}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
