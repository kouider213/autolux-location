import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import {
  Globe, Search, FileCheck, Wallet, Truck, ShieldCheck, AlertTriangle,
  Send, Car, MapPin, Gauge, Fuel, Settings, Calendar, Palette, MessageCircle, CheckCircle2, Copy, Loader2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';

const ACOMPTE_PCT = 50; // % acompte affiché

const STEP_ICONS = [FileCheck, Search, Wallet, ShieldCheck, Globe, Truck, CheckCircle2];
const COND_KEYS = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11'];

const emptyForm = {
  nom: '', prenom: '', whatsapp: '', ville: '',
  type: '', marque: '', modele: '', annee_min: '', km_max: '',
  carburant: '', boite: '', budget: '', devise: 'EUR',
  origine: '', delai: '', couleur: '', options: '',
  etat: 'occasion', liens: '', message: '', referral: '',
};

export default function CommandeVehiculePage() {
  const { t, lang } = useLang();
  const WHATSAPP = waNumber(useSettings());
  const [form, setForm]       = useState(emptyForm);
  const [accept, setAccept]   = useState(false);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]   = useState(null); // { ref }

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const cur = form.devise === 'DZD' ? 'DA' : '€';
  const ar = lang === 'ar';

  const buildMessage = () => {
    const L = [];
    if (ar) {
      L.push('🚗 *طلب اقتناء / استيراد سيارة*');
      L.push('— فيك كونسيرجري —');
      L.push('');
      L.push('*👤 الزبون*');
      L.push(`الاسم : ${form.nom} ${form.prenom}`);
      L.push(`واتساب : ${form.whatsapp}`);
      if (form.ville) L.push(`المدينة/البلد : ${form.ville}`);
      L.push('');
      L.push('*🚘 السيارة المطلوبة*');
      if (form.type)    L.push(`النوع : ${form.type}`);
      if (form.marque)  L.push(`الماركة : ${form.marque}`);
      if (form.modele)  L.push(`الموديل : ${form.modele}`);
      if (form.annee_min) L.push(`أقدم سنة : ${form.annee_min}`);
      if (form.km_max)  L.push(`أقصى كيلومتراج : ${form.km_max}`);
      if (form.carburant) L.push(`الوقود : ${form.carburant}`);
      if (form.boite)   L.push(`علبة السرعة : ${form.boite}`);
      if (form.couleur) L.push(`اللون : ${form.couleur}`);
      L.push(`الحالة : ${form.etat}`);
      if (form.options) L.push(`خيارات : ${form.options}`);
      L.push('');
      L.push('*💰 الميزانية والشروط*');
      if (form.budget)  L.push(`أقصى ميزانية : ${form.budget} ${cur}`);
      if (form.origine) L.push(`بلد المنشأ المرغوب : ${form.origine}`);
      if (form.delai)   L.push(`الأجل المرغوب : ${form.delai}`);
      if (form.liens)   { L.push(''); L.push(`*🔗 أمثلة :* ${form.liens}`); }
      if (form.message) { L.push(''); L.push(`*📝 رسالة :* ${form.message}`); }
      L.push('');
      L.push('_قرأتُ وأوافق على أن يُدرَس طلبي وألّا يُؤكَّد الطلب إلا بعد التأكيد الكتابي._');
      return L.join('\n');
    }
    if (lang === 'en') {
      L.push('🚗 *VEHICLE ORDER / IMPORT REQUEST*');
      L.push('— Fik Conciergerie —');
      L.push('');
      L.push('*👤 CLIENT*');
      L.push(`Name: ${form.nom} ${form.prenom}`);
      L.push(`WhatsApp: ${form.whatsapp}`);
      if (form.ville) L.push(`City/Country: ${form.ville}`);
      L.push('');
      L.push('*🚘 VEHICLE WANTED*');
      if (form.type)    L.push(`Type: ${form.type}`);
      if (form.marque)  L.push(`Brand: ${form.marque}`);
      if (form.modele)  L.push(`Model: ${form.modele}`);
      if (form.annee_min) L.push(`Min year: ${form.annee_min}`);
      if (form.km_max)  L.push(`Max mileage: ${form.km_max}`);
      if (form.carburant) L.push(`Fuel: ${form.carburant}`);
      if (form.boite)   L.push(`Gearbox: ${form.boite}`);
      if (form.couleur) L.push(`Colour: ${form.couleur}`);
      L.push(`Condition: ${form.etat}`);
      if (form.options) L.push(`Options: ${form.options}`);
      L.push('');
      L.push('*💰 BUDGET & TERMS*');
      if (form.budget)  L.push(`Max budget: ${form.budget} ${cur}`);
      if (form.origine) L.push(`Preferred origin country: ${form.origine}`);
      if (form.delai)   L.push(`Preferred timeframe: ${form.delai}`);
      if (form.liens)   { L.push(''); L.push(`*🔗 Examples:* ${form.liens}`); }
      if (form.message) { L.push(''); L.push(`*📝 Message:* ${form.message}`); }
      L.push('');
      L.push('_I have read and accept that my request will be reviewed and the order confirmed only after written confirmation._');
      return L.join('\n');
    }
    L.push('🚗 *DEMANDE DE COMMANDE / IMPORTATION VÉHICULE*');
    L.push('— Fik Conciergerie —');
    L.push('');
    L.push('*👤 CLIENT*');
    L.push(`Nom : ${form.nom} ${form.prenom}`);
    L.push(`WhatsApp : ${form.whatsapp}`);
    if (form.ville) L.push(`Ville/Pays : ${form.ville}`);
    L.push('');
    L.push('*🚘 VÉHICULE RECHERCHÉ*');
    if (form.type)    L.push(`Type : ${form.type}`);
    if (form.marque)  L.push(`Marque : ${form.marque}`);
    if (form.modele)  L.push(`Modèle : ${form.modele}`);
    if (form.annee_min) L.push(`Année min : ${form.annee_min}`);
    if (form.km_max)  L.push(`Km max : ${form.km_max}`);
    if (form.carburant) L.push(`Carburant : ${form.carburant}`);
    if (form.boite)   L.push(`Boîte : ${form.boite}`);
    if (form.couleur) L.push(`Couleur : ${form.couleur}`);
    L.push(`État : ${form.etat}`);
    if (form.options) L.push(`Options : ${form.options}`);
    L.push('');
    L.push('*💰 BUDGET & CONDITIONS*');
    if (form.budget)  L.push(`Budget max : ${form.budget} ${cur}`);
    if (form.origine) L.push(`Pays d'origine souhaité : ${form.origine}`);
    if (form.delai)   L.push(`Délai souhaité : ${form.delai}`);
    if (form.liens)   { L.push(''); L.push(`*🔗 Exemples :* ${form.liens}`); }
    if (form.message) { L.push(''); L.push(`*📝 Message :* ${form.message}`); }
    L.push('');
    L.push('_J\'ai lu et j\'accepte que ma demande soit étudiée et que la commande ne soit validée qu\'après confirmation écrite._');
    return L.join('\n');
  };

  const handleSubmit = async () => {
    const E = ar
      ? { name: 'الاسم واللقب إجباريان.', wa: 'رقم واتساب إجباري.', veh: 'حدّد على الأقل نوع أو ماركة السيارة.', acc: 'يجب الموافقة على الشروط لإرسال الطلب.' }
      : { name: 'Nom et prénom obligatoires.', wa: 'Numéro WhatsApp obligatoire.', veh: 'Indiquez au moins le type ou la marque du véhicule.', acc: 'Vous devez accepter les conditions pour envoyer la demande.' };
    if (!form.nom.trim() || !form.prenom.trim()) { setError(E.name); return; }
    if (!form.whatsapp.trim()) { setError(E.wa); return; }
    if (!form.marque.trim() && !form.type.trim()) { setError(E.veh); return; }
    if (!accept) { setError(E.acc); return; }
    setError('');
    setSubmitting(true);

    // Enregistre la commande en base (suivi A→Z) — best effort, ne bloque jamais WhatsApp
    let ref = null;
    try {
      const r = await fetch('/api/create-import-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: `${form.nom} ${form.prenom}`.trim(), client_phone: form.whatsapp, client_city: form.ville, lang,
          vehicle_brand: form.marque, vehicle_model: form.modele, vehicle_year: form.annee_min, vehicle_type: form.type,
          vehicle_fuel: form.carburant, vehicle_gearbox: form.boite, vehicle_color: form.couleur,
          vehicle_specs: [form.options, form.km_max ? `Km max: ${form.km_max}` : '', form.etat ? `État: ${form.etat}` : '', form.liens, form.message].filter(Boolean).join(' · '),
          budget: form.budget || null, currency: form.devise, country_origin: form.origine, deadline: form.delai,
          referral_code: form.referral || null,
        }),
      });
      const d = await r.json();
      if (d?.ok) ref = d.ref;
    } catch { /* silencieux : WhatsApp reste le canal principal */ }

    setSubmitting(false);
    const wmsg = buildMessage() + (ref ? `\n\n${ar ? 'رقم طلبي' : lang === 'en' ? 'My order no.' : 'N° de ma commande'} : ${ref}` : '');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(wmsg)}`, '_blank');
    if (ref) { setResult({ ref }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const copyRef = () => { if (result?.ref) { navigator.clipboard.writeText(result.ref); } };

  const Field = ({ label, icon: Icon, children }) => (
    <div>
      <label className="flex items-center gap-1.5 text-white/40 text-xs font-semibold mb-1.5">
        {Icon && <Icon size={12} className="text-gold-500/70" />}{label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors";

  return (
    <>
      <Head>
        <title>Commande &amp; Importation de véhicule — Fik Conciergerie</title>
        <meta name="description" content="Commandez le véhicule de vos rêves. Fik Conciergerie le recherche, l'achète et l'achemine jusqu'en Algérie. Demande sur mesure via WhatsApp." />
      </Head>

      <div className="grain min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Hero */}
        <div className="relative pt-32 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
          <div className="absolute top-20 left-1/3 w-72 h-72 bg-gold-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"><Globe size={11} /> {t('order.badge')}</div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
              {t('order.title1')}<br /><span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent italic">{t('order.title2')}</span>
            </h1>
            <p className="text-white/40 max-w-xl mx-auto text-base leading-relaxed">
              Vous cherchez une voiture précise, en Algérie ou à l'étranger ? On la trouve, on l'achète et on l'achemine jusqu'à vous. Remplissez votre demande, on s'occupe du reste.
            </p>
          </div>
        </div>

        <div className="px-5 pb-28 max-w-5xl mx-auto space-y-16">

          {/* Confirmation : commande enregistrée + numéro de suivi */}
          {result?.ref && (
            <section className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-b from-emerald-500/[0.08] to-[#111] border border-emerald-500/25 rounded-3xl p-7 text-center">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={26} className="text-emerald-400" /></div>
                <h2 className="text-white font-bold text-xl mb-2">{ar ? 'تم تسجيل طلبك ✅' : 'Votre demande est enregistrée ✅'}</h2>
                <p className="text-white/45 text-sm mb-5">{ar ? 'احتفظ برقم طلبك لتتبّع استيراد سيارتك في أي وقت.' : 'Conservez votre numéro de commande pour suivre votre importation à tout moment.'}</p>
                <div className="inline-flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-5 py-3 mb-5">
                  <span className="font-mono font-bold text-gold-400 text-lg tracking-wider">{result.ref}</span>
                  <button onClick={copyRef} className="text-white/40 hover:text-gold-400" aria-label="Copier"><Copy size={16} /></button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <Link href={`/suivi-import/${result.ref}`} className="btn-gold px-6 py-3 justify-center"><Search size={15} />{ar ? 'تتبّع طلبي' : 'Suivre ma commande'}</Link>
                  <button onClick={() => setResult(null)} className="border border-white/12 text-white/60 hover:text-white rounded-xl px-6 py-3 text-sm font-semibold">{ar ? 'طلب آخر' : 'Nouvelle demande'}</button>
                </div>
              </div>
            </section>
          )}

          {/* Comment ça fonctionne */}
          <section>
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">{t('os.badge')}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{t('order.how')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEP_ICONS.map((Icon, i) => (
                <div key={i} className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
                  <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-[11px] font-black text-noir-950 shadow-[0_0_12px_rgba(226,182,20,0.4)]">{i + 1}</div>
                  <div className="w-11 h-11 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mb-4"><Icon size={19} className="text-gold-400" /></div>
                  <h3 className="text-white font-bold text-sm mb-1.5 leading-tight">{t(`s${i + 1}t`)}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{t(`s${i + 1}d`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Formulaire */}
          <section>
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">{t('os.dq_badge')}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{t('os.dq_t1')} <span className="text-gold-gradient italic">{t('os.dq_t2')}</span></h2>
              <p className="text-white/35 mt-3 text-sm">{t('os.dq_sub')}</p>
            </div>

            <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 sm:p-8 space-y-7">

              {/* Identité */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">{t('os.coords')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t('f.nom')}><input value={form.nom} onChange={set('nom')} placeholder="Benali" className={inputCls} /></Field>
                  <Field label={t('f.prenom')}><input value={form.prenom} onChange={set('prenom')} placeholder="Karim" className={inputCls} /></Field>
                  <Field label={t('f.wa')} icon={MessageCircle}><input value={form.whatsapp} onChange={set('whatsapp')} placeholder="+213 ..." className={inputCls} inputMode="tel" /></Field>
                  <Field label={t('f.ville')} icon={MapPin}><input value={form.ville} onChange={set('ville')} placeholder="Oran, Algérie" className={inputCls} /></Field>
                </div>
              </div>

              {/* Véhicule */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">{t('os.vehicle')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t('f.type')} icon={Car}><input value={form.type} onChange={set('type')} placeholder={lang === 'ar' ? 'SUV، سيدان، مدينية...' : lang === 'en' ? 'SUV, sedan, city car...' : 'SUV, berline, citadine...'} className={inputCls} /></Field>
                  <Field label={t('f.marque')}><input value={form.marque} onChange={set('marque')} placeholder="Volkswagen" className={inputCls} /></Field>
                  <Field label={t('f.modele')}><input value={form.modele} onChange={set('modele')} placeholder="Golf 8" className={inputCls} /></Field>
                  <Field label={t('f.etat')}><select value={form.etat} onChange={set('etat')} className={inputCls}><option value="occasion">{t('f.etat_occ')}</option><option value="neuf">{t('f.etat_neuf')}</option><option value="indifferent">{t('f.etat_ind')}</option></select></Field>
                  <Field label={t('f.annee')} icon={Calendar}><input type="number" value={form.annee_min} onChange={set('annee_min')} placeholder="2018" className={inputCls} /></Field>
                  <Field label={t('f.km')} icon={Gauge}><input type="number" value={form.km_max} onChange={set('km_max')} placeholder="80000" className={inputCls} /></Field>
                  <Field label={t('f.carburant')} icon={Fuel}><select value={form.carburant} onChange={set('carburant')} className={inputCls}><option value="">{t('f.indifferent')}</option><option value="essence">{lang === 'ar' ? 'بنزين' : lang === 'en' ? 'Petrol' : 'Essence'}</option><option value="diesel">{lang === 'ar' ? 'ديزل' : 'Diesel'}</option><option value="hybride">{lang === 'ar' ? 'هجين' : lang === 'en' ? 'Hybrid' : 'Hybride'}</option><option value="électrique">{lang === 'ar' ? 'كهربائي' : lang === 'en' ? 'Electric' : 'Électrique'}</option></select></Field>
                  <Field label={t('f.boite')} icon={Settings}><select value={form.boite} onChange={set('boite')} className={inputCls}><option value="">{t('f.indifferent')}</option><option value="automatique">{lang === 'ar' ? 'أوتوماتيك' : lang === 'en' ? 'Automatic' : 'Automatique'}</option><option value="manuelle">{lang === 'ar' ? 'يدوي' : lang === 'en' ? 'Manual' : 'Manuelle'}</option></select></Field>
                  <Field label={t('f.couleur')} icon={Palette}><input value={form.couleur} onChange={set('couleur')} placeholder={lang === 'ar' ? 'أسود، أبيض...' : lang === 'en' ? 'Black, white...' : 'Noir, blanc...'} className={inputCls} /></Field>
                  <Field label={t('f.options')}><input value={form.options} onChange={set('options')} placeholder={lang === 'ar' ? 'GPS، فتحة سقف، جلد...' : lang === 'en' ? 'GPS, sunroof, leather...' : 'GPS, toit ouvrant, cuir...'} className={inputCls} /></Field>
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">{t('os.budget')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><Field label={t('f.budget')}><input type="number" value={form.budget} onChange={set('budget')} placeholder="15000" className={inputCls} /></Field></div>
                    <Field label={t('f.devise')}><select value={form.devise} onChange={set('devise')} className={inputCls}><option value="EUR">EUR</option><option value="DZD">DZD</option></select></Field>
                  </div>
                  <Field label={t('f.origine')} icon={Globe}><input value={form.origine} onChange={set('origine')} placeholder={lang === 'ar' ? 'فرنسا، ألمانيا...' : lang === 'en' ? 'France, Germany...' : 'France, Allemagne...'} className={inputCls} /></Field>
                  <Field label={t('f.delai')}><input value={form.delai} onChange={set('delai')} placeholder={lang === 'ar' ? '2-3 أشهر...' : lang === 'en' ? '2-3 months...' : '2-3 mois...'} className={inputCls} /></Field>
                  <Field label={t('f.liens')}><input value={form.liens} onChange={set('liens')} placeholder="https://..." className={inputCls} /></Field>
                </div>
              </div>

              {/* Message */}
              <Field label={t('f.message')}>
                <textarea value={form.message} onChange={set('message')} rows={3} className={`${inputCls} resize-none`} />
              </Field>

              {/* Code parrainage (optionnel) */}
              <Field label={lang === 'ar' ? 'رمز الإحالة (اختياري)' : lang === 'en' ? 'Referral code (optional)' : 'Code parrainage (optionnel)'}>
                <input value={form.referral} onChange={set('referral')} placeholder={lang === 'ar' ? 'إن كان لديك رمز' : lang === 'en' ? 'If you have a code' : 'Si vous avez un code'} className={inputCls} />
              </Field>

              {/* Case obligatoire */}
              <button type="button" onClick={() => setAccept(a => !a)}
                className={`w-full flex items-start gap-3 text-left px-4 py-4 rounded-xl border transition-all ${accept ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${accept ? 'bg-gold-500 border-gold-500' : 'border-white/25'}`}>
                  {accept && <CheckCircle2 size={14} className="text-noir-950" />}
                </div>
                <span className="text-white/55 text-xs leading-relaxed">
                  {t('f.checkbox')}
                </span>
              </button>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertTriangle size={15} />{error}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={submitting} className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 text-base disabled:opacity-60">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} {t('order.send')}
              </button>
              <p className="text-white/25 text-xs text-center">{t('os.submit_note')}</p>
            </div>
          </section>

          {/* Conditions importantes */}
          <section>
            <div className="bg-gradient-to-b from-[#161310] to-[#111] border border-amber-500/15 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-amber-400" /></div>
                <div>
                  <h2 className="text-white font-bold text-lg">{t('order.conditions')}</h2>
                  <p className="text-white/35 text-xs">{t('os.cond_sub')}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {COND_KEYS.map((k, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-amber-400/60 rounded-full flex-shrink-0" />
                    <span className="text-white/50 text-sm leading-relaxed">{t(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}
