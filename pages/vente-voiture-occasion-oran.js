import SeoLanding from '../components/SeoLanding';

export default function VenteVoitureOccasionOran() {
  return (
    <SeoLanding
      slug="vente-voiture-occasion-oran"
      metaTitle="Voitures d'occasion à vendre à Oran — véhicules vérifiés | Fik Conciergerie"
      metaDesc="Achetez une voiture d'occasion à Oran en toute confiance : véhicules vérifiés, photos réelles, prix clairs. Citadines, berlines, SUV. Contactez Fik Conciergerie par WhatsApp."
      breadcrumbName="Voiture occasion Oran"
      serviceType="Service"
      h1a="Voitures d'occasion à vendre" h1b="à Oran"
      intro="Découvrez notre sélection de voitures d'occasion à vendre à Oran : véhicules vérifiés, photos réelles et prix transparents. Citadines, berlines, SUV — un achat en confiance, accompagné par notre équipe."
      bullets={[
        "Véhicules vérifiés, photos réelles",
        "Prix clairs, sans surprise",
        "Citadine, berline, SUV, premium",
        "Accompagnement à l'achat de A à Z",
        "Possibilité d'importation si le modèle n'est pas en stock",
        "Contact direct par WhatsApp, 7j/7",
      ]}
      why={[
        { h: "Acheter sans stress", p: "On vous présente des véhicules contrôlés, avec de vraies photos et un prix net. Pas de mauvaise surprise, un accompagnement humain du premier contact à la remise des clés." },
        { h: "Vous ne trouvez pas le bon modèle ?", p: "On peut le rechercher et l'importer pour vous. Dites-nous ce que vous cherchez, on s'occupe du reste." },
      ]}
      faq={[
        { q: "Les voitures sont-elles vérifiées ?", a: "Oui, les véhicules proposés sont contrôlés et présentés avec de vraies photos et un prix clair." },
        { q: "Puis-je voir la voiture avant d'acheter ?", a: "Bien sûr. Contactez-nous par WhatsApp pour organiser une visite à Oran." },
        { q: "Et si le modèle que je veux n'est pas disponible ?", a: "On peut le rechercher et l'importer pour vous via notre service d'importation." },
        { q: "Comment vous contacter ?", a: "Par WhatsApp directement, ou via la page Vente de véhicules pour voir les annonces." },
      ]}
      ctaPrimary={{ href: "/vente-voitures", label: "Voir les véhicules à vendre" }}
      ctaSecondary={{ wa: "Bonjour, je cherche une voiture d'occasion à Oran. Pouvez-vous m'aider ?" }}
    />
  );
}
