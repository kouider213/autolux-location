import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Star, Check, Loader2, Home, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/i18n';
import { GOOGLE_REVIEW_URL } from '../../lib/google';

export default function AvisBooking() {
  const router = useRouter();
  const { id } = router.query;
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);
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
    if (!comment.trim()) { toast.error(L('Écrivez quelques mots', 'اكتب بضع كلمات', 'Write a few words')); return; }
    setSending(true);
    try {
      const r = await fetch('/api/submit-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, rating, comment }),
      });
      const d = await r.json();
      setSending(false);
      if (!r.ok) { toast.error(d.error || L('Erreur', 'خطأ', 'Error')); return; }
      setDone(true);
    } catch { setSending(false); toast.error(L('Erreur réseau', 'خطأ في الشبكة', 'Network error')); }
  };

  return (
    <>
      <Head><title>{L('Votre avis', 'تقييمك', 'Your review')} — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-lg mx-auto">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <Check size={30} className="text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">{L('Merci pour votre avis !', 'شكراً على تقييمك!', 'Thanks for your review!')}</h1>
              <p className="text-white/40 text-sm mb-6">{L("Votre retour aide d'autres clients à nous faire confiance.", 'رأيك يساعد عملاء آخرين على الوثوق بنا.', 'Your feedback helps other clients trust us.')}</p>
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <p className="text-white/50 text-sm mb-3">{L('Aidez-nous encore plus : laissez aussi un avis Google ⭐', 'ساعدنا أكثر: اترك تقييماً على Google ⭐', 'Help us even more: leave a Google review too ⭐')}</p>
                <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#1a1a1a] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  {L('Laisser un avis Google', 'تقييم على Google', 'Leave a Google review')}
                </a>
              </div>
              <Link href="/" className="btn-gold inline-flex px-6 py-3"><Home size={15} />{L('Accueil', 'الرئيسية', 'Home')}</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
                  <ShieldCheck size={13} />{L('Avis vérifié', 'تقييم موثَّق', 'Verified review')}
                </span>
                <h1 className="font-display text-3xl font-bold text-white mb-1">{L('Votre avis compte', 'رأيك يهمّنا', 'Your opinion matters')}</h1>
                <p className="text-white/40 text-sm">
                  {booking ? <>{L('Bonjour', 'مرحباً', 'Hello')} <b className="text-white/70">{booking.client_name}</b>, {L("comment s'est passée votre location", 'كيف كانت تجربة الإيجار', 'how was your rental')} {booking.cars?.name ? <><b className="text-white/70">{booking.cars.name}</b></> : ''} ?</> : L('Partagez votre expérience.', 'شاركنا تجربتك.', 'Share your experience.')}
                </p>
              </div>

              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-5">
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-3">{L('Votre note', 'تقييمك', 'Your rating')}</p>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}>
                        <Star size={34} className={(hovered || rating) >= n ? 'text-gold-400 fill-current' : 'text-white/15'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                  placeholder={L('Racontez votre expérience : accueil, véhicule, service…', 'احكِ لنا عن تجربتك: الاستقبال، السيارة، الخدمة…', 'Tell us about your experience: welcome, vehicle, service…')}
                  dir={ar ? 'rtl' : 'ltr'}
                  className="input-dark w-full text-sm resize-none" />
                <button onClick={submit} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 btn-gold py-3.5 disabled:opacity-50">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{L('Envoyer mon avis', 'إرسال تقييمي', 'Send my review')}
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
