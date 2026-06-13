// Statuts du suivi de dossier (achat/vente véhicule + immobilier) — source unique.
import { ClipboardList, CalendarCheck, FileText, Wallet, PackageCheck, CheckCircle2, KeyRound, FileSignature, XCircle, Search, Package, PartyPopper } from 'lucide-react';

// Parcours par type de dossier
export const DOSSIER_FLOWS = {
  voiture: [
    { key: 'REQUESTED', icon: ClipboardList, fr: 'Demande reçue',      ar: 'تم استلام الطلب',   en: 'Request received' },
    { key: 'RESERVED',  icon: CalendarCheck, fr: 'Véhicule réservé',   ar: 'تم حجز السيارة',    en: 'Vehicle reserved' },
    { key: 'DOCUMENTS', icon: FileText,      fr: 'Dossier & documents', ar: 'الملف والوثائق',    en: 'Documents' },
    { key: 'PAYMENT',   icon: Wallet,        fr: 'Paiement',           ar: 'الدفع',             en: 'Payment' },
    { key: 'READY',     icon: PackageCheck,  fr: 'Prêt à récupérer',   ar: 'جاهزة للاستلام',    en: 'Ready for pick-up' },
    { key: 'DELIVERED', icon: CheckCircle2,  fr: 'Livré',              ar: 'تم التسليم',        en: 'Delivered' },
  ],
  immo: [
    { key: 'REQUESTED', icon: ClipboardList, fr: 'Demande reçue',      ar: 'تم استلام الطلب',   en: 'Request received' },
    { key: 'VISIT',     icon: Search,        fr: 'Visite programmée',  ar: 'تمت برمجة الزيارة', en: 'Visit scheduled' },
    { key: 'REVIEW',    icon: FileText,      fr: 'Dossier en cours',   ar: 'الملف قيد الدراسة', en: 'Under review' },
    { key: 'CONTRACT',  icon: FileSignature,     fr: 'Contrat',            ar: 'العقد',             en: 'Contract' },
    { key: 'FINALIZED', icon: KeyRound,      fr: 'Finalisé',           ar: 'تم الإنهاء',        en: 'Finalized' },
  ],
  pack: [
    { key: 'REQUESTED', icon: ClipboardList, fr: 'Demande reçue',      ar: 'تم استلام الطلب',   en: 'Request received' },
    { key: 'CONFIRMED', icon: CalendarCheck, fr: 'Pack confirmé',      ar: 'تم تأكيد الباقة',   en: 'Pack confirmed' },
    { key: 'DEPOSIT',   icon: Wallet,        fr: 'Acompte versé',      ar: 'تم دفع العربون',    en: 'Deposit paid' },
    { key: 'PREPARED',  icon: PackageCheck,  fr: 'Séjour préparé',     ar: 'تم تحضير الإقامة',  en: 'Stay prepared' },
    { key: 'ONGOING',   icon: PartyPopper,   fr: 'Séjour en cours',    ar: 'الإقامة جارية',     en: 'Stay ongoing' },
    { key: 'COMPLETED', icon: CheckCircle2,  fr: 'Terminé',            ar: 'منتهي',             en: 'Completed' },
  ],
};

export const CANCELLED = { key: 'CANCELLED', icon: XCircle, fr: 'Annulé', ar: 'ملغى', en: 'Cancelled' };

export const KIND_LABEL = {
  voiture: { fr: 'Achat véhicule', ar: 'اقتناء سيارة', en: 'Vehicle purchase' },
  immo:    { fr: 'Immobilier', ar: 'عقار', en: 'Real estate' },
  pack:    { fr: 'Pack séjour', ar: 'باقة إقامة', en: 'Stay package' },
};

export const flowFor = (kind) => DOSSIER_FLOWS[kind] || DOSSIER_FLOWS.voiture;
export const allStatusesFor = (kind) => [...flowFor(kind), CANCELLED];
export const statusIndex = (kind, key) => flowFor(kind).findIndex(s => s.key === key);

export const dossierStatusLabel = (kind, key, lang = 'fr') => {
  const s = allStatusesFor(kind).find(x => x.key === key) || flowFor(kind)[0];
  return s[lang] || s.fr;
};

// Sous-titre rassurant par statut
export const DOSSIER_HINT = {
  REQUESTED: { fr: "Votre demande est enregistrée. Notre équipe revient vers vous rapidement.", ar: 'تم تسجيل طلبك. سيتواصل معك فريقنا قريباً.', en: 'Your request is registered. Our team will get back to you soon.' },
  RESERVED:  { fr: 'Le véhicule est réservé pour vous.', ar: 'تم حجز السيارة لك.', en: 'The vehicle is reserved for you.' },
  DOCUMENTS: { fr: 'Préparation du dossier et des documents.', ar: 'تحضير الملف والوثائق.', en: 'Preparing the file and documents.' },
  PAYMENT:   { fr: 'Étape de paiement en cours.', ar: 'مرحلة الدفع جارية.', en: 'Payment step in progress.' },
  READY:     { fr: 'Tout est prêt — nous vous contactons pour la remise.', ar: 'كل شيء جاهز — سنتواصل معك للتسليم.', en: 'Everything is ready — we will contact you for handover.' },
  DELIVERED: { fr: 'Dossier finalisé. Merci de votre confiance 🙏', ar: 'تم إنهاء الملف. شكراً لثقتك 🙏', en: 'File completed. Thank you for your trust 🙏' },
  VISIT:     { fr: 'Une visite du bien est programmée.', ar: 'تمت برمجة زيارة للعقار.', en: 'A visit of the property is scheduled.' },
  REVIEW:    { fr: 'Votre dossier est en cours d’étude.', ar: 'ملفك قيد الدراسة.', en: 'Your file is being reviewed.' },
  CONTRACT:  { fr: 'Préparation / signature du contrat.', ar: 'تحضير / توقيع العقد.', en: 'Preparing / signing the contract.' },
  FINALIZED: { fr: 'Dossier finalisé. Félicitations et merci 🙏', ar: 'تم إنهاء الملف. مبروك وشكراً 🙏', en: 'File finalized. Congratulations and thank you 🙏' },
  CONFIRMED: { fr: 'Votre pack séjour est confirmé.', ar: 'تم تأكيد باقة إقامتك.', en: 'Your stay package is confirmed.' },
  DEPOSIT:   { fr: 'Acompte reçu, réservation sécurisée.', ar: 'تم استلام العربون، الحجز مؤكَّد.', en: 'Deposit received, booking secured.' },
  PREPARED:  { fr: 'Votre séjour est prêt (véhicule, logement…).', ar: 'تم تحضير إقامتك (سيارة، سكن…).', en: 'Your stay is ready (vehicle, accommodation…).' },
  ONGOING:   { fr: 'Votre séjour est en cours. Profitez bien !', ar: 'إقامتك جارية. استمتع!', en: 'Your stay is ongoing. Enjoy!' },
  COMPLETED: { fr: 'Séjour terminé. Merci de votre confiance 🙏', ar: 'انتهت الإقامة. شكراً لثقتك 🙏', en: 'Stay completed. Thank you for your trust 🙏' },
  CANCELLED: { fr: 'Ce dossier a été annulé. Contactez-nous pour toute question.', ar: 'تم إلغاء هذا الملف. تواصل معنا لأي استفسار.', en: 'This file was cancelled. Contact us with any question.' },
};
