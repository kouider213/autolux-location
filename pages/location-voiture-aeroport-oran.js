import SeoLanding from '../components/SeoLanding';
import { supabase } from '../lib/supabase';

export default function LocationVoitureAeroportOran({ cars = [], fromPrice = '' }) {
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
        { q: "Puis-je rendre la voiture à l'aéroport ?", a: "Oui, restitution à l'aéroport d'Oran ou à notre agence de Hay Badr." },
        { q: "Comment réserver depuis l'étranger ?", a: "En ligne via la page Réservation ou par WhatsApp. Vous recevez un numéro de suivi." },
        { q: "Combien coûte une location de voiture à l'aéroport d'Oran ?", a: fromPrice ? `À partir de ${fromPrice} par jour selon le modèle, kilométrage illimité et sans caution. Le prix de chaque voiture est affiché sur sa fiche.` : "Le prix dépend du modèle et de la durée : il est affiché sur la fiche de chaque voiture, kilométrage illimité et sans caution." },
        { q: "Que se passe-t-il si mon vol a du retard ?", a: "On suit l'heure de votre vol : indiquez votre numéro de vol à la réservation et la remise de la voiture est décalée en conséquence." },
        { q: "Quels papiers faut-il pour louer ?", a: "Un passeport (ou une carte d'identité) et un permis de conduire valides. Pas de caution bloquée sur votre carte." },
        { q: "Puis-je partir hors d'Oran avec la voiture ?", a: "Oui, le kilométrage est illimité partout en Algérie : Tlemcen, Mostaganem, Alger, le Sud… Prévenez-nous simplement de votre itinéraire." },
      ]}
      carsTitle="Les voitures livrables à l'aéroport d'Oran"
      cars={cars}
      guide={[
        { h: "Comment ça marche, étape par étape", list: [
          "Choisissez votre voiture sur le site et réservez en ligne ou par WhatsApp, avant même de prendre l'avion.",
          "Indiquez votre numéro de vol et votre heure d'arrivée à l'aéroport d'Oran Es-Sénia (ORN).",
          "On vous confirme la réservation par WhatsApp avec un numéro de suivi.",
          "À votre sortie de l'aéroport, la voiture vous attend : on vérifie les papiers ensemble, on fait le tour du véhicule et vous partez.",
          "À la fin du séjour, vous rendez la voiture à l'aéroport avant votre vol retour, ou à notre agence de Hay Badr.",
        ] },
        { h: "Pourquoi louer directement à l'aéroport d'Oran ?", p: "Après un vol depuis la France ou ailleurs en Europe, personne n'a envie de chercher un taxi ou d'attendre un proche. Avec une voiture remise à l'aéroport, vous rejoignez le centre-ville d'Oran, votre famille ou votre hôtel tout de suite, avec vos bagages, et vous restez libre pendant tout le séjour : visites, mariages, démarches, sorties à la plage ou trajets vers d'autres wilayas." },
        { h: "Location sans caution à l'aéroport", p: "Chez la plupart des loueurs, une caution importante est bloquée pendant toute la location. Chez Fik Conciergerie, il n'y a pas de caution : un passeport et un permis valides suffisent. Le prix affiché est le prix payé, kilométrage illimité compris." },
        { h: "Quelle voiture choisir ?", p: "Une citadine (Clio, Fiat 500X…) suffit pour circuler en ville et se garer facilement. Pour une famille avec beaucoup de bagages, prenez un SUV (Duster, Creta…) ou un véhicule 9 places pour les grands groupes. Pour un mariage ou une occasion spéciale, une berline premium fait la différence." },
      ]}
      related={[
        { href: '/location-voiture-oran', label: 'Location de voiture à Oran' },
        { href: '/cars', label: 'Toutes nos voitures' },
        { href: '/conciergerie-oran', label: 'Conciergerie à Oran' },
        { href: '/faq', label: 'Questions fréquentes' },
      ]}
      ctaPrimary={{ href: "/reservation", label: "Réserver maintenant" }}
      ctaSecondary={{ wa: "Bonjour, je veux louer une voiture livrée à l'aéroport d'Oran. Pouvez-vous m'aider ?" }}
    />
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { cars: [], fromPrice: '' }, revalidate: 300 };
    const { data } = await supabase.from('cars').select('id, name, resale_price, currency, image_url, available').order('resale_price');
    const cars = (data || []).filter((c) => c.available !== false).slice(0, 9);
    const dz = cars.filter((c) => c.resale_price && c.currency !== 'EUR');
    const min = dz.length ? Math.min(...dz.map((c) => Number(c.resale_price))) : 0;
    return { props: { cars, fromPrice: min ? `${min.toLocaleString('fr-FR')} DA` : '' }, revalidate: 300 };
  } catch {
    return { props: { cars: [], fromPrice: '' }, revalidate: 300 };
  }
}
