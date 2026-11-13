import SeoLanding from '../components/SeoLanding';
import { seoCarsProps } from '../lib/seoCars';

export default function LocationVoitureOran({ cars = [], fromPrice = '', toPrice = '' }) {
  return (
    <SeoLanding
      slug="location-voiture-oran"
      metaTitle={`Location voiture Oran sans caution${fromPrice ? ` — dès ${fromPrice}/jour` : ''} | FK Location · Fik Conciergerie`}
      metaDesc={`Louez une voiture à Oran sans caution${fromPrice ? `, à partir de ${fromPrice} par jour` : ''} : citadines, SUV, 9 places et premium. Kilométrage illimité, livraison à l'aéroport, réservation en ligne ou par WhatsApp 7j/7.`}
      breadcrumbName="Location voiture Oran"
      serviceType="Service"
      h1a="Location de voiture à Oran" h1b="sans caution"
      intro="Louez la voiture qu'il vous faut à Oran : citadine économique, berline confort, SUV ou véhicule premium. Sans caution, kilométrage illimité, livraison possible à l'aéroport. Idéal pour la diaspora de passage."
      bullets={[
        "Sans caution — passeport + permis suffisent",
        "Kilométrage illimité sur toute l'Algérie",
        "Prise en charge à l'aéroport d'Oran ou à notre agence de Hay Badr",
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
        { q: "Livrez-vous à l'aéroport d'Oran ?", a: "Oui, livraison et récupération à l'aéroport d'Oran ou à notre agence de Hay Badr." },
        { q: "Comment réserver ?", a: "En ligne via la page Réservation, ou directement par WhatsApp. Vous recevez un numéro de suivi." },
        { q: "Quel est le prix d'une location de voiture à Oran ?", a: fromPrice ? `De ${fromPrice} à ${toPrice} par jour selon le modèle, kilométrage illimité compris et sans caution. Le prix exact de chaque voiture est affiché sur sa fiche.` : "Le prix dépend du modèle et de la durée ; il est affiché sur la fiche de chaque voiture, kilométrage illimité compris et sans caution." },
        { q: "Quel âge faut-il avoir pour louer ?", a: "Il faut avoir 35 ans minimum, c'est une exigence de nos assurances. Toute réservation d'une personne plus jeune est refusée." },
        { q: "Quels papiers faut-il ?", a: "Un passeport (ou une carte d'identité) et un permis de conduire valides. Pas de caution bloquée." },
        { q: "Peut-on louer pour une seule journée ?", a: "Oui. Une journée de location = 24 heures, du moment où vous prenez la voiture jusqu'au même horaire le lendemain." },
        { q: "FK Location et Fik Conciergerie, c'est la même chose ?", a: "Oui. FK Location est le service de location de voitures de Fik Conciergerie, à Hay Badr, Oran." },
      ]}
      carsTitle="Nos voitures à louer à Oran"
      cars={cars}
      guide={[
        { h: "Louer une voiture à Oran en 4 étapes", list: [
          "Choisissez votre voiture parmi nos modèles : le prix par jour est affiché sur chaque fiche.",
          "Réservez en ligne ou par WhatsApp en indiquant vos dates (et votre vol si vous arrivez en avion).",
          "On vous confirme la réservation avec un numéro de suivi.",
          "Récupérez la voiture à notre agence de Hay Badr ou à l'aéroport d'Oran Es-Sénia, et partez : kilométrage illimité.",
        ] },
        { h: "Combien coûte une location de voiture à Oran ?", p: fromPrice ? `Chez FK Location, les prix vont de ${fromPrice} à ${toPrice} par jour selon le modèle. Le prix affiché est le prix payé : kilométrage illimité, pas de caution, pas de frais cachés. Plus la location est longue, plus elle devient intéressante : demandez-nous un prix pour une semaine ou un mois.` : "Le prix dépend du modèle et de la durée. Il est affiché sur chaque fiche : kilométrage illimité, pas de caution, pas de frais cachés." },
        { h: "Quelle voiture louer à Oran ?", p: "En ville, une citadine (Clio, i10, Fiat 500X) se gare facilement dans les rues serrées du centre, de Hay Badr ou de Bir El Djir. Pour une famille ou des trajets vers Tlemcen, Mostaganem ou la côte, un SUV (Duster, Creta) est plus confortable. Pour un groupe ou un mariage, prenez un 9 places (Jumpy) ou une berline premium." },
        { h: "Location sans caution : comment ça marche ?", p: "La plupart des agences bloquent une grosse caution pendant toute la location. Chez nous, il n'y en a pas : vous présentez un passeport et un permis valides, on fait l'état des lieux ensemble avec photos, et vous partez. Vous rendez la voiture dans le même état, c'est tout." },
        { h: "Pour les Algériens de l'étranger", p: "Vous réservez depuis la France ou ailleurs en Europe avant votre départ, et la voiture vous attend à l'aéroport d'Oran à votre arrivée. On reste joignables sur WhatsApp pendant tout le séjour." },
      ]}
      related={[
        { href: '/location-voiture-aeroport-oran', label: "Location voiture aéroport d'Oran" },
        { href: '/cars', label: 'Toutes nos voitures et prix' },
        { href: '/conditions', label: 'Conditions de location' },
        { href: '/reviews', label: 'Avis clients' },
        { href: '/conciergerie-oran', label: 'Conciergerie à Oran' },
      ]}
      ctaPrimary={{ href: "/reservation", label: "Réserver maintenant" }}
      ctaSecondary={{ wa: "Bonjour, je veux louer une voiture à Oran. Pouvez-vous m'aider ?" }}
    />
  );
}

export async function getStaticProps() {
  return { props: await seoCarsProps(12), revalidate: 300 };
}
