import { supabase } from './supabase';

// FAQ par défaut — utilisée tant que l'admin n'a rien ajouté
export const DEFAULT_FAQ = [
  {
    question_fr: 'Faut-il une caution pour louer une voiture ?',
    question_ar: 'هل تتطلب كراء سيارة كفالة؟',
    answer_fr: "Non, aucune caution n'est bloquée sur votre compte. Un acompte de 3 jours suffit pour bloquer le véhicule.",
    answer_ar: 'لا، لا تُحجز أي كفالة على حسابك. تسبقة 3 أيام تكفي لحجز السيارة.',
  },
  {
    question_fr: 'Le kilométrage est-il illimité ?',
    question_ar: 'هل المسافة غير محدودة؟',
    answer_fr: "Oui, le kilométrage est illimité sur toute l'Algérie. Assurance et climatisation incluses.",
    answer_ar: 'نعم، المسافة غير محدودة في كامل الجزائر. التأمين والتكييف مشمولان.',
  },
  {
    question_fr: 'Comment réserver ?',
    question_ar: 'كيف أحجز؟',
    answer_fr: 'Tout passe par WhatsApp. Choisissez votre véhicule/bien, envoyez-nous un message, on confirme en moins d\'1 heure.',
    answer_ar: 'كل شيء يتم عبر واتساب. اختر سيارتك/عقارك، أرسل لنا رسالة، نؤكّد في أقل من ساعة.',
  },
  {
    question_fr: 'Livrez-vous le véhicule ?',
    question_ar: 'هل توصلون السيارة؟',
    answer_fr: "La livraison est offerte à l'aéroport d'Oran. Vous pouvez aussi récupérer le véhicule au magasin.",
    answer_ar: 'التوصيل مجاني في مطار وهران. يمكنك أيضاً استلام السيارة من المحل.',
  },
];

// Récupère la FAQ depuis la DB ; fallback sur les valeurs par défaut.
export async function getFaq() {
  try {
    if (!supabase) return DEFAULT_FAQ;
    const { data } = await supabase.from('site_faq').select('*').order('position', { ascending: true });
    return (data && data.length) ? data : DEFAULT_FAQ;
  } catch {
    return DEFAULT_FAQ;
  }
}
