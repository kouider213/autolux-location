import LegalPage from '../components/LegalPage';
import LegalBody from '../components/LegalBody';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSettings, waNumber } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { getLegal } from '../lib/legal';

export default function AProposPage() {
  const s = useSettings();
  const wa = waNumber(s);
  const { lang } = useLang();
  const [ov, setOv] = useState(null);
  useEffect(() => { getLegal('a-propos').then(setOv); }, []);

  const title = useTranslated('Qui sommes-nous');
  const subtitle = useTranslated('Fik Conciergerie — votre partenaire de confiance à Oran');
  const ctaLabel = useTranslated('Discutons de votre projet');

  if (ov && ov.body_fr && ov.body_fr.trim()) {
    const oTitle = (lang === 'ar' ? ov.title_ar : lang === 'en' ? ov.title_en : ov.title_fr) || ov.title_fr || 'Qui sommes-nous';
    return <LegalPage title={oTitle}><LegalBody bodyFr={ov.body_fr} bodyLang={ov['body_' + lang]} /></LegalPage>;
  }

  const bodyFr = `Fik Conciergerie est une conciergerie basée à Oran, spécialisée dans la location de véhicules, la vente de voitures, l'immobilier et les packs séjour tout-en-un. Notre mission : vous simplifier la vie, que vous soyez résident, de passage, ou membre de la diaspora de retour au pays.

Tout se fait simplement, par WhatsApp : vous nous contactez, nous nous occupons du reste — mise en relation, photos, annonce, organisation. Aucune création de compte requise.

## Nos services
- Location de voiture : assurance tous risques incluse, kilométrage illimité, partout en Algérie.
- Vente de véhicules : voitures vérifiées, prix et papiers confirmés avant publication.
- Immobilier : location et vente de biens à Oran, accompagnement de A à Z.
- Importation de véhicules : on recherche, achète et importe la voiture de vos rêves, suivi de A à Z.
- Packs séjour : voiture, logement (et jet ski / chauffeur) en une seule offre clé en main.
- Conciergerie sur-mesure : une demande particulière ? On organise tout sur place.

## Notre engagement
- Transparence : prix clairs, conditions écrites, état des lieux photographié avant et après chaque location.
- Confiance : assurance tous risques sur nos véhicules de location, aucune caution exigée.
- Proximité : une équipe joignable, qui répond, et qui connaît le terrain à Oran.
- Suivi : chaque réservation dispose d'une page de suivi en temps réel (paiement, contrat, état des lieux).

## Nous contacter
📍 ${s.address || 'Hay Badr, Oran, Algérie'}
💬 WhatsApp : +${wa}${s.email ? `\n✉️ ${s.email}` : ''}`;

  return (
    <LegalPage title={title} subtitle={subtitle}>
      <LegalBody bodyFr={bodyFr} />
      <div className="not-prose mt-6">
        <Link href="/contact" className="btn-gold inline-flex px-6 py-3"><Heart size={15} />{ctaLabel}</Link>
      </div>
    </LegalPage>
  );
}
