import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, CheckCircle2, Trash2, Clock, MessageSquare } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < rating ? 'text-gold-400 fill-gold-400' : 'text-white/10 fill-white/10'} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('pending');

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
    if (!error) { toast.success('Avis publié sur le site'); loadReviews(); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis définitivement ?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) { toast.success('Avis supprimé'); loadReviews(); }
  };

  const pendingCount  = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const avgRating     = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  const TABS = [
    { key: 'pending',  label: 'En attente', count: pendingCount },
    { key: 'approved', label: 'Publiés',    count: approvedCount },
    { key: 'all',      label: 'Tous',       count: reviews.length },
  ];

  return (
    <>
      <Head><title>Avis clients — Fik Admin</title></Head>
      <AdminLayout title="Avis clients">
        <div className="space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: Star,         val: avgRating,     label: 'Note moyenne', line: 'from-gold-500/0 via-gold-500 to-gold-500/0',          glow: 'bg-gold-500/8',    icon: 'bg-gold-500/15 text-gold-400',      grad: 'from-gold-300 to-gold-500' },
              { Icon: Clock,        val: pendingCount,  label: 'En attente',   line: 'from-amber-500/0 via-amber-500 to-amber-500/0',       glow: 'bg-amber-500/8',   icon: 'bg-amber-500/15 text-amber-400',    grad: 'from-amber-300 to-amber-400' },
              { Icon: CheckCircle2, val: approvedCount, label: 'Publiés',      line: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0', glow: 'bg-emerald-500/8', icon: 'bg-emerald-500/15 text-emerald-400', grad: 'from-emerald-300 to-emerald-400' },
            ].map(({ Icon, val, label, line, glow, icon, grad }) => (
              <div key={label} className="relative bg-[#141414] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${line}`} />
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${glow} blur-3xl pointer-events-none`} />
                <div className="relative">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${icon}`}>
                    <Icon size={15} />
                  </div>
                  <div className={`font-display text-2xl font-black bg-gradient-to-br ${grad} bg-clip-text text-transparent tabular-nums leading-none mb-1`}>{val}</div>
                  <div className="text-white/35 text-[11px] font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === t.key
                    ? 'bg-gold-500 text-noir-950 font-bold'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'
                }`}>
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  filter === t.key ? 'bg-black/20 text-noir-950/70' : 'bg-white/10 text-white/40'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center">
              <MessageSquare size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucun avis dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(review => (
                <div key={review.id} className={`bg-[#141414] border rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                  !review.approved ? 'border-amber-500/20' : 'border-white/[0.06]'
                }`}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight">{review.client_name}</p>
                        <p className="text-white/25 text-xs mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Stars rating={review.rating} />
                  </div>

                  {/* Comment */}
                  <p className="text-white/55 text-sm leading-relaxed italic flex-1">
                    "{review.comment}"
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      review.approved
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {review.approved
                        ? <><CheckCircle2 size={11} /> Publié</>
                        : <><Clock size={11} /> En attente</>}
                    </span>
                    <div className="flex gap-2">
                      {!review.approved && (
                        <button onClick={() => handleApprove(review.id)}
                          className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle2 size={12} /> Publier
                        </button>
                      )}
                      <button onClick={() => handleDelete(review.id)}
                        className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <Trash2 size={12} /> Supprimer
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
