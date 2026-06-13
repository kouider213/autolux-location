import Head from 'next/head';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Star, MessageSquarePlus, Check, Loader2, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { GOOGLE_REVIEW_URL } from '../lib/google';

export default function ReviewsPage({ reviews: initialReviews }) {
  const { t, lang } = useLang();
  const googleLabel = lang === 'ar' ? 'اترك تقييماً على Google' : lang === 'en' ? 'Leave a Google review' : 'Laisser un avis Google';
  const [reviews, setReviews]   = useState(initialReviews || []);
  const [form, setForm]         = useState({ client_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [hovered, setHovered]       = useState(0);

  // Refresh client-side (comme la home) — évite la page figée par ISR
  useEffect(() => {
    if (!supabase) return;
    supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = async () => {
    if (!form.client_name.trim() || !form.comment.trim()) {
      toast.error('Merci de remplir tous les champs'); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert([{
      client_name: form.client_name, rating: form.rating, comment: form.comment, approved: false,
    }]);
    setSubmitting(false);
    if (error) { toast.error("Erreur lors de l'envoi"); return; }
    setSubmitted(true);
    toast.success(t('rv.thanks'));
    // Notify Dzaryx
    fetch('/api/notify-dzaryx', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'new_review', data: { client_name: form.client_name, rating: form.rating, comment: form.comment } }),
    }).catch(() => {});
  };

  return (
    <>
      <Head>
        <title>Avis Clients — Fik Conciergerie</title>
        <meta name="description" content="Lisez les témoignages de nos clients satisfaits et partagez votre expérience." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Header */}
        <div className="relative pt-28 pb-16 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">{t('rv.badge')}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
              {t('rv.t1')} <span className="text-gold-gradient italic">{t('rv.t2')}</span>
            </h1>

            {reviews.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="text-right">
                  <div className="font-display text-5xl font-bold text-gold-gradient leading-none">{avgRating}</div>
                  <div className="text-white/25 text-xs tracking-wider uppercase mt-1">sur 5</div>
                </div>
                <div className="w-px h-12 bg-white/[0.08]" />
                <div>
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={20} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'} />
                    ))}
                  </div>
                  <p className="text-white/35 text-sm">{reviews.length} {lang === 'ar' ? 'تقييم' : lang === 'en' ? 'reviews' : 'avis'}</p>
                </div>
              </div>
            )}

            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 bg-white text-[#1a1a1a] font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-all shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {googleLabel}
            </a>
          </div>
        </div>

        <div className="pb-24 px-5">
          <div className="max-w-5xl mx-auto">

            {/* Reviews grid */}
            {reviews.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Star size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 mb-1">{t('rv.none')}</p>
                <p className="text-white/25 text-sm">Soyez le premier à partager votre expérience !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                {reviews.map(review => (
                  <div key={review.id} className="card-dark p-6 relative overflow-hidden group hover:border-gold-500/15 hover:-translate-y-1 transition-all duration-300">
                    {/* Big quote */}
                    <span className="absolute top-3 right-4 font-display text-8xl text-gold-500/[0.06] leading-none select-none pointer-events-none">"</span>

                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                      ))}
                    </div>

                    <p className="text-white/55 text-sm leading-relaxed mb-5 italic relative z-10">
                      "{review.comment}"
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="w-9 h-9 bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm flex items-center gap-1.5">
                          {review.client_name}
                          {review.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                              <ShieldCheck size={9} />Vérifié
                            </span>
                          )}
                        </p>
                        {review.created_at && (
                          <p className="text-white/25 text-xs">
                            {new Date(review.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit form */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold-500/10 via-white/[0.03] to-transparent" />
                <div className="relative bg-[#141414] border border-white/[0.06] rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquarePlus size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-white">{t('rv.leave')}</h2>
                      <p className="text-white/30 text-xs">{t('rv.share')}</p>
                    </div>
                  </div>

                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-xl" />
                        <div className="relative w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center">
                          <Check size={28} className="text-gold-400" />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{t('rv.thanks')}</h3>
                      <p className="text-white/35 text-sm">Votre témoignage sera publié après validation par notre équipe.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="label-dark">{t('rv.name')}</label>
                        <input
                          type="text"
                          value={form.client_name}
                          onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                          placeholder={t('rv.name_ph')}
                          className="input-dark"
                        />
                      </div>

                      <div>
                        <label className="label-dark">{t('rv.note')}</label>
                        <div className="flex items-center gap-2 py-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, rating: star }))}
                              onMouseEnter={() => setHovered(star)}
                              onMouseLeave={() => setHovered(0)}
                              className="transition-all duration-150 hover:scale-125 focus:outline-none"
                              aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                            >
                              <Star
                                size={28}
                                className={`transition-colors duration-150 ${
                                  star <= (hovered || form.rating) ? 'text-gold-500 fill-gold-500' : 'text-white/15'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-white/40 text-sm ml-2">
                            {(hovered || form.rating)} / 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="label-dark">{t('rv.comment')}</label>
                        <textarea
                          value={form.comment}
                          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                          rows={4}
                          placeholder={t('rv.comment_ph')}
                          className="input-dark resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-gold w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <><Loader2 size={16} className="animate-spin" /> Envoi...</>
                        ) : (
                          <><Check size={15} /> {t('rv.submit')}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    if (!supabase) return { props: { reviews: [] }, revalidate: 30 };
    const { data: reviews } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false });
    return { props: { reviews: reviews || [] }, revalidate: 30 };
  } catch {
    return { props: { reviews: [] }, revalidate: 30 };
  }
}

