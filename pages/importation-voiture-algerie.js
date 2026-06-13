import SeoLanding from '../components/SeoLanding';

export default function ImportationVoitureAlgerie() {
  return (
    <SeoLanding
      slug="importation-voiture-algerie"
      metaTitle="Importation de voiture en Algérie — recherche, achat, dédouanement | Fik Conciergerie"
      metaDesc="Importez la voiture de vos rêves en Algérie. Fik Conciergerie la recherche, l'achète à l'étranger et gère l'acheminement jusqu'à Oran. Suivi A→Z avec votre numéro de commande."
      breadcrumbName="Importation voiture Algérie"
      serviceType="Service"
      h1a="Importation de véhicule en Algérie" h1b="de A à Z"
      intro="Vous voulez une voiture précise, introuvable ou trop chère en Algérie ? On la recherche à l'étranger, on l'achète et on gère l'importation jusqu'à Oran. Vous suivez chaque étape — recherche, achat, transport, dédouanement, livraison — avec votre numéro de commande."
      bullets={[
        "Recherche du véhicule selon votre budget et vos critères",
        "Achat sécurisé à l'étranger par notre équipe",
        "Transport maritime et dédouanement gérés pour vous",
        "Suivi en temps réel avec un numéro de commande",
        "Photos et infos du véhicule dès qu'il est trouvé",
        "Accompagnement complet jusqu'à la remise des clés",
      ]}
      why={[
        { h: "Un seul interlocuteur, du début à la fin", p: "Pas besoin de courir après un mandataire. On s'occupe de tout : recherche, achat, transport, douane, livraison. Vous suivez l'avancement en ligne." },
        { h: "Transparence totale", p: "Chaque étape est tracée dans votre espace de suivi, avec photos et informations réelles du véhicule. Vous savez toujours où en est votre commande." },
      ]}
      faq={[
        { q: "Quels véhicules pouvez-vous importer ?", a: "Selon la réglementation algérienne en vigueur. Dites-nous la marque, le modèle et votre budget : on vous confirme la faisabilité." },
        { q: "Combien de temps prend une importation ?", a: "Cela dépend du véhicule et du transport. On vous donne une estimation à chaque étape, suivie en temps réel." },
        { q: "Comment suivre ma commande ?", a: "À la demande, vous recevez un numéro de commande (IMP-XXXXX) et un lien de suivi qui se met à jour à chaque étape." },
        { q: "Comment lancer une demande ?", a: "Remplissez le formulaire de commande de véhicule. Notre équipe étudie votre demande et revient vers vous rapidement." },
      ]}
      ctaPrimary={{ href: "/commande-vehicule", label: "Lancer ma demande d'importation" }}
      ctaSecondary={{ wa: "Bonjour, je souhaite importer un véhicule en Algérie. Pouvez-vous m'aider ?" }}
    />
  );
}
