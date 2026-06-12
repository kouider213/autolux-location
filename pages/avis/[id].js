import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Star, Check, Loader2, Home, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

export default function AvisBooking() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking]   = useState(null);
  const [rating, setRating]     = useState(5);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [sending, setSending]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    if (!id || !supabase) return;
    supabase.from('bookings').select('client_name, cars(name)').eq('id', id).maybeSingle()
      .then(({ data }) => setBooking(data));
  }, [id]);

  const submit = async () => {
    if (!comment.trim()) { toast.error('Écrivez quelques mots'); return; }
    setSending(true);
    try {
      const r = await fetch('/api/submit-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, rating, comment }),
      });
      const d = await r.json();
      setSending(false);
      if (!r.ok) { toast.error(d.error || 'Erreur'); return; }
      setDone(true);
    } catch { setSending(false); toast.error('Erreur réseau'); }
  };

  return (
    <>
      <Head><title>Votre avis — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-lg mx-auto">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <Check size={30} className="text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Merci pour votre avis !</h1>
              <p className="text-white/40 text-sm mb-8">Votre retour aide d'autres clients à nous faire confiance.</p>
              <Link href="/" className="btn-gold inline-flex px-6 py-3"><Home size={15} />Accueil</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
                  <ShieldCheck size={13} />Avis vérifié
                </span>
                <h1 className="font-display text-3xl font-bold text-white mb-1">Votre avis compte</h1>
                <p className="text-white/40 text-sm">
                  {booking ? <>Bonjour <b className="text-white/70">{booking.client_name}</b>, comment s'est passée votre location {booking.cars?.name ? <>de la <b className="text-white/70">{booking.cars.name}</b></> : ''} ?</> : 'Partagez votre expérience.'}
                </p>
              </div>

              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-5">
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-3">Votre note</p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}>
                        <Star size={34} className={(hovered || rating) >= n ? 'text-gold-400 fill-current' : 'text-white/15'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                  placeholder="Racontez votre expérience : accueil, véhicule, service…"
                  className="input-dark w-full text-sm resize-none" />
                <button onClick={submit} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 btn-gold py-3.5 disabled:opacity-50">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}Envoyer mon avis
                </button>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
