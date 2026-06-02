import Head from 'next/head';
import { useState } from 'react';
import {
  Globe, Search, FileCheck, Wallet, Truck, ShieldCheck, AlertTriangle,
  Send, Car, MapPin, Gauge, Fuel, Settings, Calendar, Palette, MessageCircle, CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLang } from '../lib/i18n';

const WHATSAPP = '32466311469';
const ACOMPTE_PCT = 50; // % acompte affiché

const STEPS = [
  { icon: FileCheck,  title: 'Vous remplissez votre demande', desc: 'Indiquez le véhicule recherché et vos critères.' },
  { icon: Search,     title: 'Nous étudions la faisabilité',  desc: 'Chaque dossier est analysé individuellement.' },
  { icon: Wallet,     title: 'Estimation claire',              desc: 'Nous proposons un prix et des conditions transparentes.' },
  { icon: ShieldCheck,title: 'Accord + acompte',               desc: `Si vous acceptez, un acompte (ex. ${ACOMPTE_PCT}%) sécurise la recherche.` },
  { icon: Globe,      title: 'Recherche du véhicule',          desc: 'Nous trouvons le véhicule selon vos critères.' },
  { icon: Truck,      title: 'Achat & acheminement',           desc: 'Nous gérons l\'achat, les démarches et le transport.' },
  { icon: CheckCircle2,title: 'Livraison & solde',             desc: 'Vous réglez le solde selon les conditions convenues.' },
];

const CONDITIONS = [
  "La demande ne confirme PAS automatiquement une commande.",
  "Toute commande validée nécessite un accord écrit entre le client et Fik Conciergerie.",
  `Un acompte peut être demandé (par exemple ${ACOMPTE_PCT}% du prix estimé ou du montant convenu).`,
  "L'acompte sert à sécuriser la recherche, la réservation ou l'achat du véhicule.",
  "Le solde devra être réglé selon les conditions définies avant la livraison ou remise du véhicule.",
  "Les frais supplémentaires éventuels (transport, démarches, taxes, douane, documents, frais de service) sont indiqués clairement AVANT validation.",
  "Les délais varient selon le pays, la disponibilité, le transport et les démarches administratives.",
  "Le client doit fournir des informations exactes.",
  "Fik Conciergerie s'engage à informer le client clairement à chaque étape.",
  "Chaque dossier est étudié individuellement — aucune fausse promesse.",
  "Les conditions finales seront confirmées PAR ÉCRIT avant tout paiement.",
];

const emptyForm = {
  nom: '', prenom: '', whatsapp: '', ville: '',
  type: '', marque: '', modele: '', annee_min: '', km_max: '',
  carburant: '', boite: '', budget: '', devise: 'EUR',
  origine: '', delai: '', couleur: '', options: '',
  etat: 'occasion', liens: '', message: '',
};

