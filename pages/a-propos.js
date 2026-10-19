import LegalPage from '../components/LegalPage';
import LegalBody from '../components/LegalBody';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Heart, ShieldCheck, BadgeCheck, Gauge, Clock, Car, Tag, Building2, Ship, Package, Sparkles, ArrowRight, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSettings, waNumber, siteEmails, DEFAULT_SETTINGS, phoneInfo } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { getLegal } from '../lib/legal';

export default function AProposPage() {
  const s = useSettings();
  const wa = waNumber(s);
  const { lang } = useLang();
  const [ov, setOv] = useState(null);
  useEffect(() => { getLegal('a-propos').then(setOv); }, []);

  const ctaLabel = useTranslated('Discutons de votre projet');

  if (ov && ov.body_fr && ov.body_fr.trim()) {
    const oTitle = (lang === 'ar' ? ov.title_ar : lang === 'en' ? ov.title_en : ov.title_fr) || ov.title_fr || 'Qui sommes-nous';
    return <LegalPage title={oTitle}><LegalBody bodyFr={ov.body_fr} bodyLang={ov['body_' + lang]} /></LegalPage>;
  }

  const L = (fr, ar, en) => (lang === 'ar' ? ar : lang === 'en' ? en : fr);
  const rtl = lang === 'ar';
  const emails = siteEmails(s);
  const address = s.address || DEFAULT_SETTINGS.address;

  const PROOFS = [
    { icon: ShieldCheck, h: L('Sans caution', 'بدون ضمان', 'No deposit'), p: L('Aucune somme bloquée', 'لا مبلغ محجوز', 'Nothing held on your card') },
    { icon: BadgeCheck, h: L('Tous risques', 'تأمين شامل', 'Fully insured'), p: L('Assurance incluse', 'التأمين مشمول', 'Insurance included') },
    { icon: Gauge, h: L('Km illimité', 'كيلومترات غير محدودة', 'Unlimited km'), p: L('Partout en Algérie', 'في كل الجزائر', 'All over Algeria') },
    { icon: Clock, h: '7j/7', p: L('Une équipe qui répond', 'فريق يردّ عليك', 'A team that answers') },
  ];
  const SERVICES = [
    { icon: Car, href: '/cars', h: L('Location de voiture', 'كراء السيارات', 'Car rental'), p: L('Assurance tous risques, kilométrage illimité, livraison possible.', 'تأمين شامل، كيلومترات غير محدودة، توصيل ممكن.', 'Fully insured, unlimited mileage, delivery available.'), big: true },
    { icon: Tag, href: '/vente-voitures', h: L('Vente de véhicules', 'بيع السيارات', 'Car sales'), p: L('Voitures vérifiées, prix et papiers confirmés.', 'سيارات مفحوصة، السعر والوثائق مؤكدة.', 'Checked cars, price and papers confirmed.') },
    { icon: Building2, href: '/immo', h: L('Immobilier', 'العقار', 'Real estate'), p: L('Location et vente à Oran, de A à Z.', 'كراء وبيع في وهران من الألف إلى الياء.', 'Rent and sale in Oran, A to Z.') },
    { icon: Ship, href: '/importation-voiture-algerie', h: L('Importation', 'الاستيراد', 'Import'), p: L('On trouve, achète et importe votre voiture.', 'نبحث، نشتري ونستورد سيارتك.', 'We find, buy and import your car.') },
    { icon: Package, href: '/packs', h: L('Packs séjour', 'باقات الإقامة', 'Stay packs'), p: L('Voiture + logement (+ jet ski, chauffeur).', 'سيارة + سكن (+ جت سكي، سائق).', 'Car + housing (+ jet ski, driver).') },
    { icon: Sparkles, href: '/contact', h: L('Sur mesure', 'حسب الطلب', 'Made to measure'), p: L('Une demande particulière ? On organise tout.', 'طلب خاص؟ ننظّم كل شيء.', 'A special request? We organise it all.') , wide: true },
  ];
  const VALUES = [
    { h: L('Transparence', 'الشفافية', 'Transparency'), p: L('Prix clairs, conditions écrites, état des lieux photographié avant et après chaque location.', 'أسعار واضحة، شروط مكتوبة، معاينة مصوّرة قبل وبعد كل كراء.', 'Clear prices, written terms, photographed check-in and check-out.') },
    { h: L('Confiance', 'الثقة', 'Trust'), p: L('Assurance tous risques sur nos véhicules de location, aucune caution exigée.', 'تأمين شامل على سياراتنا، بدون ضمان.', 'Comprehensive insurance on our rentals, no deposit required.') },
    { h: L('Proximité', 'القرب', 'Proximity'), p: L('Une équipe joignable, qui répond, et qui connaît le terrain à Oran.', 'فريق متاح، يردّ ويعرف وهران جيداً.', 'A reachable team that answers and knows Oran inside out.') },
    { h: L('Suivi', 'المتابعة', 'Follow-up'), p: L('Chaque réservation a sa page de suivi en temps réel : paiement, contrat, état des lieux.', 'لكل حجز صفحة متابعة مباشرة: الدفع، العقد، المعاينة.', 'Every booking has a live tracking page: payment, contract, inspection.') },
  ];

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#080808] text-white">
      <Head>
        <title>{L('Qui sommes-nous — Fik Conciergerie Oran', 'من نحن — فيك كونسيرجري وهران', 'About us — Fik Conciergerie Oran')}</title>
        <meta name="description" content={L("Fik Conciergerie, conciergerie à Oran : location de voiture sans caution, vente de véhicules, immobilier, importation et packs séjour. Une équipe joignable 7j/7.", 'فيك كونسيرجري في وهران: كراء سيارات بدون ضمان، بيع سيارات، عقار، استيراد وباقات إقامة.', 'Fik Conciergerie in Oran: no-deposit car rental, car sales, real estate, import and stay packs. A team available 7/7.')} />
      </Head>
      <Navbar />
      <main className="overflow-x-clip">
        {/* Héros : texte + carte preuves (côte à côte sur PC) */}
        <section className="relative max-w-7xl mx-auto px-5 md:px-10 pt-28 lg:pt-36 pb-14 lg:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="section-badge mb-6">{L('Qui sommes-nous', 'من نحن', 'About us')}</div>
            <h1 className="font-display text-[2.5rem] leading-[1.05] md:text-6xl lg:text-7xl font-black">
              {L('Votre partenaire ', 'شريككم ', 'Your trusted ')}<span className="text-gold-gradient">{L('de confiance', 'الموثوق', 'partner')}</span>{L(' à Oran', ' في وهران', ' in Oran')}
            </h1>
            <p className="mt-6 text-white/65 text-base md:text-lg leading-relaxed max-w-2xl">
              {L("Fik Conciergerie est une conciergerie basée à Oran : location de véhicules, vente de voitures, immobilier et packs séjour tout-en-un. Notre mission : vous simplifier la vie, que vous soyez résident, de passage ou de la diaspora de retour au pays.",
                 'فيك كونسيرجري خدمة كونسيرج في وهران: كراء السيارات، بيعها، العقار وباقات الإقامة. مهمّتنا: تسهيل حياتكم، سواء كنتم مقيمين، زوّاراً أو من الجالية العائدة إلى الوطن.',
                 'Fik Conciergerie is a concierge service based in Oran: car rental, car sales, real estate and all-in-one stay packs. Our mission: make life simple, whether you live here, are passing through, or are from the diaspora coming home.')}
            </p>
            <p className="mt-4 text-white/45 text-sm md:text-base leading-relaxed max-w-2xl">
              {L('Tout se fait simplement, par WhatsApp : vous nous écrivez, on s’occupe du reste. Aucun compte à créer.', 'كل شيء ببساطة عبر واتساب: تراسلوننا ونتكفّل بالباقي. بدون إنشاء حساب.', 'Everything is simple, over WhatsApp: you write, we handle the rest. No account needed.')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="btn-gold py-3.5 px-8 text-sm justify-center"><Heart size={15} />{ctaLabel}</Link>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3.5 px-7 text-sm justify-center"><MessageCircle size={15} />WhatsApp</a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="gold-frame rounded-[28px] p-5 md:p-7 grid grid-cols-2 gap-3 md:gap-4">
              {PROOFS.map((x) => { const Icon = x.icon; return (
                <div key={x.h} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 md:p-5">
                  <Icon size={22} className="text-gold-400 mb-3" />
                  <div className="font-display text-lg md:text-xl font-bold">{x.h}</div>
                  <div className="text-white/45 text-xs md:text-sm mt-1">{x.p}</div>
                </div>
              ); })}
            </div>
          </div>
        </section>

        {/* Services en bento */}
        <section className="px-5 md:px-10 py-14 lg:py-20 bg-[#0b0b0b] border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 lg:mb-14">
              <div className="section-badge mb-4">{L('Nos services', 'خدماتنا', 'Our services')}</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold">{L('Tout, au même ', 'كل شيء في ', 'Everything in ')}<span className="text-gold-gradient">{L('endroit', 'مكان واحد', 'one place')}</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {SERVICES.map((x) => { const Icon = x.icon; return (
                <Link key={x.href} href={x.href} className={`lux-card p-6 lg:p-7 flex flex-col group ${x.big ? 'sm:col-span-2 gold-frame' : ''} ${x.wide ? 'sm:col-span-2' : ''}`}>
                  <span className={`rounded-2xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400 mb-5 ${x.big ? 'w-16 h-16' : 'w-12 h-12'}`}><Icon size={x.big ? 28 : 20} /></span>
                  <span className={`font-display font-bold mb-2 ${x.big ? 'text-2xl lg:text-4xl' : 'text-lg lg:text-xl'}`}>{x.h}</span>
                  <span className={`text-white/50 leading-relaxed ${x.big ? 'text-sm lg:text-base max-w-md' : 'text-sm'}`}>{x.p}</span>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-gold-400 text-sm font-semibold">{L('Découvrir', 'اكتشف', 'Discover')} <ArrowRight size={14} className={`transition-transform ${rtl ? 'rotate-180' : 'group-hover:translate-x-1'}`} /></span>
                </Link>
              ); })}
            </div>
          </div>
        </section>

        {/* Engagements : titre collant à gauche sur PC */}
        <section className="px-5 md:px-10 py-16 lg:py-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 text-center lg:text-start">
            <div className="lg:sticky lg:top-28">
              <div className="section-badge mb-4">{L('Notre engagement', 'التزامنا', 'Our commitment')}</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">{L('Ce que vous ', 'ما يمكنكم ', 'What you can ')}<span className="text-gold-gradient">{L('pouvez attendre', 'انتظاره منّا', 'count on')}</span></h2>
            </div>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4 lg:gap-5">
            {VALUES.map((v, i) => (
              <div key={v.h} className="lux-card p-6 lg:p-8">
                <div className="num-outline font-display text-5xl lg:text-6xl font-black leading-none mb-4">0{i + 1}</div>
                <div className="font-display text-xl lg:text-2xl font-bold mb-2">{v.h}</div>
                <p className="text-white/55 text-sm lg:text-base leading-relaxed">{v.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="px-5 md:px-10 pb-24 max-w-7xl mx-auto">
          <div className="gold-frame rounded-3xl p-7 md:p-10 lg:p-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 text-center lg:text-start">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{L('Parlons de ', 'لنتحدث عن ', "Let's talk about ")}<span className="text-gold-gradient">{L('votre projet', 'مشروعكم', 'your project')}</span></h2>
              <p className="text-white/50">{L('Une question, une demande ? On vous répond vite.', 'سؤال أو طلب؟ نردّ عليكم بسرعة.', 'A question or a request? We answer fast.')}</p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl p-4 flex items-start gap-3 sm:col-span-2 hover:border-gold-500/40 transition-colors">
                <MapPin size={18} className="text-gold-400 mt-0.5 flex-shrink-0" /><span className="text-sm text-white/80">{address}</span>
              </a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors">
                <MessageCircle size={18} className="text-gold-400 flex-shrink-0" /><span className="text-sm text-white/80" dir="ltr">+{wa}</span>
              </a>
              {phoneInfo(s) && (
                <a href={`tel:${phoneInfo(s).tel}`} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors">
                  <Phone size={18} className="text-gold-400 flex-shrink-0" /><span className="text-sm text-white/80" dir="ltr">{phoneInfo(s).display} 🇩🇿</span>
                </a>
              )}
              {emails.map((e) => (
                <a key={e} href={`mailto:${e}`} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-gold-500/40 transition-colors min-w-0">
                  <Mail size={18} className="text-gold-400 flex-shrink-0" /><span className="text-sm text-white/80 truncate">{e}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
