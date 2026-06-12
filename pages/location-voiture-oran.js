import SeoLanding from '../components/SeoLanding';

export default function LocationVoitureOran() {
  return (
    <SeoLanding
      slug="location-voiture-oran"
      metaTitle="Location de voiture à Oran sans caution — Fik Conciergerie"
      metaDesc="Louez une voiture à Oran sans caution : citadines, berlines, SUV et premium. Kilométrage illimité, livraison aéroport, 7j/7. Réservation simple par WhatsApp ou en ligne."
      breadcrumbName="Location voiture Oran"
      serviceType="Service"
      h1a="Location de voiture à Oran" h1b="sans caution"
      intro="Louez la voiture qu'il vous faut à Oran : citadine économique, berline confort, SUV ou véhicule premium. Sans caution, kilométrage illimité, livraison possible à l'aéroport. Idéal pour la diaspora de passage."
      bullets={[
        "Sans caution — passeport + permis suffisent",
        "Kilométrage illimité sur toute l'Algérie",
        "Livraison à l'aéroport d'Oran ou à votre adresse",
        "Large choix : citadine, berline, SUV, premium",
        "Véhicules récents, propres et assurés",
        "Réservation en ligne ou par WhatsApp, 7j/7",
      ]}
      why={[
        { h: "Pourquoi louer chez Fik Conciergerie", p: "Pas de caution bloquée, pas de mauvaise surprise. On vous remet une voiture prête, avec un contrat clair et un accompagnement sur place du début à la fin." },
        { h: "Parfait pour les Algériens de l'étranger", p: "Vous réservez avant d'atterrir, on vous livre la voiture à l'aéroport. Vous gagnez du temps dès l'arrivée à Oran." },
      ]}
      faq={[
        { q: "Faut-il une caution pour louer ?", a: "Non. La location se fait sans caution. Un passeport et un permis valides suffisent." },
        { q: "Le kilométrage est-il limité ?", a: "Non, le kilométrage est illimité partout en Algérie." },
        { q: "Livrez-vous à l'aéroport d'Oran ?", a: "Oui, livraison possible à l'aéroport ou à l'adresse de votre choix sur Oran." },
        { q: "Comment réserver ?", a: "En ligne via la page Réservation, ou directement par WhatsApp. Vous recevez un numéro de suivi." },
      ]}
      ctaPrimary={{ href: "/reservation", label: "Réserver maintenant" }}
      ctaSecondary={{ wa: "Bonjour, je veux louer une voiture à Oran. Pouvez-vous m'aider ?" }}
    />
  );
}