export default function CommandeVehiculePage() {
  const { t, lang } = useLang();
  const [form, setForm]       = useState(emptyForm);
  const [accept, setAccept]   = useState(false);
  const [error, setError]     = useState('');

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

  const handleSubmit = () => {
    const E = ar
      ? { name: 'الاسم واللقب إجباريان.', wa: 'رقم واتساب إجباري.', veh: 'حدّد على الأقل نوع أو ماركة السيارة.', acc: 'يجب الموافقة على الشروط لإرسال الطلب.' }
      : { name: 'Nom et prénom obligatoires.', wa: 'Numéro WhatsApp obligatoire.', veh: 'Indiquez au moins le type ou la marque du véhicule.', acc: 'Vous devez accepter les conditions pour envoyer la demande.' };
    if (!form.nom.trim() || !form.prenom.trim()) { setError(E.name); return; }
    if (!form.whatsapp.trim()) { setError(E.wa); return; }
    if (!form.marque.trim() && !form.type.trim()) { setError(E.veh); return; }
    if (!accept) { setError(E.acc); return; }
    setError('');
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, '_blank');
  };

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

          {/* Comment ça fonctionne */}
          <section>
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">Le déroulement</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Comment ça <span className="text-gold-gradient italic">fonctionne</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((s, i) => (
                <div key={i} className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
                  <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-[11px] font-black text-noir-950 shadow-[0_0_12px_rgba(226,182,20,0.4)]">{i + 1}</div>
                  <div className="w-11 h-11 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mb-4"><s.icon size={19} className="text-gold-400" /></div>
                  <h3 className="text-white font-bold text-sm mb-1.5 leading-tight">{s.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Formulaire */}
          <section>
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">Votre demande</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Décrivez le <span className="text-gold-gradient italic">véhicule recherché</span></h2>
              <p className="text-white/35 mt-3 text-sm">Plus c'est précis, mieux on vous oriente. Pas de compte requis.</p>
            </div>

            <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 sm:p-8 space-y-7">

              {/* Identité */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">Vos coordonnées</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nom *"><input value={form.nom} onChange={set('nom')} placeholder="Benali" className={inputCls} /></Field>
                  <Field label="Prénom *"><input value={form.prenom} onChange={set('prenom')} placeholder="Karim" className={inputCls} /></Field>
                  <Field label="Numéro WhatsApp *" icon={MessageCircle}><input value={form.whatsapp} onChange={set('whatsapp')} placeholder="+213 ..." className={inputCls} inputMode="tel" /></Field>
                  <Field label="Ville / Pays" icon={MapPin}><input value={form.ville} onChange={set('ville')} placeholder="Oran, Algérie" className={inputCls} /></Field>
                </div>
              </div>

              {/* Véhicule */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">Le véhicule</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Type de véhicule" icon={Car}><input value={form.type} onChange={set('type')} placeholder="SUV, berline, citadine..." className={inputCls} /></Field>
                  <Field label="Marque souhaitée"><input value={form.marque} onChange={set('marque')} placeholder="Volkswagen" className={inputCls} /></Field>
                  <Field label="Modèle souhaité"><input value={form.modele} onChange={set('modele')} placeholder="Golf 8" className={inputCls} /></Field>
                  <Field label="État"><select value={form.etat} onChange={set('etat')} className={inputCls}><option value="occasion">Occasion</option><option value="neuf">Neuf</option><option value="indifferent">Indifférent</option></select></Field>
                  <Field label="Année minimum" icon={Calendar}><input type="number" value={form.annee_min} onChange={set('annee_min')} placeholder="2018" className={inputCls} /></Field>
                  <Field label="Kilométrage maximum" icon={Gauge}><input type="number" value={form.km_max} onChange={set('km_max')} placeholder="80000" className={inputCls} /></Field>
                  <Field label="Carburant" icon={Fuel}><select value={form.carburant} onChange={set('carburant')} className={inputCls}><option value="">— Indifférent —</option><option>essence</option><option>diesel</option><option>hybride</option><option>électrique</option></select></Field>
                  <Field label="Boîte" icon={Settings}><select value={form.boite} onChange={set('boite')} className={inputCls}><option value="">— Indifférent —</option><option>automatique</option><option>manuelle</option></select></Field>
                  <Field label="Couleur souhaitée" icon={Palette}><input value={form.couleur} onChange={set('couleur')} placeholder="Noir, blanc..." className={inputCls} /></Field>
                  <Field label="Options importantes"><input value={form.options} onChange={set('options')} placeholder="GPS, toit ouvrant, cuir..." className={inputCls} /></Field>
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-gold-400/80 text-[11px] font-black uppercase tracking-widest mb-4">Budget &amp; logistique</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><Field label="Budget maximum"><input type="number" value={form.budget} onChange={set('budget')} placeholder="15000" className={inputCls} /></Field></div>
                    <Field label="Devise"><select value={form.devise} onChange={set('devise')} className={inputCls}><option value="EUR">EUR</option><option value="DZD">DZD</option></select></Field>
                  </div>
                  <Field label="Pays d'origine souhaité" icon={Globe}><input value={form.origine} onChange={set('origine')} placeholder="France, Allemagne..." className={inputCls} /></Field>
                  <Field label="Délai souhaité"><input value={form.delai} onChange={set('delai')} placeholder="2-3 mois, dès que possible..." className={inputCls} /></Field>
                  <Field label="Liens d'exemples (annonces, photos)"><input value={form.liens} onChange={set('liens')} placeholder="Collez des liens d'annonces..." className={inputCls} /></Field>
                </div>
              </div>

              {/* Message */}
              <Field label="Message libre">
                <textarea value={form.message} onChange={set('message')} rows={3} placeholder="Précisez tout détail utile à votre recherche..." className={`${inputCls} resize-none`} />
              </Field>

              {/* Case obligatoire */}
              <button type="button" onClick={() => setAccept(a => !a)}
                className={`w-full flex items-start gap-3 text-left px-4 py-4 rounded-xl border transition-all ${accept ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${accept ? 'bg-gold-500 border-gold-500' : 'border-white/25'}`}>
                  {accept && <CheckCircle2 size={14} className="text-noir-950" />}
                </div>
                <span className="text-white/55 text-xs leading-relaxed">
                  J'ai lu et j'accepte que ma demande soit étudiée par Fik Conciergerie et que la commande ne soit validée qu'<strong className="text-white/80">après confirmation écrite et accord sur les conditions</strong>.
                </span>
              </button>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertTriangle size={15} />{error}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 text-base">
                <Send size={18} /> {t('order.send')}
              </button>
              <p className="text-white/25 text-xs text-center">Votre demande s'ouvre dans WhatsApp, pré-remplie. Aucun compte requis.</p>
            </div>
          </section>

          {/* Conditions importantes */}
          <section>
            <div className="bg-gradient-to-b from-[#161310] to-[#111] border border-amber-500/15 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-amber-400" /></div>
                <div>
                  <h2 className="text-white font-bold text-lg">{t('order.conditions')}</h2>
                  <p className="text-white/35 text-xs">À lire avant toute demande</p>
                </div>
              </div>
              <ul className="space-y-3">
                {CONDITIONS.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-amber-400/60 rounded-full flex-shrink-0" />
                    <span className="text-white/50 text-sm leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
