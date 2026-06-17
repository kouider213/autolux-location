import Head from 'next/head';
import { useState } from 'react';
import { Building2, Check, Car, Home, UserCog, MessageCircle, Send, ShieldCheck, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { useSettings, waLink } from '../lib/settings';

const BASE = 'https://fikconciergerie.com';

// Page B2B — offres entreprises (sociétés type Total qui collaborent avec des sociétés algériennes).
// 3 packs (sur devis) + formulaire de demande de devis → lead category 'entreprise'.
// Champs traduits en dur (FR/AR/EN) — pas de dépendance à la traduction runtime.
const PACKS = [
  {
    key: 'platinium', name: 'Platinium', color: '#9ca3af',
    tier: { fr: 'Essentiel', ar: 'أساسي', en: 'Essential' },
    tagline: { fr: 'Mobilité + logement pour vos équipes', ar: 'تنقّل + سكن لفرقكم', en: 'Mobility + housing for your teams' },
    items: [
      { icon: Car,  fr: 'Voiture de location fiable, livrée prête', ar: 'سيارة كراء موثوقة، تُسلَّم جاهزة', en: 'Reliable rental car, delivered ready' },
      { icon: Home, fr: 'Appartement équipé proche du lieu de mission', ar: 'شقة مجهّزة قرب مكان المهمّة', en: 'Equipped apartment near the work site' },
      { icon: ShieldCheck, fr: 'Facturation société + contrat clair', ar: 'فاتورة للشركة + عقد واضح', en: 'Company invoicing + clear contract' },
    ],
  },
  {
    key: 'gold', name: 'Gold', color: '#fbbf24', featured: true,
    tier: { fr: 'Premium', ar: 'بريميوم', en: 'Premium' },
    tagline: { fr: 'Confort supérieur pour cadres et délégations', ar: 'راحة فائقة للإطارات والوفود', en: 'Premium comfort for executives & delegations' },
    items: [
      { icon: Car,  fr: 'Voiture de luxe OU van (groupe / matériel)', ar: 'سيارة فاخرة أو فان (مجموعة/معدات)', en: 'Luxury car OR van (group / equipment)' },
      { icon: Home, fr: 'Appartement haut de gamme OU maison', ar: 'شقة راقية أو منزل', en: 'High-end apartment OR house' },
      { icon: ShieldCheck, fr: 'Facturation société + suivi dédié', ar: 'فاتورة للشركة + متابعة مخصّصة', en: 'Company invoicing + dedicated follow-up' },
    ],
  },
  {
    key: 'diamant', name: 'Diamant', color: '#22d3ee',
    tier: { fr: 'Signature', ar: 'سيغنتشر', en: 'Signature' },
    tagline: { fr: 'Clé en main total : on gère tout sur place', ar: 'حلّ متكامل: نتكفّل بكل شيء على عين المكان', en: 'Fully turnkey: we handle everything on the ground' },
    items: [
      { icon: Car,  fr: 'Voiture de luxe avec chauffeur', ar: 'سيارة فاخرة مع سائق', en: 'Luxury car with driver' },
      { icon: Home, fr: 'Maison de standing', ar: 'منزل راقٍ', en: 'Upscale house' },
      { icon: UserCog, fr: 'Chauffeur + guide dédié pour vos déplacements', ar: 'سائق + مرشد مخصّص لتنقّلاتكم', en: 'Driver + dedicated guide for your trips' },
      { icon: Briefcase, fr: 'Accompagnement & aide aux négociations avec les sociétés algériennes', ar: 'مرافقة ومساعدة في المفاوضات مع الشركات الجزائرية', en: 'Support & help negotiating with Algerian companies' },
    ],
  },
];

export default function Entreprises() {
  const { lang } = useLang();
  const settings = useSettings();
  const L = (fr, ar, en) => (lang === 'ar' ? ar : lang === 'en' ? en : fr);
  const pick = (o) => (o ? (o[lang] || o.fr) : '');
  const rtl = lang === 'ar';

  // Réassurances + section "pourquoi" — trilingues en dur.
  const REASSURE = [
    { fr: 'Chauffeur professionnel', ar: 'سائق محترف', en: 'Professional driver' },
    { fr: 'Facturation société', ar: 'فاتورة للشركة', en: 'Company invoicing' },
    { fr: 'Confidentialité', ar: 'سرّية تامة', en: 'Confidentiality' },
    { fr: 'Disponible 7j/7', ar: 'متاح 7/7', en: 'Available 7/7' },
  ];
  const WHY = [
    { h: { fr: 'Un seul interlocuteur', ar: 'مُحاور واحد', en: 'One single contact' }, p: { fr: 'Voiture, logement, chauffeur, démarches : tout est centralisé. Vos équipes arrivent, tout est prêt.', ar: 'سيارة، سكن، سائق، الإجراءات: كل شيء مُجمَّع. تصل فرقكم وكل شيء جاهز.', en: 'Car, housing, driver, paperwork: all centralized. Your teams arrive, everything is ready.' } },
    { h: { fr: 'Facturation & contrat société', ar: 'فوترة وعقد للشركة', en: 'Company invoicing & contract' }, p: { fr: "Devis clair, contrat, facturation au nom de l'entreprise. Conforme et traçable.", ar: 'عرض سعر واضح، عقد، فاتورة باسم الشركة. مطابق وقابل للتتبّع.', en: 'Clear quote, contract, invoicing in the company name. Compliant and traceable.' } },
    { h: { fr: 'Connaissance du terrain', ar: 'معرفة الميدان', en: 'Local know-how' }, p: { fr: 'On connaît Oran et les usages locaux. On facilite vos déplacements et vos relations avec les sociétés algériennes.', ar: 'نعرف وهران والعادات المحلية. نُسهّل تنقّلاتكم وعلاقاتكم مع الشركات الجزائرية.', en: 'We know Oran and local customs. We ease your travel and your relations with Algerian companies.' } },
  ];

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
        <meta property="og:type" content="website" />
        <meta property="og:title" content={L('Fik Conciergerie — Service dédié aux entreprises à Oran', 'فيك — خدمة مخصصة للشركات في وهران', 'Fik Conciergerie — Corporate service in Oran')} />
        <meta property="og:description" content={L('Véhicule avec chauffeur, logement et accompagnement clé en main pour vos équipes et partenaires à Oran.', 'سيارة مع سائق، سكن ومرافقة لفرقكم في وهران.', 'Car with driver, housing and full support for your teams and partners in Oran.')} />
        <meta property="og:image" content={`${BASE}/entreprises-hero.jpg`} />
        <meta property="og:url" content={`${BASE}/entreprises`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${BASE}/entreprises-hero.jpg`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#080808] text-white">
        {/* Hero — texte + photo COMPLÈTE (non recadrée) du chauffeur + van FIK */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
          {/* Bloc texte */}
          <div className={`max-w-6xl mx-auto px-5 md:px-10 pt-28 pb-8 ${rtl ? 'text-right' : 'text-left'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/40 bg-gold-500/[0.08] text-gold-400 text-xs font-body tracking-widest uppercase mb-6">
              <Building2 size={14} />{L('Service dédié aux entreprises', 'خدمة مخصّصة للشركات', 'Dedicated corporate service')}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05]">
              {L('Vos équipes à Oran,', 'فرقكم في وهران،', 'Your teams in Oran,')}{' '}
              <span className="bg-gradient-to-br from-gold-200 to-gold-500 bg-clip-text text-transparent">{L('prises en charge de A à Z', 'تكفّل كامل من الألف إلى الياء', 'fully taken care of, A to Z')}</span>
            </h1>
            <p className="mt-6 text-white/70 text-base md:text-lg font-body leading-relaxed max-w-2xl">
              {L(
                'Pour les sociétés (énergie, BTP, multinationales) et leurs partenaires algériens : véhicule avec chauffeur, logement et accompagnement clé en main. Un seul interlocuteur, facturation société, discrétion totale.',
                'للشركات (الطاقة، البناء، المتعدّدة الجنسيات) وشركائها الجزائريين: سيارة مع سائق، سكن ومرافقة متكاملة. مُحاور واحد، فاتورة للشركة، سرّية تامة.',
                'For companies (energy, construction, multinationals) and their Algerian partners: car with driver, housing and full turnkey support. One single contact, company invoicing, total discretion.',
              )}
            </p>
            <div className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-white/70 font-body ${rtl ? 'justify-end' : ''}`}>
              {REASSURE.map((r) => (
                <span key={r.fr} className="inline-flex items-center gap-1.5"><Check size={14} className="text-gold-400" />{pick(r)}</span>
              ))}
            </div>
            <div className={`mt-8 flex flex-wrap gap-3 ${rtl ? 'justify-end' : ''}`}>
              <a href="#devis" className="btn-gold py-3 px-7 text-sm font-body"><Send size={15} />{L('Demander un devis', 'اطلب عرض سعر', 'Request a quote')}</a>
              <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3 px-7 text-sm font-body"><MessageCircle size={15} />WhatsApp</a>
            </div>
          </div>
          {/* Photo COMPLÈTE — jamais recadrée (object-contain, fond noir) */}
          <div className="mt-4 px-5 pb-4">
            <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black">
              <img src="/entreprises-hero.jpg" alt="Fik Conciergerie — service entreprise avec chauffeur à Oran"
                className="w-full h-auto block" loading="eager" />
            </div>
          </div>
        </section>

        {/* Packs */}
        <section className="px-5 pb-8 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {PACKS.map((p) => (
              <div key={p.key} className={`relative rounded-3xl border p-6 bg-[#111] ${p.featured ? 'border-gold-500/50 shadow-[0_0_40px_rgba(201,162,39,0.12)]' : 'border-white/10'}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-black text-[10px] font-bold tracking-wider uppercase">{L('Le plus demandé', 'الأكثر طلبا', 'Most popular')}</div>}
                <div className="text-xs font-body tracking-widest uppercase mb-1" style={{ color: p.color }}>{pick(p.tier)}</div>
                <div className="font-display text-3xl font-black mb-2" style={{ color: p.color }}>{p.name}</div>
                <p className="text-white/55 text-sm font-body mb-5 min-h-[40px]">{pick(p.tagline)}</p>
                <ul className="space-y-3 mb-6">
                  {p.items.map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80 font-body">
                        <span className="mt-0.5 shrink-0" style={{ color: p.color }}><Icon size={16} /></span>
                        <span>{pick(it)}</span>
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
            {L('Tous les packs sont sur devis et personnalisables selon la durée, le nombre de personnes et vos besoins.', 'كل الباقات حسب عرض السعر وقابلة للتخصيص حسب المدّة وعدد الأشخاص واحتياجاتكم.', 'All packs are on quote and customizable based on duration, number of people and your needs.')}
          </p>
        </section>

        {/* Pourquoi nous */}
        <section className="px-5 py-14 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">{L('Pourquoi les entreprises nous choisissent', 'لماذا تختارنا الشركات', 'Why companies choose us')}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {WHY.map((w, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#111] p-6">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4"><Check size={18} /></div>
                <div className="font-display text-lg font-bold mb-2">{pick(w.h)}</div>
                <p className="text-white/55 text-sm font-body leading-relaxed">{pick(w.p)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire devis */}
        <section id="devis" className="px-5 pb-24 max-w-2xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border border-gold-500/25 bg-gradient-to-b from-[#141414] to-[#0c0c0c] p-7">
            <h2 className="font-display text-2xl font-bold mb-1">{L('Demander un devis entreprise', 'اطلب عرض سعر للشركة', 'Request a corporate quote')}</h2>
            <p className="text-white/50 text-sm font-body mb-6">{L('Réponse rapide. Aucun engagement.', 'ردّ سريع. دون أي التزام.', 'Fast reply. No commitment.')}</p>
            {done ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400"><Check size={26} /></div>
                <div className="font-display text-xl font-bold mb-2">{L('Demande envoyée !', 'تم إرسال الطلب !', 'Request sent!')}</div>
                <p className="text-white/55 text-sm font-body mb-5">{L('Notre équipe vous recontacte rapidement avec une proposition.', 'سيتواصل معكم فريقنا قريباً بعرض.', 'Our team will get back to you shortly with a proposal.')}</p>
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
