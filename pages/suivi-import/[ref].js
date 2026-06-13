import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { MessageCircle, Home, X, Car, Globe, Wallet, Calendar, MapPin, FileText, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useSettings, waNumber } from '../../lib/settings';
import { useLang } from '../../lib/i18n';
import { IMPORT_STATUSES, CANCELLED, statusIndex, STATUS_HINT } from '../../lib/importStatus';

const money = (n) => Number(n || 0).toLocaleString('fr-FR');
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');

export default function SuiviImportPage() {
  const router = useRouter();
  const { ref } = router.query;
  const WHATSAPP = waNumber(useSettings());
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!ref) return;
    try {
      const r = await fetch('/api/import-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: String(ref) }),
      });
      const d = await r.json();
      if (d?.ok && d.order) { setOrder(d.order); setNotFound(false); }
      else setNotFound(true);
    } catch { setNotFound(true); }
    setLoading(false);
  }, [ref]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Rafraîchissement léger (pas de realtime : RLS protège les données)
  useEffect(() => {
    const iv = setInterval(fetchOrder, 25000);
    const onFocus = () => fetchOrder();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [fetchOrder]);

  if (loading) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !order) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-black text-white/10 mb-4">404</p>
      <p className="text-white font-semibold mb-2">{L('Commande introuvable', 'الطلب غير موجود', 'Order not found')}</p>
      <p className="text-white/30 text-sm mb-8">{L('Vérifiez votre numéro de commande.', 'تحقّق من رقم طلبك.', 'Check your order number.')}</p>
      <Link href="/commande-vehicule" className="btn-gold px-6 py-3"><Home size={15} />{L('Nouvelle commande', 'طلب جديد', 'New order')}</Link>
    </div>
  );

  const cancelled = order.status === 'CANCELLED';
  const curIdx = statusIndex(order.status);
  const hint = (STATUS_HINT[order.status] || {})[lang] || (STATUS_HINT[order.status] || {}).fr || '';
  const vehTitle = [order.vehicle_brand, order.vehicle_model].filter(Boolean).join(' ') || L('Véhicule à importer', 'سيارة للاستيراد', 'Vehicle to import');
  const wa = L(
    `Bonjour Fik Conciergerie, des nouvelles de ma commande d'importation ${order.ref} ?`,
    `مرحبا Fik Conciergerie، أخبار عن طلب استيرادي ${order.ref}؟`,
    `Hello Fik Conciergerie, any news on my import order ${order.ref}?`,
  );

  const specs = [
    [Car, L('Type', 'النوع', 'Type'), order.vehicle_type],
    [Calendar, L('Année', 'السنة', 'Year'), order.vehicle_year],
    [FileText, L('Carburant', 'الوقود', 'Fuel'), order.vehicle_fuel],
    [FileText, L('Boîte', 'علبة السرعة', 'Gearbox'), order.vehicle_gearbox],
    [FileText, L('Couleur', 'اللون', 'Color'), order.vehicle_color],
    [Globe, L('Origine', 'المنشأ', 'Origin'), order.country_origin],
    [Wallet, L('Budget', 'الميزانية', 'Budget'), order.budget ? `${money(order.budget)} ${sym(order.currency)}` : null],
    [MapPin, L('Ville', 'المدينة', 'City'), order.client_city],
  ].filter(([, , v]) => v);

  return (
    <>
      <Head><title>{L('Suivi importation', 'تتبّع الاستيراد', 'Import tracking')} {order.ref} — Fik Conciergerie</title><meta name="robots" content="noindex" /></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">{L('Suivi importation', 'تتبّع الاستيراد', 'Import tracking')}</span>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{vehTitle}</h1>
            <p className="text-white/30 text-sm font-mono">{order.ref}</p>
          </div>

          {/* Statut actuel */}
          <div className={`border rounded-2xl p-5 mb-6 text-center ${cancelled ? 'bg-red-500/10 border-red-500/20' : 'bg-gold-500/10 border-gold-500/20'}`}>
            <div className={`text-lg font-bold mb-1 ${cancelled ? 'text-red-400' : 'text-gold-400'}`}>
              {(cancelled ? CANCELLED : IMPORT_STATUSES[curIdx] || IMPORT_STATUSES[0])[lang]}
            </div>
            <p className="text-white/40 text-sm">{hint}</p>
          </div>

          {/* Timeline verticale */}
          {!cancelled && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="relative">
                {IMPORT_STATUSES.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < curIdx;
                  const current = i === curIdx;
                  const reached = i <= curIdx;
                  return (
                    <div key={s.key} className="flex gap-3 relative pb-5 last:pb-0">
                      {/* ligne */}
                      {i < IMPORT_STATUSES.length - 1 && (
                        <span className={`absolute top-8 w-px h-[calc(100%-1rem)] ${ar ? 'right-[15px]' : 'left-[15px]'} ${done ? 'bg-gold-500/50' : 'bg-white/10'}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                        reached ? 'bg-gold-500 border-gold-500' : 'bg-transparent border-white/15'
                      } ${current ? 'ring-2 ring-gold-500/30 ring-offset-2 ring-offset-[#141414]' : ''}`}>
                        {done ? <Check size={14} className="text-noir-950" /> : <Icon size={14} className={reached ? 'text-noir-950' : 'text-white/25'} />}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${reached ? 'text-white' : 'text-white/30'}`}>{s[lang]}</p>
                        {current && hint && <p className="text-white/35 text-xs mt-0.5">{hint}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photos du véhicule */}
          {order.photos?.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Car size={15} className="text-gold-400" />
                <p className="text-white/70 text-sm font-semibold">{L('Photos du véhicule', 'صور السيارة', 'Vehicle photos')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {order.photos.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06]">
                    <img src={url} alt={`${vehTitle} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Infos véhicule */}
          {specs.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5 space-y-3">
              <p className="text-white/25 text-xs uppercase tracking-widest font-medium">{L('Détails de la commande', 'تفاصيل الطلب', 'Order details')}</p>
              {specs.map(([Icon, label, value], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/35 flex items-center gap-1.5"><Icon size={12} className="text-gold-500/60" />{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
              {order.vehicle_specs && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-white/35 text-xs mb-1">{L('Options / précisions', 'خيارات / تفاصيل', 'Options / details')}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{order.vehicle_specs}</p>
                </div>
              )}
            </div>
          )}

          {/* Message de l'équipe */}
          {order.notes_client && (
            <div className="bg-gold-500/[0.06] border border-gold-500/15 rounded-2xl p-5 mb-5">
              <p className="text-gold-400/80 text-xs uppercase tracking-widest font-bold mb-2">{L('Message de notre équipe', 'رسالة من فريقنا', 'Message from our team')}</p>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{order.notes_client}</p>
            </div>
          )}

          {/* Lightbox */}
          {lightbox && (
            <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" role="dialog">
              <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-xl" />
              <button className="absolute top-5 right-5 text-white/70 p-2"><X size={24} /></button>
            </div>
          )}

          {/* Contact */}
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(wa)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
            <MessageCircle size={17} />{L('Contacter Fik Conciergerie', 'تواصل مع Fik Conciergerie', 'Contact Fik Conciergerie')}
          </a>
          <p className="text-center text-white/20 text-xs mt-4">
            {L('Cette page se met à jour automatiquement.', 'تتحدّث هذه الصفحة تلقائياً.', 'This page updates automatically.')}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
