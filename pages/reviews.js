import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { Star } from 'lucide-react';

export default function Reviews({ reviews }) {
  return (
    <>
      <Head>
        <title>Avis clients — Fik Conciergerie</title>
        <meta name="description" content="Découvrez les avis de nos clients sur Fik Conciergerie, location de véhicules en Algérie." />
      </Head>

      <div className="min-h-screen bg-noir-950 py-16 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <span className="text-gold-500 text-sm font-semibold uppercase tracking-widest">Témoignages</span>
            <h1 className="font-display text-4xl font-bold text-white mt-2">Ce que disent nos clients</h1>
            <p className="text-white/50 mt-3">{reviews.length} avis vérifiés</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-noir-800 rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-noir-950 font-bold text-sm">
                      {review.client_name ? review.client_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{review.client_name}</p>
                      <p className="text-white/30 text-xs">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={s <= (review.rating||5) ? 'text-gold-500 fill-gold-500' : 'text-white/20'} />
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-20 text-white/40">
              <p>Aucun avis pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { props: { reviews: data || [] } };
  } catch (e) {
    return { props: { reviews: [] } };
  }
}
