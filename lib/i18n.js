import { createContext, useContext, useState, useEffect } from 'react';

// ── Dictionnaire FR / AR ──────────────────────────────────────────
const DICT = {
  fr: {
    // Nav
    'nav.home': 'Accueil',
    'nav.rental': 'Location',
    'nav.sale': 'Vente auto',
    'nav.order': 'Commande',
    'nav.immo': 'Immobilier',
    'nav.reviews': 'Avis',
    'nav.contact': 'Contact',
    'nav.book': 'Réserver',
    'nav.book_now': 'Réserver maintenant',
    // Hero
    'hero.line1': 'La Route,',
    'hero.line2': 'Votre Style',
    'hero.subtitle': 'Location de véhicules premium à Oran.',
    'hero.tags': 'Sans caution · Réservation rapide · 7j/7',
    'hero.fleet': 'La flotte',
    'hero.scroll': 'Défiler',
    // 3 pôles
    'poles.badge': 'Nos services',
    'poles.title1': 'Trois pôles,',
    'poles.title2': 'une confiance',
    'poles.subtitle': 'Tout ce dont vous avez besoin à Oran — voiture, logement, achat. Sans caution sur la location, sans création de compte.',
    'poles.rental.title': 'Location de voiture',
    'poles.rental.desc': 'Citadines, SUV, utilitaires, premium. Kilométrage illimité, assurance incluse, sans caution.',
    'poles.rental.cta': 'Voir la flotte',
    'poles.immo.title': 'Immobilier',
    'poles.immo.desc': 'Appartements, villas et locaux à louer ou à vendre à Oran. Propriétaire ? Confiez-nous votre bien.',
    'poles.immo.cta': 'Voir les biens',
    'poles.sale.title': 'Véhicules à vendre',
    'poles.sale.desc': "Voitures d'occasion vérifiées. Vous vendez ? On gère l'annonce, les photos et les contacts.",
    'poles.sale.cta': 'Voir les occasions',
    // Footer
    'footer.tagline': 'Agence de location de véhicules premium à Oran, Algérie. Sans caution. 7j/7.',
    'footer.nav': 'Navigation',
    'footer.info': 'Informations',
    'footer.contact': 'Contact',
    'footer.rights': 'Tous droits réservés',
    // Common
    'common.book': 'Réserver',
    'common.contact_wa': 'Nous contacter sur WhatsApp',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.rental': 'كراء السيارات',
    'nav.sale': 'بيع السيارات',
    'nav.order': 'طلب خاص',
    'nav.immo': 'العقارات',
    'nav.reviews': 'الآراء',
    'nav.contact': 'اتصل بنا',
    'nav.book': 'احجز',
    'nav.book_now': 'احجز الآن',
    'hero.line1': 'الطريق،',
    'hero.line2': 'أسلوبك',
    'hero.subtitle': 'كراء سيارات فاخرة في وهران.',
    'hero.tags': 'بدون كفالة · حجز سريع · 7/7',
    'hero.fleet': 'الأسطول',
    'hero.scroll': 'مرّر',
    'poles.badge': 'خدماتنا',
    'poles.title1': 'ثلاثة أقسام،',
    'poles.title2': 'ثقة واحدة',
    'poles.subtitle': 'كل ما تحتاجه في وهران — سيارة، سكن، شراء. بدون كفالة على الكراء، وبدون إنشاء حساب.',
    'poles.rental.title': 'كراء السيارات',
    'poles.rental.desc': 'سيارات المدينة، دفع رباعي، نفعية، فاخرة. كيلومتراج غير محدود، تأمين مشمول، بدون كفالة.',
    'poles.rental.cta': 'شاهد الأسطول',
    'poles.immo.title': 'العقارات',
    'poles.immo.desc': 'شقق وفيلات ومحلات للكراء أو البيع في وهران. مالك؟ اعهد إلينا بعقارك.',
    'poles.immo.cta': 'شاهد العقارات',
    'poles.sale.title': 'سيارات للبيع',
    'poles.sale.desc': 'سيارات مستعملة مفحوصة. تبيع سيارتك؟ نتكفل بالإعلان والصور والاتصالات.',
    'poles.sale.cta': 'شاهد العروض',
    'footer.tagline': 'وكالة كراء سيارات فاخرة في وهران، الجزائر. بدون كفالة. 7/7.',
    'footer.nav': 'التصفح',
    'footer.info': 'معلومات',
    'footer.contact': 'اتصل بنا',
    'footer.rights': 'جميع الحقوق محفوظة',
    'common.book': 'احجز',
    'common.contact_wa': 'تواصل معنا عبر واتساب',
  },
};

function applyDir(l) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
}

const LangCtx = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('fr');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    if (saved === 'ar' || saved === 'fr') { setLangState(saved); applyDir(saved); }
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
    applyDir(l);
  };

  // t() : retourne la traduction, fallback FR puis la clé — ne casse jamais
  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.fr[key] || key;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
