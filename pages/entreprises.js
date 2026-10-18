import Head from 'next/head';
import { useState } from 'react';
import { Building2, Check, Car, Home, UserCog, MessageCircle, Send, ShieldCheck, Briefcase, FileDown, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../lib/i18n';
import { useSettings, waLink } from '../lib/settings';
import { cText, cImg } from '../lib/content';

const BASE = 'https://fikconciergerie.com';
const CONTACT_EMAIL = 'contact@fikconciergerie.com';

// Page B2B — offres entreprises (sociétés type Total qui collaborent avec des sociétés algériennes).
// 3 packs (sur devis) + formulaire de demande de devis → lead category 'entreprise' + plaquette PDF (FR/EN).
// Un seul nom par pack (Essentiel / Premium / Signature) — plus de double nom métal + niveau.
// Champs traduits en dur (FR/AR/EN) — pas de dépendance à la traduction runtime.
const PACKS = [
  {
    key: 'essentiel', color: '#d4d4d8',
    name: { fr: 'Essentiel', ar: 'أساسي', en: 'Essential' },
    tagline: { fr: 'Mobilité + logement pour vos équipes', ar: 'تنقّل + سكن لفرقكم', en: 'Mobility + housing for your teams' },
    items: [
      { icon: Car,  fr: 'Voiture de location fiable, livrée prête', ar: 'سيارة كراء موثوقة، تُسلَّم جاهزة', en: 'Reliable rental car, delivered ready' },
      { icon: Home, fr: 'Appartement équipé proche du lieu de mission', ar: 'شقة مجهّزة قرب مكان المهمّة', en: 'Equipped apartment near the work site' },
      { icon: ShieldCheck, fr: 'Facturation société + contrat clair', ar: 'فاتورة للشركة + عقد واضح', en: 'Company invoicing + clear contract' },
    ],
  },
  {
    key: 'premium', color: '#e2b614', featured: true,
    name: { fr: 'Premium', ar: 'بريميوم', en: 'Premium' },
    tagline: { fr: 'Confort supérieur pour cadres et délégations', ar: 'راحة فائقة للإطارات والوفود', en: 'Premium comfort for executives & delegations' },
    items: [
      { icon: Car,  fr: 'Voiture de luxe OU van (groupe / matériel)', ar: 'سيارة فاخرة أو فان (مجموعة/معدات)', en: 'Luxury car OR van (group / equipment)' },
      { icon: Home, fr: 'Appartement haut de gamme OU maison', ar: 'شقة راقية أو منزل', en: 'High-end apartment OR house' },
      { icon: ShieldCheck, fr: 'Facturation société + suivi dédié', ar: 'فاتورة للشركة + متابعة مخصّصة', en: 'Company invoicing + dedicated follow-up' },
    ],
  },
  {
    key: 'signature', color: '#f5e27a',
    name: { fr: 'Signature', ar: 'سيغنتشر', en: 'Signature' },
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

  const STEPS = [
    { h: { fr: 'Vous nous écrivez', ar: 'تراسلوننا', en: 'You write to us' }, p: { fr: 'Dates, nombre de personnes, besoins : un message suffit.', ar: 'التواريخ، عدد الأشخاص، الاحتياجات: رسالة واحدة تكفي.', en: 'Dates, headcount, needs: one message is enough.' } },
    { h: { fr: 'Devis sur mesure', ar: 'عرض سعر مخصّص', en: 'Tailored quote' }, p: { fr: 'Une proposition claire au nom de votre société.', ar: 'عرض واضح باسم شركتكم.', en: 'A clear proposal in your company name.' } },
    { h: { fr: 'On prépare tout', ar: 'نحضّر كل شيء', en: 'We prepare everything' }, p: { fr: 'Véhicules, logement, chauffeur : tout est prêt avant l\'arrivée.', ar: 'السيارات، السكن، السائق: كل شيء جاهز قبل الوصول.', en: 'Vehicles, housing, driver: all ready before arrival.' } },
    { h: { fr: 'Vos équipes arrivent', ar: 'تصل فرقكم', en: 'Your teams arrive' }, p: { fr: 'Accueil à Oran et un seul interlocuteur pendant toute la mission.', ar: 'استقبال في وهران ومُحاور واحد طوال المهمّة.', en: 'Welcome in Oran and one single contact for the whole mission.' } },
  ];

  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', pack: '', from: '', to: '', people: '', needs: '' });
  // Plaquette 2 pages à faire suivre en interne (service achats) — pas de version arabe → FR.
  const brochure = lang === 'en' ? '/plaquette-fik-entreprises-en.pdf' : '/plaquette-fik-entreprises-fr.pdf';
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
    // Entreprise : l'email pro est le canal de réponse (devis écrit) ; le téléphone reste facultatif.
    if (!form.company.trim() || !form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr(L('Société, nom et email professionnel valide requis.', 'الشركة، الاسم وبريد مهني صحيح إجبارية.', 'Company, name and a valid work email required.'));
      return;
    }
    setSending(true); setErr('');
    const criteria = `🏢 ${form.company}${form.pack ? ` — Pack ${form.pack}` : ''}`;
    const notes = [
      form.from || form.to ? `Mission: ${form.from || '?'} → ${form.to || '?'}` : '',
      form.people ? `Personnes: ${form.people}` : '',
      form.needs ? `Besoins: ${form.needs}` : '',
    ].filter(Boolean).join(' · ');
    try {
      const r = await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: `${form.name} (${form.company})`,
          client_phone: form.phone.trim(), client_email: form.email.trim(),
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
    provider: { '@type': 'LocalBusiness', name: 'Fik Conciergerie', email: CONTACT_EMAIL, address: { '@type': 'PostalAddress', addressLocality: 'Oran', addressCountry: 'DZ' } },
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
        <link rel="canonical" href={`${BASE}/entreprises${lang === 'fr' ? '' : `?lang=${lang}`}`} />
        <link rel="alternate" hrefLang="fr" href={`${BASE}/entreprises`} />
        <link rel="alternate" hrefLang="en" href={`${BASE}/entreprises?lang=en`} />
        <link rel="alternate" hrefLang="ar" href={`${BASE}/entreprises?lang=ar`} />
        <link rel="alternate" hrefLang="x-default" href={`${BASE}/entreprises`} />
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

      <main className="min-h-screen bg-[#080808] text-white overflow-x-clip">
        {/* Hero — téléphone/tablette : texte puis photo ; PC : texte à gauche, photo COMPLÈTE (jamais recadrée) à droite */}
        <section className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
          <div className="orb w-[520px] h-[520px] bg-gold-500/[0.07] -top-40 -right-40 hidden lg:block" />
          <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-28 lg:pt-36 pb-10 lg:pb-20 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className={`lg:col-span-6 ${rtl ? 'text-right' : 'text-left'}`}>
              <div className="section-badge mb-6"><Building2 size={13} />{L('Service dédié aux entreprises', 'خدمة مخصّصة للشركات', 'Dedicated corporate service')}</div>
              <h1 className="font-display text-[2.4rem] leading-[1.05] md:text-[3.25rem] lg:text-[4.2rem] font-black">
                {cText(settings, 'ent_hero_title_a', lang, L('Vos équipes à Oran,', 'فرقكم في وهران،', 'Your teams in Oran,'))}{' '}
                <span className="text-gold-gradient">{cText(settings, 'ent_hero_title_b', lang, L('prises en charge de A à Z', 'تكفّل كامل من الألف إلى الياء', 'fully taken care of, A to Z'))}</span>
              </h1>
              <p className="mt-6 text-white/65 text-base md:text-lg font-body leading-relaxed max-w-xl">
                {cText(settings, 'ent_hero_sub', lang, L(
                  'Pour les sociétés (énergie, BTP, multinationales) et leurs partenaires algériens : véhicule avec chauffeur, logement et accompagnement clé en main. Un seul interlocuteur, facturation société, discrétion totale.',
                  'للشركات (الطاقة، البناء، المتعدّدة الجنسيات) وشركائها الجزائريين: سيارة مع سائق، سكن ومرافقة متكاملة. مُحاور واحد، فاتورة للشركة، سرّية تامة.',
                  'For companies (energy, construction, multinationals) and their Algerian partners: car with driver, housing and full turnkey support. One single contact, company invoicing, total discretion.',
                ))}
              </p>
              {/* Réassurances : grille 2×2 en pastilles sur téléphone, ligne sur tablette/PC */}
              <div className="mt-7 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2.5">
                {REASSURE.map((r) => (
                  <span key={r.fr} className="glass rounded-xl md:rounded-full px-3 py-2 md:px-4 inline-flex items-center gap-2 text-xs md:text-[13px] text-white/80 font-body">
                    <span className="w-5 h-5 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-400 flex-shrink-0"><Check size={12} /></span>{pick(r)}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <a href="#devis" className="btn-gold py-3.5 px-8 text-sm font-body justify-center"><Send size={15} />{L('Demander un devis', 'اطلب عرض سعر', 'Request a quote')}</a>
                <div className="grid grid-cols-2 sm:flex gap-3">
                  <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3.5 px-6 text-sm font-body justify-center"><MessageCircle size={15} />WhatsApp</a>
                  <a href={brochure} target="_blank" rel="noopener" className="btn-ghost py-3.5 px-6 text-sm font-body justify-center"><FileDown size={15} />{L('Plaquette PDF', 'الكتيّب PDF', 'PDF brochure')}</a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="gold-frame rounded-[28px] p-1.5 md:p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
                <div className="rounded-[22px] overflow-hidden bg-black">
                  <img src={cImg(settings, 'ent_hero_img', '/entreprises-hero.jpg')} alt="Fik Conciergerie — service entreprise avec chauffeur à Oran"
                    className="w-full h-auto block" loading="eager" />
                </div>
              </div>
              {/* Pastille flottante (tablette/PC) */}
              <div className={`hidden md:flex absolute -bottom-5 ${rtl ? 'right-6' : 'left-6'} glass rounded-2xl px-4 py-3 items-center gap-3 shadow-2xl`}>
                <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400"><Briefcase size={18} /></div>
                <div>
                  <div className="text-white text-sm font-body font-semibold">{L('Facturation société', 'فاتورة للشركة', 'Company invoicing')}</div>
                  <div className="text-white/50 text-xs font-body">{L('Devis · contrat · facture', 'عرض سعر · عقد · فاتورة', 'Quote · contract · invoice')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche — frise 4 étapes (verticale téléphone, 2×2 tablette, ligne reliée PC) */}
        <section className="px-5 md:px-10 py-12 lg:py-16 border-y border-white/[0.06] bg-[#0b0b0b]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="section-badge mb-4">{L('Comment ça marche', 'كيف يعمل', 'How it works')}</div>
              <h2 className="font-display text-2xl md:text-4xl font-bold">{L('Quatre étapes, zéro souci', 'أربع خطوات، بدون عناء', 'Four steps, zero hassle')}</h2>
            </div>
            <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-gold-500/0 via-gold-500/50 to-gold-500/0" />
              {STEPS.map((s, i) => (
                <li key={i} className="relative flex lg:flex-col lg:text-center items-start lg:items-center gap-4 rounded-2xl lg:rounded-none p-4 lg:p-0 bg-white/[0.02] lg:bg-transparent border border-white/[0.06] lg:border-0">
                  <div className="relative z-10 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl gold-frame flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xl lg:text-2xl font-black text-gold-gradient">{i + 1}</span>
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold mb-1">{pick(s.h)}</div>
                    <p className="text-white/55 text-sm font-body leading-relaxed lg:max-w-[230px]">{pick(s.p)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Packs — défilement au doigt sur téléphone, 3 colonnes tablette/PC (Premium surélevé sur PC) */}
        <section className="px-5 md:px-10 pt-16 lg:pt-24 pb-8 max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <div className="section-badge mb-4">{L('Nos packs', 'باقاتنا', 'Our packs')}</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold">{L('Choisissez votre ', 'اختاروا ', 'Choose your ')}<span className="text-gold-gradient">{L('niveau de service', 'مستوى الخدمة', 'service level')}</span></h2>
          </div>
          <div className="snap-row md:grid md:grid-cols-3 md:gap-4 lg:gap-6 md:overflow-visible md:mx-0 md:px-0 lg:items-center">
            {PACKS.map((p, i) => (
              <div key={p.key} className={`relative w-[84%] sm:w-[60%] md:w-auto rounded-3xl p-6 lg:p-8 flex flex-col ${p.featured ? 'gold-frame shadow-[0_0_60px_rgba(226,182,20,0.14)] lg:py-11' : 'lux-card'}`}>
                {p.featured && <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold-500 text-black text-[10px] font-bold tracking-wider uppercase">{L('Le plus demandé', 'الأكثر طلبا', 'Most popular')}</div>}
                <div className="num-outline font-display text-5xl lg:text-6xl font-black leading-none mb-3">0{i + 1}</div>
                <div className="font-display text-3xl lg:text-[2.1rem] font-black mb-2" style={{ color: p.color }}>{cText(settings, `ent_pack${i + 1}_name`, lang, pick(p.name))}</div>
                <p className="text-white/55 text-sm font-body mb-6 md:min-h-[40px]">{cText(settings, `ent_pack${i + 1}_desc`, lang, pick(p.tagline))}</p>
                <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 mb-6" />
                <ul className="space-y-3.5 mb-8 flex-1">
                  {p.items.map((it, j) => {
                    const Icon = it.icon;
                    return (
                      <li key={j} className="flex items-start gap-3 text-sm text-white/80 font-body">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: p.color, background: `${p.color}14` }}><Icon size={15} /></span>
                        <span className="pt-1">{pick(it)}</span>
                      </li>
                    );
                  })}
                </ul>
                <a href="#devis" onClick={() => setForm((f) => ({ ...f, pack: p.name.fr }))}
                  className={p.featured ? 'btn-gold w-full py-3.5 text-sm font-body justify-center' : 'btn-ghost w-full py-3.5 text-sm font-body justify-center'}>
                  {L('Demander ce pack', 'اطلب هذه الباقة', 'Request this pack')}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-xs font-body mt-6">
            {L('Tous les packs sont sur devis et personnalisables selon la durée, le nombre de personnes et vos besoins.', 'كل الباقات حسب عرض السعر وقابلة للتخصيص حسب المدّة وعدد الأشخاص واحتياجاتكم.', 'All packs are on quote and customizable based on duration, number of people and your needs.')}
          </p>
        </section>

        {/* Pourquoi nous — PC : titre collant à gauche + liste numérotée à droite */}
        <section className="px-5 md:px-10 py-16 lg:py-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className={`lg:col-span-5 ${rtl ? 'text-right' : 'text-center lg:text-left'}`}>
            <div className="lg:sticky lg:top-28">
              <div className="section-badge mb-4">{L('Pourquoi Fik', 'لماذا فيك', 'Why Fik')}</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">{L('Pourquoi les entreprises ', 'لماذا تختارنا ', 'Why companies ')}<span className="text-gold-gradient">{L('nous choisissent', 'الشركات', 'choose us')}</span></h2>
              <a href={brochure} target="_blank" rel="noopener" className="hidden lg:inline-flex mt-8 items-center gap-3 gold-frame rounded-2xl px-5 py-4 group">
                <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400"><FileDown size={18} /></span>
                <span>
                  <span className="block text-white text-sm font-body font-semibold group-hover:text-gold-300 transition-colors">{L('Plaquette entreprise (PDF, 2 pages)', 'كتيّب الشركات (PDF، صفحتان)', 'Corporate brochure (PDF, 2 pages)')}</span>
                  <span className="block text-white/45 text-xs font-body">{L('À transmettre à votre service achats', 'لإرسالها إلى مصلحة المشتريات', 'To share with your procurement team')}</span>
                </span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-7 grid md:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-5">
            {WHY.map((w, i) => (
              <div key={i} className="lux-card p-6 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-7 lg:items-center">
                <div className="num-outline font-display text-5xl lg:text-7xl font-black leading-none flex-shrink-0 lg:w-24">0{i + 1}</div>
                <div>
                  <div className="font-display text-lg lg:text-2xl font-bold mb-2">{pick(w.h)}</div>
                  <p className="text-white/55 text-sm lg:text-base font-body leading-relaxed">{pick(w.p)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire devis — PC : encart contact à gauche, formulaire à droite */}
        <section id="devis" className="px-5 md:px-10 pb-24 max-w-6xl mx-auto scroll-mt-24 grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <aside className={`lg:col-span-4 order-2 lg:order-1 ${rtl ? 'text-right' : ''}`}>
            <div className="hidden lg:block mb-6">
              <h2 className="font-display text-3xl font-bold leading-tight mb-3">{L('Parlons de votre ', 'لنتحدث عن ', "Let's talk about your ")}<span className="text-gold-gradient">{L('mission', 'مهمّتكم', 'mission')}</span></h2>
              <p className="text-white/55 text-sm font-body leading-relaxed">{L('Réponse rapide. Aucun engagement.', 'ردّ سريع. دون أي التزام.', 'Fast reply. No commitment.')}</p>
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400 flex-shrink-0"><Mail size={17} /></span>
                <span className="min-w-0"><span className="block text-white/45 text-[11px] font-body uppercase tracking-wider">Email</span><span className="block text-white text-sm font-body truncate">{CONTACT_EMAIL}</span></span>
              </a>
              <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400 flex-shrink-0"><MessageCircle size={17} /></span>
                <span><span className="block text-white/45 text-[11px] font-body uppercase tracking-wider">WhatsApp</span><span className="block text-white text-sm font-body">{L('Réponse directe', 'ردّ مباشر', 'Direct reply')}</span></span>
              </a>
              <a href={brochure} target="_blank" rel="noopener" className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400 flex-shrink-0"><FileDown size={17} /></span>
                <span><span className="block text-white/45 text-[11px] font-body uppercase tracking-wider">PDF</span><span className="block text-white text-sm font-body">{L('Plaquette entreprise', 'كتيّب الشركات', 'Corporate brochure')}</span></span>
              </a>
            </div>
          </aside>
          <div className="lg:col-span-8 order-1 lg:order-2 gold-frame rounded-3xl p-6 md:p-9">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">{L('Demander un devis entreprise', 'اطلب عرض سعر للشركة', 'Request a corporate quote')}</h2>
            <p className="text-white/50 text-sm font-body mb-7 lg:hidden">{L('Réponse rapide. Aucun engagement.', 'ردّ سريع. دون أي التزام.', 'Fast reply. No commitment.')}</p>
            <div className="hidden lg:block h-6" />
            {done ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400"><Check size={26} /></div>
                <div className="font-display text-xl font-bold mb-2">{L('Demande envoyée !', 'تم إرسال الطلب !', 'Request sent!')}</div>
                <p className="text-white/55 text-sm font-body mb-5">{L('Notre équipe vous recontacte rapidement avec une proposition.', 'سيتواصل معكم فريقنا قريباً بعرض.', 'Our team will get back to you shortly with a proposal.')}</p>
                <a href={waLink(settings, waMsg)} target="_blank" rel="noopener noreferrer" className="btn-gold py-3 px-6 text-sm font-body inline-flex"><MessageCircle size={15} />{L('Discuter sur WhatsApp', 'تحدث على واتساب', 'Chat on WhatsApp')}</a>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
<div className="grid sm:grid-cols-2 gap-3">
                <input value={form.company} onChange={set('company')} placeholder={L('Nom de la société *', 'اسم الشركة *', 'Company name *')} className="input-dark w-full" />
                <input value={form.name} onChange={set('name')} placeholder={L('Votre nom et fonction *', 'اسمك ووظيفتك *', 'Your name and job title *')} className="input-dark w-full" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={form.email} onChange={set('email')} type="email" inputMode="email" placeholder={L('Email professionnel *', 'البريد المهني *', 'Work email *')} className="input-dark w-full" />
                  <input value={form.phone} onChange={set('phone')} inputMode="tel" placeholder={L('Téléphone (facultatif)', 'الهاتف (اختياري)', 'Phone (optional)')} className="input-dark w-full" />
                </div>
                <div>
                  <div className="text-white/45 text-xs font-body mb-1.5">{L('Dates de mission', 'تواريخ المهمّة', 'Mission dates')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2">
                      <span className="w-8 flex-shrink-0 text-white/40 text-xs font-body">{L('Du', 'من', 'From')}</span>
                      <input type="date" value={form.from} onChange={set('from')} min={new Date().toISOString().slice(0, 10)} aria-label={L('Début de mission', 'بداية المهمّة', 'Mission start')} className="input-dark w-full" />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="w-8 flex-shrink-0 text-white/40 text-xs font-body">{L('Au', 'إلى', 'To')}</span>
                      <input type="date" value={form.to} min={form.from || undefined} onChange={set('to')} aria-label={L('Fin de mission', 'نهاية المهمّة', 'Mission end')} className="input-dark w-full" />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_7.5rem] gap-3">
                  <select value={form.pack} onChange={set('pack')} className="input-dark w-full">
                    <option value="">{L('Pack souhaité', 'الباقة', 'Pack')}</option>
                    {PACKS.map((p) => <option key={p.key} value={p.name.fr}>{pick(p.name)}</option>)}
                  </select>
                  <input value={form.people} onChange={set('people')} inputMode="numeric" placeholder={L('Personnes', 'الأشخاص', 'People')} className="input-dark w-full" />
                </div>
                <textarea value={form.needs} onChange={set('needs')} rows={3} placeholder={L('Vos besoins (véhicules, logement, chauffeur…)', 'احتياجاتكم', 'Your needs (vehicles, housing, driver…)')} className="input-dark w-full resize-none" />
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
