import SeoLanding from '../components/SeoLanding';

export default function LocationVoitureAeroportOran() {
  return (
    <SeoLanding
      slug="location-voiture-aeroport-oran"
      metaTitle="Location voiture aéroport Oran (Es-Sénia) — livraison à l'arrivée | Fik Conciergerie"
      metaDesc="Louez une voiture à l'aéroport d'Oran Es-Sénia. Véhicule livré dès votre atterrissage, sans caution, kilométrage illimité. Idéal pour la diaspora. Réservez avant de partir."
      breadcrumbName="Location voiture aéroport Oran"
      serviceType="Service"
      h1a="Location de voiture à l'aéroport d'Oran" h1b="livrée à votre arrivée"
      intro="Atterrissez à Oran Es-Sénia et trouvez votre voiture qui vous attend. Vous réservez avant le départ, on vous livre le véhicule directement à l'aéroport — sans caution, kilométrage illimité. Parfait pour les Algériens de l'étranger qui veulent gagner du temps dès l'arrivée."
      bullets={[
        "Véhicule livré à l'aéroport d'Oran Es-Sénia",
        "Sans caution — passeport + permis suffisent",
        "Kilométrage illimité partout en Algérie",
        "Réservation avant l'atterrissage, voiture prête à l'arrivée",
        "Citadine, berline, SUV ou premium",
        "Accompagnement 7j/7 par WhatsApp",
      ]}
      why={[
        { h: "Pensé pour la diaspora", p: "Vous réservez depuis l'étranger, on cale la livraison sur l'heure de votre vol. Pas de taxi, pas d'attente : la voiture est là quand vous sortez." },
        { h: "Zéro mauvaise surprise", p: "Pas de caution bloquée, contrat clair, véhicule récent et assuré. On reste joignables tout au long de votre séjour." },
      ]}
      faq={[
        { q: "Livrez-vous vraiment à l'aéroport d'Oran ?", a: "Oui, livraison à l'aéroport Oran Es-Sénia (ORN) calée sur votre heure d'arrivée. Précisez votre vol à la réservation." },
        { q: "Faut-il une caution ?", a: "Non. Un passeport et un permis valides suffisent." },
        { q: "Puis-je rendre la voiture à l'aéroport ?", a: "Oui, restitution à l'aéroport d'Oran ou à notre bureau à Oran." },
        { q: "Comment réserver depuis l'étranger ?", a: "En ligne via la page Réservation ou par WhatsApp. Vous recevez un numéro de suivi." },
      ]}
      ctaPrimary={{ href: "/reservation", label: "Réserver maintenant" }}
      ctaSecondary={{ wa: "Bonjour, je veux louer une voiture livrée à l'aéroport d'Oran. Pouvez-vous m'aider ?" }}
    />
  );
}
