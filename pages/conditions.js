import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ConditionsPage() {
  const conditions = [
    {
      icon: '🎂',
      title: 'Âge minimum : 35 ans et plus',
      desc: "Nous demandons un âge minimum de 35 ans afin d'assurer une conduite responsable et conforme aux assurances.",
    },
    {
      icon: '🛡️',
      title: 'Pas de caution',
      desc: "Nous ne demandons pas de caution.",
    },
    {
      icon: '📘',
      title: 'Passeport conservé',
      desc: "Conservé pendant la location et restitué à la fin.",
    },
    {
      icon: '💰',
      title: 'Acompte',
      desc: "Un acompte est demandé pour bloquer le véhicule.",
    },
  ];

  return (
    <>
      <Head>
        <title>Conditions de Location — AutoLux</title>
        <meta name="description" content="Conditions générales de location de véhicules AutoLux. Âge minimum, caution, passeport, acompte." />
      </Head>

      <div className="grain min-h-screen bg-noir-950">
        <Navbar />

        <div className="pt-28 pb-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Transparence</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3">Conditions de location</h1>
              <p className="text-white/40 mt-4 max-w-xl mx-auto leading-relaxed">
                Afin de garantir un service sérieux, sécurisé et confortable pour tous nos clients, voici nos conditions.
              </p>
            </div>

            <div className="space-y-4 mb-12">
              {conditions.map((item, i) => (
                <div
                  key={i}
                  className="card-dark p-6 flex gap-5 items-start hover:border-gold-500/20 transition-colors duration-300"
                >
                  <div className="text-4xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Note importante */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-10">
              <h3 className="text-amber-400 font-semibold mb-2">⚠️ Important</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Toute réservation effectuée par une personne de moins de 35 ans sera automatiquement refusée.
                En cas de fausse déclaration d'âge, la réservation sera annulée sans remboursement de l'acompte.
              </p>
            </div>

            <div className="text-center">
              <Link href="/reservation" className="btn-gold px-10 py-4 text-base">
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
