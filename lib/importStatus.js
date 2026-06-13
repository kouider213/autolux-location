// Statuts du suivi d'importation véhicule — source unique (admin + page publique + emails).
import { ClipboardList, Search, Car, ShoppingCart, Ship, Landmark, PackageCheck, CheckCircle2, XCircle } from 'lucide-react';

// Ordre du parcours (CANCELLED est hors-parcours, géré à part)
export const IMPORT_STATUSES = [
  { key: 'REQUESTED', icon: ClipboardList, fr: 'Demande reçue',       ar: 'تم استلام الطلب',     en: 'Request received' },
  { key: 'SEARCHING', icon: Search,        fr: 'Recherche en cours',  ar: 'جاري البحث',          en: 'Searching' },
  { key: 'FOUND',     icon: Car,           fr: 'Véhicule trouvé',     ar: 'تم العثور على السيارة', en: 'Vehicle found' },
  { key: 'PURCHASED', icon: ShoppingCart,  fr: 'Acheté',              ar: 'تم الشراء',            en: 'Purchased' },
  { key: 'SHIPPING',  icon: Ship,          fr: 'En transport',        ar: 'في النقل',            en: 'In transit' },
  { key: 'CUSTOMS',   icon: Landmark,      fr: 'Dédouanement',        ar: 'التخليص الجمركي',     en: 'Customs clearance' },
  { key: 'READY',     icon: PackageCheck,  fr: 'Prêt à récupérer',    ar: 'جاهزة للاستلام',      en: 'Ready for pick-up' },
  { key: 'DELIVERED', icon: CheckCircle2,  fr: 'Livré',               ar: 'تم التسليم',          en: 'Delivered' },
];

export const CANCELLED = { key: 'CANCELLED', icon: XCircle, fr: 'Annulé', ar: 'ملغى', en: 'Cancelled' };

export const ALL_IMPORT_STATUSES = [...IMPORT_STATUSES, CANCELLED];

export const statusIndex = (key) => IMPORT_STATUSES.findIndex(s => s.key === key);

export const statusLabel = (key, lang = 'fr') => {
  const s = ALL_IMPORT_STATUSES.find(x => x.key === key) || IMPORT_STATUSES[0];
  return s[lang] || s.fr;
};

// Sous-titre client par statut (rassurant, 3 langues)
export const STATUS_HINT = {
  REQUESTED: { fr: "Votre demande est enregistrée. Notre équipe l'étudie et vous recontacte.", ar: 'تم تسجيل طلبك. فريقنا يدرسه وسيتواصل معك.', en: 'Your request is registered. Our team is reviewing it.' },
  SEARCHING: { fr: 'Nous recherchons le véhicule correspondant à votre demande.', ar: 'نبحث عن السيارة المطابقة لطلبك.', en: 'We are searching for the matching vehicle.' },
  FOUND:     { fr: 'Un véhicule a été trouvé — voir photos et infos ci-dessous.', ar: 'تم العثور على سيارة — انظر الصور والمعلومات أدناه.', en: 'A vehicle was found — see photos and info below.' },
  PURCHASED: { fr: 'Le véhicule a été acheté. Préparation au transport.', ar: 'تم شراء السيارة. التحضير للنقل.', en: 'The vehicle has been purchased. Preparing for transit.' },
  SHIPPING:  { fr: 'Le véhicule est en cours de transport vers l’Algérie.', ar: 'السيارة في طريقها إلى الجزائر.', en: 'The vehicle is in transit to Algeria.' },
  CUSTOMS:   { fr: 'Dédouanement en cours au port. Plus que quelques étapes.', ar: 'التخليص الجمركي جارٍ في الميناء.', en: 'Customs clearance in progress at the port.' },
  READY:     { fr: 'Votre véhicule est prêt ! Nous vous contactons pour la remise.', ar: 'سيارتك جاهزة! سنتواصل معك للتسليم.', en: 'Your vehicle is ready! We will contact you for handover.' },
  DELIVERED: { fr: 'Véhicule livré. Merci de votre confiance 🙏', ar: 'تم تسليم السيارة. شكراً لثقتك 🙏', en: 'Vehicle delivered. Thank you for your trust 🙏' },
  CANCELLED: { fr: 'Cette commande a été annulée. Contactez-nous pour toute question.', ar: 'تم إلغاء هذا الطلب. تواصل معنا لأي استفسار.', en: 'This order was cancelled. Contact us with any question.' },
};
