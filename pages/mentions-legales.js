import LegalPage from '../components/LegalPage';
import { useSettings, waNumber } from '../lib/settings';

export default function MentionsLegales() {
  const s = useSettings();
  const wa = waNumber(s);
  return (
    <LegalPage title="Mentions légales" updated="Juin 2026">
      <h2>Éditeur du site</h2>
      <p><strong>Fik Conciergerie</strong> — conciergerie (location de véhicules, vente, immobilier, packs séjour).<br />
        Siège : {s.address || 'Hay Badr, Oran, Algérie'}.<br />
        Contact : WhatsApp <a href={`https://wa.me/${wa}`}>+{wa}</a>{s.email ? <> — {s.email}</> : null}.</p>
      <p>Numéro de registre de commerce (RC) et identifiant fiscal (NIF) communiqués sur demande dans le cadre de
        toute relation contractuelle.</p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA).
        Les données applicatives sont gérées via <strong>Supabase</strong>.</p>

      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus du site (textes, logo, photos, mise en page) est la propriété de Fik Conciergerie,
        sauf mention contraire. Toute reproduction sans autorisation écrite est interdite.</p>

      <h2>Responsabilité</h2>
      <p>Les informations (prix, disponibilités, caractéristiques des véhicules et biens) sont fournies à titre
        indicatif et confirmées avant tout engagement. Fik Conciergerie met en relation et organise les prestations ;
        les conditions définitives de chaque transaction sont précisées par écrit avec le client.</p>

      <h2>Liens externes</h2>
      <p>Le site peut contenir des liens vers des sites tiers (WhatsApp, réseaux sociaux, Google Maps). Fik Conciergerie
        n'est pas responsable de leur contenu.</p>

      <h2>Contact</h2>
      <p>Pour toute question relative au site ou aux présentes mentions : WhatsApp <a href={`https://wa.me/${wa}`}>+{wa}</a>.</p>
    </LegalPage>
  );
}
