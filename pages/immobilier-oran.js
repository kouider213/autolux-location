import SeoLanding from '../components/SeoLanding';

export default function ImmobilierOran() {
  return (
    <SeoLanding
      slug="immobilier-oran"
      metaTitle="Immobilier à Oran — Location, achat & gestion | Fik Conciergerie"
      metaDesc="Immobilier à Oran pour la diaspora : location, achat, revente et gestion locative clé en main. Biens vérifiés, papiers sécurisés, revenu passif géré sur place."
      breadcrumbName="Immobilier Oran"
      serviceType="RealEstateAgent"
      h1a="Immobilier à Oran" h1b="géré pour vous"
      intro="Louez, achetez ou faites gérer votre bien à Oran sans y être. Biens vérifiés, accompagnement papiers, gestion locative complète. Votre investissement traité comme le nôtre."
      bullets={[
        "Biens vérifiés : photos, vidéos, emplacement Google Maps",
        "Location et achat/revente accompagnés de A à Z",
        "Gestion locative clé en main : revenu passif, zéro souci",
        "Papiers et démarches sécurisés sur place",
        "Estimation gratuite de votre bien",
        "Suivi transparent à distance",
      ]}
      why={[
        { h: "Investir dans l'immobilier à Oran depuis l'étranger", p: "On sélectionne des biens vérifiés, on vous montre tout en vidéo, on gère la visite, la négociation et les papiers. Vous investissez en confiance, à distance." },
        { h: "Gestion locative sans souci", p: "Achetez un bien, on le loue et on le gère pour vous : recherche de locataires, encaissement, entretien. Vous touchez vos revenus, on s'occupe du reste." },
      ]}
      faq={[
        { q: "Gérez-vous la location de mon bien ?", a: "Oui. Recherche de locataires, encaissement des loyers, entretien et suivi : gestion locative complète, vous touchez un revenu passif." },
        { q: "Puis-je acheter un bien depuis l'étranger ?", a: "Oui. On vous envoie vidéos et localisation réelle, on gère visites et papiers, et on sécurise toute la transaction." },
        { q: "Faites-vous l'estimation de mon bien ?", a: "Oui, estimation gratuite et honnête au prix réel du marché d'Oran." },
      ]}
      ctaPrimary={{ href: "/immo", label: "Voir les biens" }}
      ctaSecondary={{ wa: "Bonjour, je suis intéressé(e) par l'immobilier à Oran (location / achat / gestion)." }}
    />
  );
}
