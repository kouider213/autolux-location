import Head from 'next/head';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

export default function ReviewsPage({ reviews }) {
  const [form, setForm] = useState({ client_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async () => {
    if (!form.client_name.trim() || !form.comment.trim()) {
      toast.error('Merci de remplir tous les champs');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert([{
      client_name: form.client_name,
      rating: form.rating,
      comment: form.comment,
      approved: false,
    }]);
    setSubmitting(false);
    if (error) { toast.error('Erreur lors de l\'envoi'); return; }
    setSubmitted(true);
    toast.success('Merci pour votre avis !');
  };

  return (
    <>
      <Head>
        <title>Avis Clients — AutoLux Location</title>
      </Head>

      <div className="grain min-h-screen bg-noir-950">
        <Navbar />

        <div className="pt-28 pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14">
              <span className="text-gold-500 text-sm font-semibold tracking-widest uppercase">Témoignages</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-3">Avis de nos clients</h1>

              {reviews.length > 0 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <span className="font-display text-5xl font-bold text-gold-500">{avgRating}</span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-xl ${i < Math.round(avgRating) ? 'text-gold-500' : 'text-white/20'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-white/40 text-sm">{reviews.length} avis</p>
                  </div>
                </div>
              )}
            </div>

            {/* Avis */}
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-5xl mb-4">💬</p>
                <p>Aucun avis pour l'instant. Soyez le premier !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {reviews.map((review) => (
                  <div key={review.id} className="card-dark p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`${i < review.rating ? 'text-gold-500' : 'text-white/15'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-white/60 italic text-sm leading-relaxed mb-4">"{review.comment}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-500 font-bold text-sm">
                        {review.client_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{review.client_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire avis */}
            <div className="max-w-xl mx-auto">
              <div className="card-dark p-8">
                <h2 className="font-display text-2xl font-bold text-white mb-6">Laisser un avis</h2>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🙏</div>
                    <h3 className="text-white font-semibold mb-2">Merci pour votre avis !</h3>
                    <p className="text-white/40 text-sm">Votre avis sera publié après validation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="label-dark">Votre nom *</label>
                      <input
                        type="text"
                        value={form.client_name}
                        onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                        placeholder="Ex: Mohammed B."
                        className="input-dark"
                      />
                    </div>

                    <div>
                      <label className="label-dark">Note *</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setForm(f => ({ ...f, rating: star }))}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= form.rating ? 'text-gold-500' : 'text-white/20'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label-dark">Votre commentaire *</label>
                      <textarea
                        value={form.comment}
                        onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                        rows={4}
                        placeholder="Partagez votre expérience..."
                        className="input-dark resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-gold w-full py-3 disabled:opacity-50"
                    >
                      {submitting ? 'Envoi...' : 'Envoyer mon avis'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });
  return { props: { reviews: reviews || [] } };
}
