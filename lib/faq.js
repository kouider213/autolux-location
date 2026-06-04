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

  // ── IMMOBILIER (location & vente) ──
  {
    question_fr: 'Proposez-vous des biens immobiliers à louer et à vendre ?',
    question_ar: 'هل تقترحون عقارات للكراء والبيع؟',
    answer_fr: "Oui. Appartements, villas, locaux et terrains à Oran, en location ou à la vente. Chaque annonce a des photos, parfois une vidéo, et l'emplacement sur carte.",
    answer_ar: 'نعم. شقق، فيلات، محلات وأراضي في وهران، للكراء أو للبيع. كل إعلان يحتوي على صور، أحياناً فيديو، والموقع على الخريطة.',
  },
  {
    question_fr: 'Comment visiter ou acheter un bien immobilier ?',
    question_ar: 'كيف أعاين أو أشتري عقاراً؟',
    answer_fr: "Contactez-nous sur WhatsApp avec le bien qui vous intéresse. On organise la visite, la négociation et on vous accompagne pour les papiers en toute sécurité.",
    answer_ar: 'تواصلوا معنا عبر واتساب بخصوص العقار الذي يهمكم. ننظّم المعاينة والتفاوض ونرافقكم في الأوراق بكل أمان.',
  },
  {
    question_fr: "Je vis à l'étranger, puis-je investir ou gérer un bien à distance ?",
    question_ar: 'أعيش في الخارج، هل يمكنني الاستثمار أو إدارة عقار عن بُعد؟',
    answer_fr: "Oui, c'est notre spécialité pour la diaspora. On est vos yeux et vos mains à Oran : sélection, achat, gestion locative et suivi à distance. Voir la page « Investir ».",
    answer_ar: 'نعم، هذا تخصّصنا للجالية. نكون عيونكم وأيديكم في وهران: الاختيار، الشراء، الإدارة الكرائية والمتابعة عن بُعد. انظر صفحة «استثمر».',
  },

  // ── VENTE DE VÉHICULES ──
  {
    question_fr: 'Vendez-vous aussi des voitures ?',
    question_ar: 'هل تبيعون السيارات أيضاً؟',
    answer_fr: "Oui, nous avons des véhicules à vendre (différents du parc de location). Chaque voiture est vérifiée, avec photos, année, kilométrage et prix. Contact via WhatsApp.",
    answer_ar: 'نعم، لدينا سيارات للبيع (غير سيارات الكراء). كل سيارة مفحوصة، مع صور، السنة، عدد الكيلومترات والسعر. التواصل عبر واتساب.',
  },
  {
    question_fr: 'Puis-je vendre ma voiture ou mon bien via vous ?',
    question_ar: 'هل يمكنني بيع سيارتي أو عقاري عبركم؟',
    answer_fr: "Oui. Envoyez-nous les détails (marque/modèle/année ou type de bien, prix souhaité) sur WhatsApp. On s'occupe de la mise en avant et des acheteurs.",
    answer_ar: 'نعم. أرسلوا لنا التفاصيل (العلامة/الطراز/السنة أو نوع العقار، السعر المطلوب) عبر واتساب. نتكفّل بالترويج والمشترين.',
  },

  // ── COMMANDE SUR MESURE ──
  {
    question_fr: 'Et si je veux un véhicule que vous n\'avez pas ?',
    question_ar: 'وماذا لو أردت سيارة لا تملكونها؟',
    answer_fr: "Utilisez la commande sur mesure : dites-nous le modèle souhaité et les dates. On vous le trouve. Un acompte confirme la commande.",
    answer_ar: 'استعملوا الطلب حسب الطلب: أخبرونا بالطراز المطلوب والتواريخ. نجده لكم. تسبقة تؤكّد الطلب.',
  },

  // ── PAIEMENT & CONFIANCE ──
  {
    question_fr: 'Comment se passe le paiement ?',
    question_ar: 'كيف تتم عملية الدفع؟',
    answer_fr: "Pour la location, un acompte bloque la réservation, le reste à la prise. Pour l'achat (voiture ou immobilier), on définit ensemble les modalités en toute transparence.",
    answer_ar: 'بالنسبة للكراء، التسبقة تحجز، والباقي عند الاستلام. بالنسبة للشراء (سيارة أو عقار)، نحدّد معاً الشروط بكل شفافية.',
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
