import Head from 'next/head';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, Trash2, MessageCircle, Phone, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useSettings, waNumber } from '../../lib/settings';

const CAT_LABEL = {
  immo_vente: 'Immo — vente', immo_location: 'Immo — location',
  voiture_vente: 'Voiture — vente', voiture_location: 'Voiture — location', pack: 'Pack séjour',
};
const STATUSES = ['nouveau', 'en_cours', 'conclu', 'perdu'];
const STATUS_CLS = {
  nouveau: 'bg-gold-500/15 text-gold-400', en_cours: 'bg-blue-500/15 text-blue-400',
  conclu: 'bg-emerald-500/15 text-emerald-400', perdu: 'bg-white/10 text-white/40',
};
const digits = (s) => String(s || '').replace(/\D/g, '');
const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');

export default function AdminLeadsPage() {
  const WHATSAPP = waNumber(useSettings());
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStatus, setFStatus] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('client_leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => leads.filter(l => {
    if (fStatus && l.status !== fStatus) return false;
    if (q.trim()) {
      const s = `${l.client_name} ${l.client_phone} ${l.criteria} ${l.city}`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [leads, fStatus, q]);

  const counts = useMemo(() => {
    const c = { total: leads.length };
    STATUSES.forEach(s => c[s] = leads.filter(l => l.status === s).length);
    return c;
  }, [leads]);

  const setStatus = async (id, status) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    const { error } = await supabase.from('client_leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce lead ?')) return;
    await supabase.from('client_leads').delete().eq('id', id);
    setLeads(ls => ls.filter(l => l.id !== id));
  };

  const relance = (l) => {
    const num = digits(l.client_phone) || WHATSAPP;
    const msg = `Bonjour ${l.client_name}, c'est Fik Conciergerie 👋 Vous étiez intéressé(e) par : ${l.criteria || CAT_LABEL[l.category] || ''}. Toujours d'actualité ? On est là pour vous aider.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
    if (l.status === 'nouveau') setStatus(l.id, 'en_cours');
  };

  return (
    <AdminLayout title="Leads / Demandes clients">
      <Head><title>Leads — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><UserPlus size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Leads / Demandes clients</h1>
            <p className="text-white/30 text-sm">Clients intéressés (immo, vente, packs) — relancez avant de les perdre</p>
          </div>
          <div className="ml-auto relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…"
              className="bg-white/[0.04] border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none w-48" />
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[['Total', counts.total, ''], ['Nouveaux', counts.nouveau, 'text-gold-400'], ['En cours', counts.en_cours, 'text-blue-400'], ['Conclus', counts.conclu, 'text-emerald-400'], ['Perdus', counts.perdu, 'text-white/40']].map(([lab, val, cls]) => (
            <div key={lab} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
              <p className="text-white/30 text-xs font-semibold mb-1">{lab}</p>
              <p className={`font-black text-2xl tabular-nums ${cls || 'text-white'}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Filtres statut */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFStatus('')} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${!fStatus ? 'bg-gold-500 text-noir-950 border-gold-500' : 'text-white/55 border-white/10'}`}>Tous</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFStatus(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border capitalize ${fStatus === s ? 'bg-gold-500 text-noir-950 border-gold-500' : 'text-white/55 border-white/10'}`}>{s.replace('_', ' ')}</button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-gold-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-12 text-center text-white/30 text-sm">Aucun lead.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => (
              <div key={l.id} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{l.client_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_CLS[l.status] || 'bg-white/10 text-white/40'}`}>{(l.status || '').replace('_', ' ')}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-white/50">{CAT_LABEL[l.category] || l.category}</span>
                    </div>
                    <p className="text-white/45 text-xs mt-1 flex items-center gap-1.5"><Phone size={11} />{l.client_phone || '—'}{l.city ? ` · ${l.city}` : ''}</p>
                    {l.criteria && <p className="text-white/60 text-sm mt-1.5">{l.criteria}</p>}
                    {l.budget_max ? <p className="text-gold-400 text-xs mt-0.5 font-semibold">Budget : {fmt(l.budget_max)} {l.currency === 'EUR' ? '€' : 'DA'}</p> : null}
                    <p className="text-white/20 text-[11px] mt-1">{new Date(l.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={l.status} onChange={e => setStatus(l.id, e.target.value)}
                      className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5 text-white text-xs outline-none capitalize">
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <button onClick={() => relance(l)} title="Relancer sur WhatsApp"
                      className="w-9 h-9 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 flex items-center justify-center"><MessageCircle size={15} /></button>
                    <button onClick={() => remove(l.id)} className="w-9 h-9 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400 flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
