import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { MessageCircle, Home, X, Car, Building2, Wallet, MapPin, FileText, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useSettings, waNumber } from '../../lib/settings';
import { useLang } from '../../lib/i18n';
import { flowFor, CANCELLED, statusIndex, DOSSIER_HINT, KIND_LABEL } from '../../lib/dossierStatus';

const money = (n) => Number(n || 0).toLocaleString('fr-FR');
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');

export default function SuiviDossierPage() {
  const router = useRouter();
  const { ref } = router.query;
  const WHATSAPP = waNumber(useSettings());
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);

  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const fetchD = useCallback(async () => {
    if (!ref) return;
    try {
      const r = await fetch('/api/dossier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: String(ref) }) });
      const j = await r.json();
      if (j?.ok && j.dossier) { setD(j.dossier); setNotFound(false); } else setNotFound(true);
    } catch { setNotFound(true); }
    setLoading(false);
  }, [ref]);

  useEffect(() => { fetchD(); }, [fetchD]);
  useEffect(() => {
    const iv = setInterval(fetchD, 25000);
    const onFocus = () => fetchD();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [fetchD]);

  if (loading) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !d) return (
    <div className="grain min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-black text-white/10 mb-4">404</p>
      <p className="text-white font-semibold mb-2">{L('Dossier introuvable', 'الملف غير موجود', 'File not found')}</p>
      <p className="text-white/30 text-sm mb-8">{L('Vérifiez votre numéro de dossier.', 'تحقّق من رقم ملفك.', 'Check your file number.')}</p>
      <Link href="/" className="btn-gold px-6 py-3"><Home size={15} />{L('Accueil', 'الرئيسية', 'Home')}</Link>
    </div>
  );

  const cancelled = d.status === 'CANCELLED';
  const flow = flowFor(d.kind);
  const curIdx = statusIndex(d.kind, d.status);
  const hint = (DOSSIER_HINT[d.status] || {})[lang] || (DOSSIER_HINT[d.status] || {}).fr || '';
  const KindIcon = d.kind === 'immo' ? Building2 : Car;
  const title = d.subject || (KIND_LABEL[d.kind] || KIND_LABEL.voiture)[lang];
  const wa = L(
    `Bonjour Fik Conciergerie, des nouvelles de mon dossier ${d.ref} ?`,
    `مرحبا Fik Conciergerie، أخبار عن ملفي ${d.ref}؟`,
    `Hello Fik Conciergerie, any news on my file ${d.ref}?`,
  );

  const specs = [
    [FileText, L('Type', 'النوع', 'Type'), (KIND_LABEL[d.kind] || KIND_LABEL.voiture)[lang]],
    [Wallet, L('Budget', 'الميزانية', 'Budget'), d.budget ? `${money(d.budget)} ${sym(d.currency)}` : null],
    [MapPin, L('Ville', 'المدينة', 'City'), d.client_city],
  ].filter(([, , v]) => v);

  return (
    <>
      <Head><title>{L('Suivi de dossier', 'تتبّع الملف', 'File tracking')} {d.ref} — Fik Conciergerie</title><meta name="robots" content="noindex" /></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-lg mx-auto">

          <div className="text-center mb-8">
            <span className="section-badge mb-4 inline-block">{L('Suivi de dossier', 'تتبّع الملف', 'File tracking')}</span>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{title}</h1>
            <p className="text-white/30 text-sm font-mono">{d.ref}</p>
          </div>

          <div className={`border rounded-2xl p-5 mb-6 text-center ${cancelled ? 'bg-red-500/10 border-red-500/20' : 'bg-gold-500/10 border-gold-500/20'}`}>
            <div className={`text-lg font-bold mb-1 ${cancelled ? 'text-red-400' : 'text-gold-400'}`}>
              {(cancelled ? CANCELLED : flow[curIdx] || flow[0])[lang]}
            </div>
            <p className="text-white/40 text-sm">{hint}</p>
          </div>

          {!cancelled && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="relative">
                {flow.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < curIdx, current = i === curIdx, reached = i <= curIdx;
                  return (
                    <div key={s.key} className="flex gap-3 relative pb-5 last:pb-0">
                      {i < flow.length - 1 && <span className={`absolute top-8 w-px h-[calc(100%-1rem)] ${ar ? 'right-[15px]' : 'left-[15px]'} ${done ? 'bg-gold-500/50' : 'bg-white/10'}`} />}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${reached ? 'bg-gold-500 border-gold-500' : 'bg-transparent border-white/15'} ${current ? 'ring-2 ring-gold-500/30 ring-offset-2 ring-offset-[#141414]' : ''}`}>
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

          {d.photos?.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4"><KindIcon size={15} className="text-gold-400" /><p className="text-white/70 text-sm font-semibold">{L('Photos', 'الصور', 'Photos')}</p></div>
              <div className="grid grid-cols-2 gap-2">
                {d.photos.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06]">
                    <img src={url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {specs.length > 0 && (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-5 space-y-3">
              <p className="text-white/25 text-xs uppercase tracking-widest font-medium">{L('Détails du dossier', 'تفاصيل الملف', 'File details')}</p>
              {specs.map(([Icon, label, value], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/35 flex items-center gap-1.5"><Icon size={12} className="text-gold-500/60" />{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
              {d.details && <div className="pt-2 border-t border-white/[0.06]"><p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{d.details}</p></div>}
            </div>
          )}

          {d.notes_client && (
            <div className="bg-gold-500/[0.06] border border-gold-500/15 rounded-2xl p-5 mb-5">
              <p className="text-gold-400/80 text-xs uppercase tracking-widest font-bold mb-2">{L('Message de notre équipe', 'رسالة من فريقنا', 'Message from our team')}</p>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{d.notes_client}</p>
            </div>
          )}

          {lightbox && (
            <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" role="dialog">
              <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-xl" />
              <button className="absolute top-5 right-5 text-white/70 p-2"><X size={24} /></button>
            </div>
          )}

          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(wa)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
            <MessageCircle size={17} />{L('Contacter Fik Conciergerie', 'تواصل مع Fik Conciergerie', 'Contact Fik Conciergerie')}
          </a>
          <p className="text-center text-white/20 text-xs mt-4">{L('Cette page se met à jour automatiquement.', 'تتحدّث هذه الصفحة تلقائياً.', 'This page updates automatically.')}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
