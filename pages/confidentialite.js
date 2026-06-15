import LegalPage from '../components/LegalPage';
import LegalBody from '../components/LegalBody';
import { useState, useEffect } from 'react';
import { useSettings, waNumber } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { getLegal } from '../lib/legal';

export default function Confidentialite() {
  const s = useSettings();
  const wa = waNumber(s);
  const { lang } = useLang();
  const [ov, setOv] = useState(null);
  useEffect(() => { getLegal('confidentialite').then(setOv); }, []);

  const title = useTranslated('Politique de confidentialité');

  if (ov && ov.body_fr && ov.body_fr.trim()) {
    const oTitle = (lang === 'ar' ? ov.title_ar : lang === 'en' ? ov.title_en : ov.title_fr) || ov.title_fr || 'Politique de confidentialité';
    return <LegalPage title={oTitle}><LegalBody bodyFr={ov.body_fr} bodyLang={ov['body_' + lang]} /></LegalPage>;
  }

  const bodyFr = `Fik Conciergerie attache une grande importance à la protection de vos données personnelles. Cette page explique quelles informations nous collectons, pourquoi, et vos droits.

## Données collectées
- Réservation : nom, téléphone, âge, e-mail (facultatif), références de passeport/permis.
- Documents : copie du passeport et du permis pour les locations (obligation d'assurance).
- Navigation : statistiques anonymes de visite (pages vues, appareil, pays) pour améliorer le site.

## Utilisation
- Traiter et suivre votre réservation, vente ou demande.
- Établir le contrat et l'état des lieux, gérer les paiements.
- Vous contacter (WhatsApp, e-mail) au sujet de votre prestation.
Nous ne vendons ni ne louons vos données à des tiers.

## Conservation
Vos données sont conservées le temps nécessaire à la prestation et aux obligations légales et comptables, puis supprimées ou anonymisées. Le passeport physique conservé durant une location vous est restitué à la fin.

## Partage
Les données ne sont partagées qu'avec les prestataires techniques strictement nécessaires au fonctionnement du service (hébergement, base de données, stockage des photos), tenus à la confidentialité.

## Sécurité
Les accès sont protégés et les échanges chiffrés (HTTPS). Les documents sensibles sont stockés de façon restreinte.

## Vos droits
Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ou retirer votre consentement, en nous contactant par WhatsApp +${wa}.

## Cookies
Le site utilise des cookies de mesure d'audience anonymes. Vous pouvez les refuser via le bandeau prévu à cet effet.`;

  return (
    <LegalPage title={title} updated="Juin 2026">
      <LegalBody bodyFr={bodyFr} />
    </LegalPage>
  );
}
