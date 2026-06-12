import SeoLanding from '../components/SeoLanding';

export default function VenteVoitureOran() {
  return (
    <SeoLanding
      slug="vente-voiture-oran"
      metaTitle="Vente de voitures à Oran — Véhicules vérifiés | Fik Conciergerie"
      metaDesc="Achetez ou vendez votre voiture à Oran en toute confiance : véhicules vérifiés, papiers en règle, accompagnement complet. Service dédié à la diaspora algérienne."
      breadcrumbName="Vente voiture Oran"
      serviceType="Service"
      h1a="Vente de voitures à Oran" h1b="en toute confiance"
      intro="Achetez ou vendez votre véhicule à Oran sans stress. Voitures vérifiées, historique transparent, papiers en règle. On vous accompagne de l'estimation à la signature."
      bullets={[
        "Véhicules vérifiés : photos, vidéos, état réel",
        "Accompagnement complet à l'achat comme à la vente",
        "Papiers et démarches sécurisés sur place",
        "Estimation honnête de votre véhicule",
        "Idéal pour acheter à distance depuis l'étranger",
        "Paiement et remise sécurisés",
      ]}
      why={[
        { h: "Acheter une voiture à Oran sans y être", p: "Vous êtes à l'étranger ? On vous envoie photos et vidéos détaillées, on vérifie le véhicule et on sécurise la transaction jusqu'à la remise des clés." },
        { h: "Vendre votre véhicule rapidement", p: "On estime votre voiture au juste prix, on la met en avant et on gère les acheteurs sérieux. Vous vendez vite et en sécurité." },
      ]}
      faq={[
        { q: "Les véhicules sont-ils vérifiés ?", a: "Oui, chaque véhicule est contrôlé. On fournit photos, vidéos et l'état réel avant tout engagement." },
        { q: "Puis-je acheter depuis l'étranger ?", a: "Oui. On gère l'inspection, les papiers et la sécurisation du paiement pour la diaspora." },
        { q: "Pouvez-vous m'aider à vendre ma voiture ?", a: "Oui, de l'estimation à la signature, on s'occupe de tout pour une vente rapide et sûre." },
      ]}
      ctaPrimary={{ href: "/vente-voitures", label: "Voir les véhicules" }}
      ctaSecondary={{ wa: "Bonjour, je suis intéressé(e) par l'achat / la vente d'un véhicule à Oran." }}
    />
  );
}
