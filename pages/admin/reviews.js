import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'all'

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
    if (!error) { toast.success('Avis publié'); loadReviews(); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) { toast.success('Avis supprimé'); loadReviews(); }
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <>
      <Head><title>Avis — Fik Conciergerie Admin</title></Head>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Gestion des avis</h1>
              {pendingCount > 0 && (
                <p className="text-amber-400 text-sm mt-1">⚠️ {pendingCount} avis en attente de modération</p>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            {[
              { key: 'pending', label: `En attente (${pendingCount})` },
              { key: 'approved', label: 'Publiés' },
              { key: 'all', label: 'Tous' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  filter === f.key
                    ? 'bg-gold-500 text-noir-950 border-gold-500'
                    : 'border-white/10 text-white/40 hover:border-gold-500/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-dark p-16 text-center text-white/30">
              <p className="text-4xl mb-3">⭐</p>
              <p>Aucun avis dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(review => (
                <div key={review.id} className={`card-dark p-5 ${!review.approved ? 'border-amber-500/20' : 'border-emerald-500/10'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-500 font-bold">
                        {review.client_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{review.client_name}</p>
                        <p className="text-white/30 text-xs">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? 'text-gold-500' : 'text-white/15'}`}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-white/50 text-sm italic mb-4">"{review.comment}"</p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      review.approved
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {review.approved ? '✓ Publié' : '⏳ En attente'}
                    </span>
                    <div className="flex gap-2">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✓ Publier
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
