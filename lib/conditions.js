import { supabase } from './supabase';

export const SECTIONS = [
  { key: 'intro',  fr: 'Intro WhatsApp',          ar: 'مقدمة واتساب' },
  { key: 'rental', fr: 'Location de voiture',      ar: 'كراء السيارات' },
  { key: 'sale',   fr: 'Vente de véhicules',       ar: 'بيع السيارات' },
  { key: 'immo',   fr: 'Immobilier (location & vente)', ar: 'العقارات' },
  { key: 'packs',  fr: 'Packs séjour (tout-en-un)', ar: 'باقات الإقامة' },
  { key: 'owner',  fr: 'Propriétaires & vendeurs', ar: 'الملّاك والبائعون' },
];

// Conditions par défaut (utilisées tant que l'admin n'a rien enregistré)
export const DEFAULT_CONDITIONS = {
  intro: [
    { text_fr: "Tout passe par WhatsApp. Que vous souhaitiez louer, acheter, ou mettre votre voiture, votre bien ou autre sur notre site — vous nous contactez, puis c'est nous qui nous occupons de la mise en ligne, des photos, de l'annonce et de la mise en relation. Aucune création de compte requise.", text_ar: "كل شيء يمرّ عبر واتساب. سواء أردت الكراء أو الشراء أو عرض سيارتك أو عقارك — تتواصل معنا، ثم نتكفّل نحن بالنشر والصور والإعلان والربط. بدون إنشاء حساب." },
  ],
  rental: [
    { text_fr: "Âge minimum : 35 ans (exigence de nos assurances).", text_ar: "السن الأدنى: 35 سنة (شرط تأميناتنا)." },
    { text_fr: "Aucune caution exigée — zéro dépôt de garantie.", text_ar: "بدون كفالة — لا وديعة ضمان." },
    { text_fr: "Acompte de 3 jours de location pour confirmer, déduit du total.", text_ar: "تسبيق 3 أيام كراء للتأكيد، يُخصم من المجموع." },
    { text_fr: "Passeport + permis valides ; le passeport est conservé durant la location.", text_ar: "جواز سفر + رخصة صالحة؛ يُحفظ الجواز خلال الكراء." },
    { text_fr: "Kilométrage illimité, assurance incluse, circulation dans toute l'Algérie.", text_ar: "كيلومتراج غير محدود، تأمين مشمول، التنقّل في كل الجزائر." },
  ],
  sale: [
    { text_fr: "Les véhicules à vendre sont publiés après vérification des informations fournies.", text_ar: "تُنشر السيارات للبيع بعد التحقق من المعلومات المقدّمة." },
    { text_fr: "Le prix, l'état et les documents sont confirmés avec le vendeur avant publication.", text_ar: "يُؤكَّد السعر والحالة والوثائق مع البائع قبل النشر." },
    { text_fr: "L'achat se conclut entre les parties ; nous facilitons la mise en relation.", text_ar: "تتمّ عملية الشراء بين الطرفين؛ نحن نسهّل الربط." },
    { text_fr: "Un acompte peut être demandé pour réserver un véhicule, selon accord.", text_ar: "قد يُطلب تسبيق لحجز سيارة، حسب الاتفاق." },
  ],
  immo: [
    { text_fr: "Les biens (location ou vente) sont publiés après accord avec le propriétaire.", text_ar: "تُنشر العقارات (كراء أو بيع) بعد الاتفاق مع المالك." },
    { text_fr: "Caution, charges, durée et conditions sont indiquées sur chaque annonce.", text_ar: "الكفالة والأعباء والمدة والشروط مذكورة في كل إعلان." },
    { text_fr: "Pour la location longue durée, un contrat écrit est établi entre les parties.", text_ar: "للكراء طويل المدى، يُحرَّر عقد كتابي بين الطرفين." },
    { text_fr: "Pour la vente, les démarches et frais éventuels sont précisés avant tout engagement.", text_ar: "للبيع، تُحدَّد الإجراءات والمصاريف قبل أي التزام." },
  ],
  packs: [
    { text_fr: "Un pack combine plusieurs services en une seule offre (voiture, logement, jet ski, et/ou chauffeur selon le pack).", text_ar: "تجمع الباقة عدّة خدمات في عرض واحد (سيارة، سكن، جت سكي، و/أو سائق حسب الباقة)." },
    { text_fr: "Réserver un pack rend indisponibles le véhicule et le bien concernés pendant toute la durée du pack.", text_ar: "حجز باقة يجعل السيارة والعقار المعنيّين غير متوفّرين طوال مدّة الباقة." },
    { text_fr: "Les conditions de la location de voiture s'appliquent au véhicule du pack (âge min. 35 ans, passeport + permis, acompte).", text_ar: "تنطبق شروط كراء السيارة على سيارة الباقة (السن الأدنى 35 سنة، جواز + رخصة، تسبيق)." },
    { text_fr: "La disponibilité et le tarif final du pack sont confirmés par notre équipe sur WhatsApp.", text_ar: "يُؤكَّد توفّر الباقة وسعرها النهائي من طرف فريقنا عبر واتساب." },
    { text_fr: "Le pack groupe/entreprise (villa + voiture avec chauffeur) se fait sur devis personnalisé.", text_ar: "باقة المجموعات/الشركات (فيلا + سيارة بسائق) تتمّ حسب عرض سعر مخصّص." },
  ],
  owner: [
    { text_fr: "Pour mettre votre voiture ou votre bien en ligne, contactez-nous sur WhatsApp.", text_ar: "لعرض سيارتك أو عقارك، تواصل معنا عبر واتساب." },
    { text_fr: "Nous nous occupons de la mise en ligne, des photos et de la mise en avant.", text_ar: "نتكفّل بالنشر والصور والإبراز." },
    { text_fr: "Vous pouvez demander une estimation gratuite avant publication.", text_ar: "يمكنك طلب تقييم مجاني قبل النشر." },
    { text_fr: "Les conditions finales (commission, mise en avant, gestion) sont confirmées par écrit.", text_ar: "تُؤكَّد الشروط النهائية (العمولة، الإبراز، التسيير) كتابياً." },
  ],
};

// Retourne { intro:[...], rental:[...], ... }. Defaults si vide.
export async function getConditions() {
  try {
    if (!supabase) return DEFAULT_CONDITIONS;
    const { data } = await supabase.from('site_conditions').select('*').order('position');
    if (!data || data.length === 0) return DEFAULT_CONDITIONS;
    const grouped = {};
    for (const row of data) {
      (grouped[row.section] = grouped[row.section] || []).push({ text_fr: row.text_fr, text_ar: row.text_ar });
    }
    // Fallback par section si absente en base
    for (const k of Object.keys(DEFAULT_CONDITIONS)) {
      if (!grouped[k] || grouped[k].length === 0) grouped[k] = DEFAULT_CONDITIONS[k];
    }
    return grouped;
  } catch {
    return DEFAULT_CONDITIONS;
  }
}
