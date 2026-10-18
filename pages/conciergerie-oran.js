import SeoLanding from '../components/SeoLanding';

export default function ConciergerieOran() {
  return (
    <SeoLanding
      slug="conciergerie-oran"
      metaTitle="Conciergerie à Oran — Fik Conciergerie | Location, Vente & Immobilier"
      metaDesc="Conciergerie premium à Oran : location et vente de voitures, immobilier, packs séjour. Un seul interlocuteur de confiance pour la diaspora algérienne. Sans caution, 7j/7."
      breadcrumbName="Conciergerie Oran"
      serviceType="Service"
      h1a="Conciergerie à Oran" h1b="clé en main"
      intro="Fik Conciergerie est votre interlocuteur unique à Oran : location et vente de véhicules, immobilier, packs séjour. Nous gérons tout sur place pendant que vous pilotez à distance, depuis l'étranger ou en Algérie."
      bullets={[
        "Location de voitures sans caution, livrées prêtes à rouler",
        "Vente et achat de véhicules avec accompagnement complet",
        "Immobilier locatif et achat/revente gérés pour vous",
        "Packs séjour : voiture + logement + services avant votre arrivée",
        "Papiers, visites, état des lieux : on s'occupe de tout",
        "Service 7j/7, réponse rapide sur WhatsApp",
      ]}
      why={[
        { h: "Une conciergerie pensée pour la diaspora", p: "Vous vivez à l'étranger ? Nous sommes vos yeux et vos mains à Oran. Photos, vidéos, emplacement Google Maps réel : vous décidez en confiance, nous exécutons sur place." },
        { h: "Tous vos besoins, un seul contact", p: "Plus besoin de courir plusieurs agences. Voiture, logement, démarches : Fik Conciergerie centralise tout avec transparence et suivi." },
      ]}
      faq={[
        { q: "Qu'est-ce qu'une conciergerie à Oran ?", a: "Un service unique qui gère pour vous la location/vente de voitures, l'immobilier et l'organisation de votre séjour à Oran, sur place et à distance." },
        { q: "Je vis à l'étranger, pouvez-vous gérer à ma place ?", a: "Oui. C'est notre spécialité : nous gérons visites, papiers, remise des clés et suivi pendant que vous restez informé à distance." },
        { q: "Faut-il une caution pour louer une voiture ?", a: "Non, location sans caution. Passeport et permis valides suffisent." },
      ]}
      ctaPrimary={{ href: "/cars", label: "Voir les voitures" }}
      ctaSecondary={{ wa: "Bonjour Fik Conciergerie, je souhaite en savoir plus sur vos services à Oran." }}
    />
  );
}
