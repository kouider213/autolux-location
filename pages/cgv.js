import LegalPage from '../components/LegalPage';
import LegalBody from '../components/LegalBody';
import { useState, useEffect } from 'react';
import { useSettings, waNumber } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { getLegal } from '../lib/legal';

export default function CGV() {
  const s = useSettings();
  const wa = waNumber(s);
  const { lang } = useLang();
  const [ov, setOv] = useState(null);
  useEffect(() => { getLegal('cgv').then(setOv); }, []);

  const title = useTranslated('Conditions générales');
  const subtitle = useTranslated('Location, vente, immobilier et packs');

  if (ov && ov.body_fr && ov.body_fr.trim()) {
    const oTitle = (lang === 'ar' ? ov.title_ar : lang === 'en' ? ov.title_en : ov.title_fr) || ov.title_fr || 'Conditions générales';
    return <LegalPage title={oTitle}><LegalBody bodyFr={ov.body_fr} bodyLang={ov['body_' + lang]} /></LegalPage>;
  }

  const bodyFr = `Les présentes conditions régissent les prestations proposées par Fik Conciergerie (Oran). Toute réservation ou commande implique leur acceptation.

## 1. Location de véhicule
- Âge minimum : 35 ans (exigence de nos assurances).
- Aucune caution — zéro dépôt de garantie.
- Acompte équivalent à 3 jours de location pour confirmer, déduit du total.
- Documents : passeport et permis valides ; le passeport est conservé durant la location.
- Inclus : kilométrage illimité, assurance tous risques, circulation dans toute l'Algérie.
- Le véhicule est remis propre et plein de carburant, et doit être rendu dans le même état.
- Un état des lieux photographié est établi au départ et au retour ; tout dégât hors usure normale est à la charge du locataire.
- Le véhicule ne peut être ni sous-loué, ni conduit par une personne non déclarée au contrat.
- En cas d'accident : prévenir immédiatement Fik Conciergerie et établir un constat.

## 2. Annulation et remboursement
- Annulation plus de 7 jours avant le départ : acompte remboursé ou reporté.
- Annulation entre 7 et 2 jours avant : acompte conservé (reportable une fois selon disponibilité).
- Annulation moins de 48 h avant ou non-présentation : acompte non remboursable.
- En cas d'indisponibilité de notre fait : remboursement intégral ou solution équivalente proposée.

## 3. Vente de véhicules
- Les véhicules sont publiés après vérification des informations fournies.
- Prix, état et documents sont confirmés avec le vendeur avant publication.
- L'achat se conclut entre les parties ; Fik Conciergerie facilite la mise en relation.
- Un acompte peut être demandé pour réserver un véhicule, selon accord écrit.

## 4. Immobilier
- Les biens (location ou vente) sont publiés après accord avec le propriétaire.
- Caution, charges, durée et conditions sont indiquées sur chaque annonce.
- Pour la location longue durée, un contrat écrit est établi entre les parties.

## 5. Packs séjour
- Un pack combine plusieurs services (voiture, logement, et/ou jet ski, chauffeur).
- Réserver un pack rend indisponibles le véhicule et le bien concernés pour toute la durée.
- Les conditions de location de voiture s'appliquent au véhicule du pack.
- Disponibilité et tarif final confirmés par notre équipe.

## 6. Paiement
Les paiements (acompte, solde) sont précisés pour chaque prestation. Un reçu est délivré. La page de suivi de chaque réservation indique le montant payé et le reste à régler.

## 7. Litiges
En cas de différend, les parties privilégient une résolution amiable. À défaut, le litige relève des juridictions compétentes d'Oran, Algérie.

## 8. Contact
WhatsApp +${wa} — ${s.address || 'Oran, Algérie'}.`;

  return (
    <LegalPage title={title} subtitle={subtitle} updated="Juin 2026">
      <LegalBody bodyFr={bodyFr} />
    </LegalPage>
  );
}
