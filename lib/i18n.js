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
    'common.details': 'Détails',
    'common.search': 'Rechercher...',
    'common.reset': 'Réinitialiser',
    'common.day': 'jour',
    'common.month': 'mois',
    'common.available': 'Disponible',
    'common.all': 'Tous',
    'common.whatsapp': 'WhatsApp',
    // Page Location
    'cars.badge': 'Notre flotte',
    'cars.title1': 'Tous nos',
    'cars.title2': 'véhicules',
    'cars.tags': 'Kilométrage illimité · Assurance incluse · Disponible 7j/7',
    'cars.search': 'Rechercher un véhicule...',
    'cars.none': 'Aucun véhicule ne correspond à vos critères.',
    'cars.help_title': 'Vous ne trouvez pas votre véhicule ?',
    'cars.help_desc': 'Contactez-nous, nous avons peut-être ce qu\'il vous faut.',
    // Page Vente auto
    'sale.badge': 'Occasions',
    'sale.title1': 'Véhicules',
    'sale.title2': 'à vendre',
    'sale.subtitle': 'Voitures d\'occasion vérifiées à Oran. Vous vendez ? Proposez votre véhicule via nous.',
    'sale.sell_title': 'Vous voulez vendre votre voiture ?',
    'sale.sell_desc': 'Confiez-nous la vente. Photos, annonce et contacts gérés pour vous.',
    'sale.sell_cta': 'Proposer mon véhicule',
    'sale.soon_title': 'Bientôt disponible',
    'sale.soon_desc': 'Nos premiers véhicules d\'occasion arrivent prochainement. Contactez-nous dès maintenant.',
    // Page Immobilier
    'immo.badge': 'Immobilier · Douba Groupe',
    'immo.title1': 'Location &',
    'immo.title2': 'vente',
    'immo.subtitle': 'Appartements, villas, locaux à Oran. Propriétaire ou locataire, tout passe par WhatsApp.',
    'immo.rent': 'À louer',
    'immo.sale': 'À vendre',
    'immo.owners_badge': 'Propriétaires',
    'immo.owners_title1': 'Vous avez un bien à',
    'immo.owners_title2': 'louer ou vendre ?',
    'immo.owners_desc': 'Confiez-nous votre bien. On s\'occupe de tout : mise en ligne, visibilité, contacts clients.',
    'immo.estimate_title': 'Estimez votre bien gratuitement',
    'immo.estimate_desc': 'Contactez-nous sur WhatsApp pour savoir combien vous pouvez louer ou vendre votre bien.',
    'immo.propose': 'Proposer mon bien',
    'immo.estimate': 'Estimation gratuite',
    // Page Commande
    'order.badge': 'Sur mesure · Importation',
    'order.title1': 'Commandez le véhicule',
    'order.title2': 'de vos rêves',
    'order.subtitle': 'Vous cherchez une voiture précise, en Algérie ou à l\'étranger ? On la trouve, on l\'achète et on l\'achemine jusqu\'à vous.',
    'order.how': 'Comment ça fonctionne',
    'order.send': 'Envoyer ma demande sur WhatsApp',
    'order.conditions': 'Conditions importantes',
    // Contact
    'contact.badge': 'Contactez-nous',
    'contact.title1': 'Parlons de votre',
    'contact.title2': 'projet',
    'contact.follow': 'Suivez-nous',
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
    'common.details': 'التفاصيل',
    'common.search': 'بحث...',
    'common.reset': 'إعادة',
    'common.day': 'يوم',
    'common.month': 'شهر',
    'common.available': 'متوفّر',
    'common.all': 'الكل',
    'common.whatsapp': 'واتساب',
    'cars.badge': 'أسطولنا',
    'cars.title1': 'كل',
    'cars.title2': 'سياراتنا',
    'cars.tags': 'كيلومتراج غير محدود · تأمين مشمول · متوفّر 7/7',
    'cars.search': 'ابحث عن سيارة...',
    'cars.none': 'لا توجد سيارة تطابق معاييرك.',
    'cars.help_title': 'لم تجد سيارتك؟',
    'cars.help_desc': 'تواصل معنا، قد نملك ما تبحث عنه.',
    'sale.badge': 'سيارات مستعملة',
    'sale.title1': 'سيارات',
    'sale.title2': 'للبيع',
    'sale.subtitle': 'سيارات مستعملة مفحوصة في وهران. تبيع سيارتك؟ اعرضها عبرنا.',
    'sale.sell_title': 'تريد بيع سيارتك؟',
    'sale.sell_desc': 'اعهد إلينا بالبيع. نتكفّل بالصور والإعلان والاتصالات.',
    'sale.sell_cta': 'اعرض سيارتي',
    'sale.soon_title': 'قريباً',
    'sale.soon_desc': 'أولى سياراتنا المستعملة قادمة قريباً. تواصل معنا الآن.',
    'immo.badge': 'العقارات · مجمع دوبا',
    'immo.title1': 'كراء و',
    'immo.title2': 'بيع',
    'immo.subtitle': 'شقق وفيلات ومحلات في وهران. مالك أو مكترٍ، كل شيء عبر واتساب.',
    'immo.rent': 'للكراء',
    'immo.sale': 'للبيع',
    'immo.owners_badge': 'الملّاك',
    'immo.owners_title1': 'لديك عقار',
    'immo.owners_title2': 'للكراء أو البيع؟',
    'immo.owners_desc': 'اعهد إلينا بعقارك. نتكفّل بكل شيء: النشر، الظهور، اتصالات الزبائن.',
    'immo.estimate_title': 'قيّم عقارك مجاناً',
    'immo.estimate_desc': 'تواصل معنا عبر واتساب لمعرفة قيمة كراء أو بيع عقارك.',
    'immo.propose': 'اعرض عقاري',
    'immo.estimate': 'تقييم مجاني',
    'order.badge': 'حسب الطلب · استيراد',
    'order.title1': 'اطلب السيارة',
    'order.title2': 'التي تحلم بها',
    'order.subtitle': 'تبحث عن سيارة معيّنة، في الجزائر أو الخارج؟ نجدها ونشتريها ونوصلها إليك.',
    'order.how': 'كيف يعمل',
    'order.send': 'أرسل طلبي عبر واتساب',
    'order.conditions': 'شروط مهمة',
    'contact.badge': 'اتصل بنا',
    'contact.title1': 'لنتحدث عن',
    'contact.title2': 'مشروعك',
    'contact.follow': 'تابعنا',
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
