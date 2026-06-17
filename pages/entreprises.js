import Head from 'next/head';
import { useState } from 'react';
import { Building2, Check, Car, Home, UserCog, MessageCircle, Send, ShieldCheck, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { T } from '../lib/autoTranslate';
import { useSettings, waLink } from '../lib/settings';

const BASE = 'https://fikconciergerie.com';

// Page B2B — offres entreprises (sociétés type Total qui collaborent avec des sociétés algériennes).
// 3 packs (sur devis) + formulaire de demande de devis → lead category 'entreprise'.
const PACKS = [
  {
    key: 'platinium', name: 'Platinium', tier: 'Essentiel', color: '#9ca3af',
    tagline: "Mobilité + logement pour vos équipes",
    items: [
      { icon: Car,  fr: 'Voiture de location fiable, livrée prête' },
      { icon: Home, fr: 'Appartement équipé proche du lieu de mission' },
      { icon: ShieldCheck, fr: 'Facturation société + contrat clair' },
    ],
  },
  {
    key: 'gold', name: 'Gold', tier: 'Premium', color: '#fbbf24', featured: true,
    tagline: "Confort supérieur pour cadres et délégations",
    items: [
      { icon: Car,  fr: 'Voiture de luxe OU van (groupe / matériel)' },
      { icon: Home, fr: 'Appartement haut de gamme OU maison' },
      { icon: ShieldCheck, fr: 'Facturation société + suivi dédié' },
    ],
  },
  {
    key: 'diamant', name: 'Diamant', tier: 'Signature', color: '#22d3ee',
    tagline: "Clé en main total : on gère tout sur place",
    items: [
      { icon: Car,  fr: 'Voiture de luxe avec chauffeur' },
      { icon: Home, fr: 'Maison de standing' },
      { icon: UserCog, fr: 'Chauffeur + guide dédié pour vos déplacements' },
      { icon: Briefcase, fr: 'Accompagnement & aide aux négociations avec les sociétés algériennes' },
    ],
  },
];

export default function Entreprises() {
  const { lang } = useLang();
  const settings = useSettings();
  const L = (fr, ar, en) => (lang === 'ar' ? ar : lang === 'en' ? en : fr);
  const rtl = lang === 'ar';

  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', pack: '', duration: '', people: '', needs: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const waMsg = L(
    'Bonjour Fik Conciergerie, je représente une entreprise et souhaite un devis pour vos packs (mobilité + logement) à Oran.',
    'مرحبا فيك كونسيرجري، أمثل شركة وأرغب في عرض سعر لباقاتكم (سيارة + سكن) في وهران.',
    'Hello Fik Conciergerie, I represent a company and would like a quote for your corporate packs (mobility + housing) in Oran.',
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.name.trim() || !form.phone.trim()) {
      setErr(L('Société, nom et téléphone requis.', 'الشركة، الاسم والهاتف إجبارية.', 'Company, name and phone required.'));
      return;
    }
    setSending(true); setErr('');
    const criteria = `🏢 ${form.company}${form.pack ? ` — Pack ${form.pack}` : ''}`;
    const notes = [
      form.duration ? `Durée: ${form.duration}` : '',
      form.people ? `Personnes: ${form.people}` : '',
      form.needs ? `Besoins: ${form.needs}` : '',
    ].filter(Boolean).join(' · ');
    try {
      const r = await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: `${form.name} (${form.company})`,
          client_phone: form.phone, client_email: form.email,
          category: 'entreprise', criteria, notes, city: 'Oran', lang,
        }),
      });
      if (!r.ok) throw new Error('fail');
      setDone(true);
    } catch {
      setErr(L('Erreur. Réessayez ou contactez-nous sur WhatsApp.', 'حدث خطأ. حاول مجددا أو تواصل عبر واتساب.', 'Error. Try again or contact us on WhatsApp.'));
    } finally { setSending(false); }
  };

  const schema = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: 'Offres entreprises — mobilité & logement Oran',
    description: "Packs entreprises à Oran : voiture, logement, chauffeur, guide et accompagnement pour les sociétés et leurs collaborateurs.",
    provider: { '@type': 'LocalBusiness', name: 'Fik Conciergerie', address: { '@type': 'PostalAddress', addressLocality: 'Oran', addressCountry: 'DZ' } },
    areaServed: { '@type': 'City', name: 'Oran' }, url: `${BASE}/entreprises`,
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <Head>
        <title>{L('Offres Entreprises à Oran — Voiture, Logement & Conciergerie | Fik', 'عروض الشركات في وهران | فيك', 'Corporate Offers in Oran — Car, Housing & Concierge | Fik')}</title>
        <meta name="description" content={L(
          'Packs entreprises à Oran pour vos collaborateurs et délégations : voiture (luxe/van), logement, chauffeur, guide et accompagnement avec les sociétés algériennes. Sur devis, facturation société.',
          'باقات الشركات في وهران: سيارة، سكن، سائق ومرافقة. عرض سعر وفاتورة للشركة.',
          'Corporate packs in Oran for your staff and delegations: car (luxury/van), housing, driver, guide and support with Algerian companies. On quote, company invoicing.',
        )} />
        <link rel="canonical" href={`${BASE}/entreprises`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#080808] text-white">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pt-28 pb-16 text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/[0.06] text-gold-400 text-xs font-body tracking-widest uppercase mb-6">
            <Building2 size={14} /><T>Solutions Entreprises</T>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black leading-tight max-w-3xl mx-auto">
            <T>Vos équipes à Oran,</T>{' '}
            <span className="bg-gradient-to-br from-gold-300 to-gold-500 bg-clip-text text-transparent"><T>prises en charge de A à Z</T></span>
          </h1>
          <p className="mt-6 text-white/60 max-w-2xl mx-auto text-base md:text-lg font-body leading-relaxed">
            <T>Pour les sociétés (énergie, BTP, multinationales) et leurs partenaires algériens : véhicule, logement, chauffeur et accompagnement clé en main. Un seul interlocuteur, facturation société, discrétion totale.</T>
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="#devis" className="btn-gold py-3 px-7 text-sm font-body"><Send size={15} />{L('Demander un devis', 'اطلب عرض سعر', 'Request a quote')}</a>
            <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3 px-7 text-sm font-body"><MessageCircle size={15} />WhatsApp</a>
          </div>
        </section>

        {/* Packs */}
        <section className="px-5 pb-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {PACKS.map((p) => (
              <div key={p.key} className={`relative rounded-3xl border p-6 bg-[#111] ${p.featured ? 'border-gold-500/50 shadow-[0_0_40px_rgba(201,162,39,0.12)]' : 'border-white/10'}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-black text-[10px] font-bold tracking-wider uppercase">{L('Le plus demandé', 'الأكثر طلبا', 'Most popular')}</div>}
                <div className="text-xs font-body tracking-widest uppercase mb-1" style={{ color: p.color }}>{p.tier}</div>
                <div className="font-display text-3xl font-black mb-2" style={{ color: p.color }}>{p.name}</div>
                <p className="text-white/55 text-sm font-body mb-5 min-h-[40px]"><T>{p.tagline}</T></p>
                <ul className="space-y-3 mb-6">
                  {p.items.map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80 font-body">
                        <span className="mt-0.5 shrink-0" style={{ color: p.color }}><Icon size={16} /></span>
                        <span><T>{it.fr}</T></span>
                      </li>
                    );
                  })}
                </ul>
                <a href="#devis" onClick={() => setForm((f) => ({ ...f, pack: p.name }))}
                  className="block text-center py-3 rounded-xl text-sm font-body font-semibold border transition-all"
                  style={{ borderColor: `${p.color}55`, color: p.color, background: `${p.color}12` }}>
                  {L('Demander ce pack', 'اطلب هذه الباقة', 'Request this pack')}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-xs font-body mt-5">
            <T>Tous les packs sont sur devis et personnalisables selon la durée, le nombre de personnes et vos besoins.</T>
          </p>
        </section>

        {/* Pourquoi nous */}
        <section className="px-5 py-14 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10"><T>Pourquoi les entreprises nous choisissent</T></h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { h: 'Un seul interlocuteur', p: "Voiture, logement, chauffeur, démarches : tout est centralisé. Vos équipes arrivent, tout est prêt." },
              { h: 'Facturation & contrat société', p: "Devis clair, contrat, facturation au nom de l'entreprise. Conforme et traçable." },
              { h: 'Connaissance du terrain', p: "On connaît Oran et les usages locaux. On facilite vos déplacements et vos relations avec les sociétés algériennes." },
            ].map((w, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#111] p-6">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4"><Check size={18} /></div>
                <div className="font-display text-lg font-bold mb-2"><T>{w.h}</T></div>
                <p className="text-white/55 text-sm font-body leading-relaxed"><T>{w.p}</T></p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire devis */}
        <section id="devis" className="px-5 pb-24 max-w-2xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border border-gold-500/25 bg-gradient-to-b from-[#141414] to-[#0c0c0c] p-7">
            <h2 className="font-display text-2xl font-bold mb-1"><T>Demander un devis entreprise</T></h2>
            <p className="text-white/50 text-sm font-body mb-6"><T>Réponse rapide. Aucun engagement.</T></p>
            {done ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400"><Check size={26} /></div>
                <div className="font-display text-xl font-bold mb-2"><T>Demande envoyée !</T></div>
                <p className="text-white/55 text-sm font-body mb-5"><T>Notre équipe vous recontacte rapidement avec une proposition.</T></p>
                <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-gold py-3 px-6 text-sm font-body inline-flex"><MessageCircle size={15} />{L('Discuter sur WhatsApp', 'تحدث على واتساب', 'Chat on WhatsApp')}</a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input value={form.company} onChange={set('company')} placeholder={L('Nom de la société *', 'اسم الشركة *', 'Company name *')} className="input-dark w-full" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={form.name} onChange={set('name')} placeholder={L('Votre nom *', 'اسمك *', 'Your name *')} className="input-dark w-full" />
                  <input value={form.phone} onChange={set('phone')} inputMode="tel" placeholder={L('Téléphone / WhatsApp *', 'الهاتف *', 'Phone / WhatsApp *')} className="input-dark w-full" />
                </div>
                <input value={form.email} onChange={set('email')} inputMode="email" placeholder={L('Email professionnel', 'البريد المهني', 'Work email')} className="input-dark w-full" />
                <div className="grid sm:grid-cols-3 gap-3">
                  <select value={form.pack} onChange={set('pack')} className="input-dark w-full">
                    <option value="">{L('Pack souhaité', 'الباقة', 'Pack')}</option>
                    {PACKS.map((p) => <option key={p.key} value={p.name}>{p.name}</option>)}
                  </select>
                  <input value={form.duration} onChange={set('duration')} placeholder={L('Durée (ex: 3 mois)', 'المدة', 'Duration')} className="input-dark w-full" />
                  <input value={form.people} onChange={set('people')} inputMode="numeric" placeholder={L('Nb personnes', 'عدد الأشخاص', 'People')} className="input-dark w-full" />
                </div>
                <textarea value={form.needs} onChange={set('needs')} rows={3} placeholder={L('Vos besoins (véhicules, logement, chauffeur, dates…)', 'احتياجاتكم', 'Your needs (vehicles, housing, driver, dates…)')} className="input-dark w-full resize-none" />
                {err && <p className="text-red-400 text-sm font-body">{err}</p>}
                <button type="submit" disabled={sending} className="btn-gold w-full py-3.5 text-sm font-body disabled:opacity-50">
                  <Send size={15} />{sending ? L('Envoi…', 'جارٍ الإرسال…', 'Sending…') : L('Envoyer la demande', 'إرسال الطلب', 'Send request')}
                </button>
                <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full py-3 text-sm font-body"><MessageCircle size={15} />{L('Ou écrire sur WhatsApp', 'أو عبر واتساب', 'Or message on WhatsApp')}</a>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
