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
        { q: "Pouvez-vous chercher une voiture précise pour moi ?", a: "Oui. Donnez-nous le modèle, l'année, le carburant et votre budget : on cherche à Oran et dans l'Ouest, on vérifie la voiture et on vous envoie photos et prix avant toute visite." },
        { q: "Je veux vendre ma voiture à Oran, vous pouvez m'aider ?", a: "Oui. Envoyez photos, modèle, année, kilométrage et prix souhaité : on publie l'annonce sur notre site et nos réseaux, puis on filtre les acheteurs pour ne vous passer que les sérieux." },
        { q: "Faut-il payer pour être accompagné ?", a: "Contactez-nous par WhatsApp en expliquant votre besoin : on vous dit clairement ce qu'on peut faire et à quel prix avant de commencer." },
      ]}
      guide={[
        { h: "Acheter une voiture d'occasion à Oran : les 6 vérifications à faire", list: [
          "La carte grise est bien au nom du vendeur, et le numéro de châssis sur la carte grise est le même que sur la voiture.",
          "Le kilométrage est cohérent avec l'âge et l'état de la voiture (usure du volant, des pédales et des sièges).",
          "Le moteur démarre bien à froid, sans fumée ni bruit anormal, et aucun voyant ne reste allumé au tableau de bord.",
          "La carrosserie n'a pas de différences de teinte ou d'écarts entre les portes qui trahissent un accident.",
          "Un essai sur route : freinage droit, boîte de vitesses souple, direction sans jeu, climatisation qui refroidit.",
          "Les papiers sont prêts pour la mutation : on ne paie jamais sans un acte de vente en règle.",
        ] },
        { h: "Pourquoi passer par Fik Conciergerie ?", p: "Sur les sites d'annonces, on perd des journées en appels, en visites inutiles et en voitures qui ne correspondent pas aux photos. On fait ce tri pour vous : on regarde la voiture avant vous, on vous envoie de vraies photos et un prix net, et on vous accompagne jusqu'à la remise des clés. Vous ne vous déplacez que pour une voiture qui vaut le coup." },
        { h: "Vous vivez à l'étranger et voulez acheter à Oran ?", p: "Beaucoup de nos clients habitent en France. On peut chercher et vérifier la voiture pendant que vous êtes encore là-bas, pour que tout soit prêt quand vous arrivez : visite, essai et papiers organisés selon vos dates." },
        { h: "Vendre votre voiture d'occasion à Oran", list: [
          "Envoyez-nous par WhatsApp les photos, le modèle, l'année, le kilométrage et le prix souhaité.",
          "On publie une annonce soignée sur fikconciergerie.com et sur nos réseaux.",
          "On répond aux appels, on organise les visites et on filtre : vous ne rencontrez que les acheteurs sérieux.",
        ] },
        { h: "Le modèle que vous voulez n'est pas à vendre en Algérie ?", p: "On peut le faire venir de l'étranger avec notre service d'importation : recherche, achat, transport et démarches, avec un suivi de votre dossier en ligne." },
      ]}
      related={[
        { href: '/vente-voitures', label: 'Voitures à vendre' },
        { href: '/importation-voiture-algerie', label: 'Importation de voiture en Algérie' },
        { href: '/vente-voiture-oran', label: 'Vente de voiture à Oran' },
        { href: '/location-voiture-oran', label: 'Location de voiture à Oran' },
      ]}
      ctaPrimary={{ href: "/vente-voitures", label: "Voir les véhicules à vendre" }}
      ctaSecondary={{ wa: "Bonjour, je cherche une voiture d'occasion à Oran. Pouvez-vous m'aider ?" }}
    />
  );
}
