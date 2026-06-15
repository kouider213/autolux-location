import LegalPage from '../components/LegalPage';
import LegalBody from '../components/LegalBody';
import { useState, useEffect } from 'react';
import { useSettings, waNumber } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';
import { getLegal } from '../lib/legal';

export default function MentionsLegales() {
  const s = useSettings();
  const wa = waNumber(s);
  const { lang } = useLang();
  const [ov, setOv] = useState(null);
  useEffect(() => { getLegal('mentions-legales').then(setOv); }, []);

  const title = useTranslated('Mentions légales');

  if (ov && ov.body_fr && ov.body_fr.trim()) {
    const oTitle = (lang === 'ar' ? ov.title_ar : lang === 'en' ? ov.title_en : ov.title_fr) || ov.title_fr || 'Mentions légales';
    return <LegalPage title={oTitle}><LegalBody bodyFr={ov.body_fr} bodyLang={ov['body_' + lang]} /></LegalPage>;
  }

  const bodyFr = `## Éditeur du site
Fik Conciergerie — conciergerie (location de véhicules, vente, immobilier, packs séjour).
Siège : ${s.address || 'Hay Badr, Oran, Algérie'}.
Contact : WhatsApp +${wa}${s.email ? ` — ${s.email}` : ''}.
Numéro de registre de commerce (RC) et identifiant fiscal (NIF) communiqués sur demande dans le cadre de toute relation contractuelle.

## Hébergement
Le site est hébergé par Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA). Les données applicatives sont gérées via Supabase.

## Propriété intellectuelle
L'ensemble des contenus du site (textes, logo, photos, mise en page) est la propriété de Fik Conciergerie, sauf mention contraire. Toute reproduction sans autorisation écrite est interdite.

## Responsabilité
Les informations (prix, disponibilités, caractéristiques des véhicules et biens) sont fournies à titre indicatif et confirmées avant tout engagement. Fik Conciergerie met en relation et organise les prestations ; les conditions définitives de chaque transaction sont précisées par écrit avec le client.

## Liens externes
Le site peut contenir des liens vers des sites tiers (WhatsApp, réseaux sociaux, Google Maps). Fik Conciergerie n'est pas responsable de leur contenu.

## Contact
Pour toute question relative au site ou aux présentes mentions : WhatsApp +${wa}.`;

  return (
    <LegalPage title={title} updated="Juin 2026">
      <LegalBody bodyFr={bodyFr} />
    </LegalPage>
  );
}
