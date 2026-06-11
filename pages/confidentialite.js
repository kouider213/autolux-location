import LegalPage from '../components/LegalPage';
import { useSettings, waNumber } from '../lib/settings';

export default function Confidentialite() {
  const s = useSettings();
  const wa = waNumber(s);
  return (
    <LegalPage title="Politique de confidentialité" updated="Juin 2026">
      <p>Fik Conciergerie attache une grande importance à la protection de vos données personnelles. Cette page
        explique quelles informations nous collectons, pourquoi, et vos droits.</p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Réservation</strong> : nom, téléphone, âge, e-mail (facultatif), références de passeport/permis.</li>
        <li><strong>Documents</strong> : copie du passeport et du permis pour les locations (obligation d'assurance).</li>
        <li><strong>Navigation</strong> : statistiques anonymes de visite (pages vues, appareil, pays) pour améliorer le site.</li>
      </ul>

      <h2>Utilisation</h2>
      <ul>
        <li>Traiter et suivre votre réservation, vente ou demande.</li>
        <li>Établir le contrat et l'état des lieux, gérer les paiements.</li>
        <li>Vous contacter (WhatsApp, e-mail) au sujet de votre prestation.</li>
      </ul>
      <p>Nous ne vendons ni ne louons vos données à des tiers.</p>

      <h2>Conservation</h2>
      <p>Vos données sont conservées le temps nécessaire à la prestation et aux obligations légales/comptables,
        puis supprimées ou anonymisées. Le passeport physique conservé durant une location vous est restitué à la fin.</p>

      <h2>Partage</h2>
      <p>Les données ne sont partagées qu'avec les prestataires techniques strictement nécessaires au fonctionnement
        du service (hébergement, base de données, stockage des photos), tenus à la confidentialité.</p>

      <h2>Sécurité</h2>
      <p>Les accès sont protégés et les échanges chiffrés (HTTPS). Les documents sensibles sont stockés de façon restreinte.</p>

      <h2>Vos droits</h2>
      <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ou retirer votre consentement,
        en nous contactant par WhatsApp <a href={`https://wa.me/${wa}`}>+{wa}</a>.</p>

      <h2>Cookies</h2>
      <p>Le site utilise des cookies de mesure d'audience anonymes. Vous pouvez les refuser via le bandeau prévu à cet effet.</p>
    </LegalPage>
  );
}
