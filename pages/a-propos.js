import LegalPage from '../components/LegalPage';
import Link from 'next/link';
import { ShieldCheck, Car, Building2, Tag, Package, Heart } from 'lucide-react';
import { useSettings, waNumber } from '../lib/settings';

export default function AProposPage() {
  const s = useSettings();
  const wa = waNumber(s);
  const services = [
    { Icon: Car, t: 'Location de voiture', d: 'Assurance tous risques incluse, kilométrage illimité, partout en Algérie.' },
    { Icon: Tag, t: 'Vente de véhicules', d: 'Voitures vérifiées, prix et papiers confirmés avant publication.' },
    { Icon: Building2, t: 'Immobilier', d: 'Location et vente de biens à Oran, accompagnement de A à Z.' },
    { Icon: Package, t: 'Packs séjour', d: 'Voiture + logement (+ jet ski / chauffeur) en une seule offre.' },
  ];
  return (
    <LegalPage title="Qui sommes-nous" subtitle="Fik Conciergerie — votre partenaire de confiance à Oran">
      <p><strong>Fik Conciergerie</strong> est une conciergerie basée à Oran, spécialisée dans la location de véhicules,
        la vente de voitures, l'immobilier et les packs séjour tout-en-un. Notre mission : vous simplifier la vie,
        que vous soyez résident, de passage, ou membre de la diaspora de retour au pays.</p>

      <p>Tout se fait simplement, par WhatsApp : vous nous contactez, nous nous occupons du reste — mise en relation,
        photos, annonce, organisation. <strong>Aucune création de compte requise.</strong></p>

      <h2>Nos services</h2>
      <div className="grid sm:grid-cols-2 gap-3 not-prose">
        {services.map(({ Icon, t, d }) => (
          <div key={t} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4">
            <Icon size={18} className="text-gold-400 mb-2" />
            <p className="text-white font-semibold text-sm mb-1">{t}</p>
            <p className="text-white/40 text-xs leading-relaxed">{d}</p>
          </div>
        ))}
      </div>

      <h2>Notre engagement</h2>
      <ul>
        <li><strong>Transparence</strong> : prix clairs, conditions écrites, état des lieux photographié avant et après chaque location.</li>
        <li><strong>Confiance</strong> : assurance tous risques sur nos véhicules de location, aucune caution exigée.</li>
        <li><strong>Proximité</strong> : une équipe joignable, qui répond, et qui connaît le terrain à Oran.</li>
        <li><strong>Suivi</strong> : chaque réservation dispose d'une page de suivi en temps réel (paiement, contrat, état des lieux).</li>
      </ul>

      <h2>Nous contacter</h2>
      <p>📍 {s.address || 'Hay Badr, Oran, Algérie'}<br />
        💬 WhatsApp : <a href={`https://wa.me/${wa}`}>+{wa}</a>
        {s.email ? <><br />✉️ {s.email}</> : null}</p>

      <div className="not-prose mt-4">
        <Link href="/contact" className="btn-gold inline-flex px-6 py-3"><Heart size={15} />Discutons de votre projet</Link>
      </div>
    </LegalPage>
  );
}
