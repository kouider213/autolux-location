import LegalPage from '../components/LegalPage';
import Link from 'next/link';
import { useSettings, waNumber } from '../lib/settings';

export default function CGV() {
  const s = useSettings();
  const wa = waNumber(s);
  return (
    <LegalPage title="Conditions générales" subtitle="Location, vente, immobilier et packs" updated="Juin 2026">
      <p>Les présentes conditions régissent les prestations proposées par <strong>Fik Conciergerie</strong> (Oran).
        Toute réservation ou commande implique leur acceptation. Les conditions détaillées par service figurent aussi
        sur la page <Link href="/conditions">Conditions</Link>.</p>

      <h2>1. Location de véhicule</h2>
      <ul>
        <li><strong>Âge minimum : 35 ans</strong> (exigence de nos assurances).</li>
        <li><strong>Aucune caution</strong> — zéro dépôt de garantie.</li>
        <li><strong>Acompte</strong> équivalent à 3 jours de location pour confirmer, déduit du total.</li>
        <li><strong>Documents</strong> : passeport + permis valides ; le passeport est conservé durant la location.</li>
        <li><strong>Inclus</strong> : kilométrage illimité, assurance tous risques, circulation dans toute l'Algérie.</li>
        <li>Le véhicule est remis propre et plein de carburant, et doit être rendu dans le même état.</li>
        <li>Un <strong>état des lieux photographié</strong> est établi au départ et au retour ; tout dégât hors usure normale est à la charge du locataire.</li>
        <li>Le véhicule ne peut être ni sous-loué, ni conduit par une personne non déclarée au contrat.</li>
        <li>En cas d'accident : prévenir immédiatement Fik Conciergerie et établir un constat.</li>
      </ul>

      <h2>2. Annulation & remboursement</h2>
      <ul>
        <li>Annulation <strong>plus de 7 jours</strong> avant le départ : acompte remboursé ou reporté.</li>
        <li>Annulation <strong>entre 7 et 2 jours</strong> avant : acompte conservé (reportable une fois selon disponibilité).</li>
        <li>Annulation <strong>moins de 48 h</strong> avant ou non-présentation : acompte non remboursable.</li>
        <li>En cas d'indisponibilité de notre fait : remboursement intégral ou solution équivalente proposée.</li>
      </ul>

      <h2>3. Vente de véhicules</h2>
      <ul>
        <li>Les véhicules sont publiés après vérification des informations fournies.</li>
        <li>Prix, état et documents sont confirmés avec le vendeur avant publication.</li>
        <li>L'achat se conclut entre les parties ; Fik Conciergerie facilite la mise en relation.</li>
        <li>Un acompte peut être demandé pour réserver un véhicule, selon accord écrit.</li>
      </ul>

      <h2>4. Immobilier</h2>
      <ul>
        <li>Les biens (location ou vente) sont publiés après accord avec le propriétaire.</li>
        <li>Caution, charges, durée et conditions sont indiquées sur chaque annonce.</li>
        <li>Pour la location longue durée, un contrat écrit est établi entre les parties.</li>
      </ul>

      <h2>5. Packs séjour</h2>
      <ul>
        <li>Un pack combine plusieurs services (voiture, logement, et/ou jet ski, chauffeur).</li>
        <li>Réserver un pack rend indisponibles le véhicule et le bien concernés pour toute la durée.</li>
        <li>Les conditions de location de voiture s'appliquent au véhicule du pack.</li>
        <li>Disponibilité et tarif final confirmés par notre équipe.</li>
      </ul>

      <h2>6. Paiement</h2>
      <p>Les paiements (acompte, solde) sont précisés pour chaque prestation. Un reçu est délivré. La page de suivi
        de chaque réservation indique le montant payé et le reste à régler.</p>

      <h2>7. Litiges</h2>
      <p>En cas de différend, les parties privilégient une résolution amiable. À défaut, le litige relève des
        juridictions compétentes d'Oran, Algérie.</p>

      <h2>8. Contact</h2>
      <p>WhatsApp <a href={`https://wa.me/${wa}`}>+{wa}</a> — {s.address || 'Oran, Algérie'}.</p>
    </LegalPage>
  );
}
