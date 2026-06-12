import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Send, Users, Loader2, TestTube2, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const active = subs.filter(s => s.status === 'active');

  const send = async (test) => {
    if (!title.trim() || !body.trim()) { toast.error('Titre et contenu requis'); return; }
    if (!test && !confirm(`Envoyer à ${active.length} abonné(s) ?`)) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch('/api/newsletter-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ title, body, test }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'Échec');
      toast.success(test ? 'Email test envoyé' : `Envoyé à ${json.sent}/${json.total}`);
    } catch (e) { toast.error(e.message); }
    finally { setSending(false); }
  };

  const removeSub = async (id) => {
    if (!confirm('Supprimer cet abonné ?')) return;
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubs(s => s.filter(x => x.id !== id));
  };

  const exportCsv = () => {
    const rows = [['email', 'langue', 'statut', 'date'], ...subs.map(s => [s.email, s.lang, s.status, s.created_at])];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <Head><title>Newsletter — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><Mail size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Newsletter</h1>
            <p className="text-white/30 text-sm">{active.length} abonné(s) actif(s) · {subs.length} au total</p>
          </div>
          <button onClick={exportCsv} className="ml-auto text-xs font-semibold text-white/50 hover:text-gold-400 border border-white/10 rounded-lg px-3 py-2">Exporter CSV</button>
        </div>

        {/* Composer */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Send size={15} className="text-gold-500" />Nouvelle campagne</h2>
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-1.5">Objet de l'email</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Ex : -20% sur la location ce week-end !" />
          </div>
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-1.5">Message (HTML simple autorisé : &lt;b&gt;, &lt;br&gt;, &lt;a&gt;)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className={inputCls} placeholder={"Bonjour,\n\nDécouvrez nos nouvelles offres...\n\n<b>Réservez vite !</b>"} />
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => send(true)} disabled={sending}
              className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white border border-white/10 rounded-xl px-4 py-2.5 disabled:opacity-50">
              <TestTube2 size={15} />Envoyer un test (à moi)
            </button>
            <button onClick={() => send(false)} disabled={sending}
              className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Envoyer à tous ({active.length})
            </button>
          </div>
        </div>

        {/* Liste abonnés */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <Users size={15} className="text-white/40" /><span className="text-white/50 text-sm font-semibold">Abonnés</span>
          </div>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 size={22} className="animate-spin text-gold-500" /></div>
          ) : subs.length === 0 ? (
            <p className="py-12 text-center text-white/25 text-sm">Aucun abonné pour le moment.</p>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
              {subs.map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{s.email}</p>
                    <p className="text-white/25 text-xs">{s.lang?.toUpperCase()} · {s.source} · {new Date(s.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {s.status === 'active' ? 'Actif' : 'Désabonné'}
                    </span>
                    <button onClick={() => removeSub(s.id)} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
