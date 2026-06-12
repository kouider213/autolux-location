import Head from 'next/head';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Wallet, Plus, TrendingUp, TrendingDown, Download, Trash2, Loader2, FileSpreadsheet } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const CATS = ['location', 'vente', 'immo', 'pack', 'carburant', 'entretien', 'salaire', 'taxe', 'autre'];
const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function AdminComptaPage() {
  const [entries, setEntries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(thisMonth());
  const [form, setForm] = useState({ kind: 'income', category: 'location', label: '', amount: '', currency: 'DZD', entry_date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: ce }, { data: bk }] = await Promise.all([
      supabase.from('cash_entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('bookings').select('id, client_name, car_id, start_date, end_date, final_price, paid_amount, payment_status, status, cars(name)').order('start_date', { ascending: false }),
    ]);
    setEntries(ce || []);
    setBookings(bk || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const monthEntries = useMemo(() => entries.filter(e => (e.entry_date || '').startsWith(month)), [entries, month]);
  const income = monthEntries.filter(e => e.kind === 'income').reduce((s, e) => s + Number(e.amount || 0), 0);
  const expense = monthEntries.filter(e => e.kind === 'expense').reduce((s, e) => s + Number(e.amount || 0), 0);
  const balance = income - expense;

  const add = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Montant requis'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('cash_entries').insert({
      kind: form.kind, category: form.category, label: form.label || null,
      amount: Number(form.amount), currency: form.currency, entry_date: form.entry_date,
    }).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setEntries(e => [data, ...e]);
    setForm(f => ({ ...f, label: '', amount: '' }));
    toast.success('Mouvement ajouté');
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce mouvement ?')) return;
    await supabase.from('cash_entries').delete().eq('id', id);
    setEntries(e => e.filter(x => x.id !== id));
  };

  const csv = (rows, name) => {
    const txt = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCaisse = () => {
    const rows = [['Date', 'Type', 'Catégorie', 'Libellé', 'Montant', 'Devise'],
      ...entries.filter(e => (e.entry_date || '').startsWith(month))
        .map(e => [e.entry_date, e.kind === 'income' ? 'Entrée' : 'Sortie', e.category, e.label, e.amount, e.currency])];
    csv(rows, `caisse-${month}.csv`);
  };

  const exportComptable = () => {
    const mb = bookings.filter(b => (b.start_date || '').startsWith(month));
    const rows = [['Date début', 'Date fin', 'Client', 'Véhicule', 'Statut', 'Total', 'Payé', 'Reste', 'Paiement'],
      ...mb.map(b => {
        const total = Number(b.final_price || 0), paid = Number(b.paid_amount || 0);
        return [b.start_date, b.end_date, b.client_name, b.cars?.name || '', b.status, total, paid, total - paid, b.payment_status || ''];
      })];
    const totalCA = mb.reduce((s, b) => s + Number(b.final_price || 0), 0);
    const totalPaid = mb.reduce((s, b) => s + Number(b.paid_amount || 0), 0);
    rows.push([], ['TOTAUX', '', '', '', '', totalCA, totalPaid, totalCA - totalPaid, '']);
    rows.push(['CAISSE — Entrées', '', '', '', '', income], ['CAISSE — Sorties', '', '', '', '', expense], ['CAISSE — Solde', '', '', '', '', balance]);
    csv(rows, `comptabilite-${month}.csv`);
  };

  return (
    <AdminLayout>
      <Head><title>Comptabilité — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><Wallet size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Caisse & Comptabilité</h1>
            <p className="text-white/30 text-sm">Suivi des entrées / sorties et export comptable</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-white text-sm outline-none" />
          </div>
        </div>

        {/* KPI mois */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1"><TrendingUp size={15} /><span className="text-xs font-semibold">Entrées</span></div>
            <p className="text-white font-black text-xl tabular-nums">{fmt(income)} <span className="text-white/30 text-sm">DA</span></p>
          </div>
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1"><TrendingDown size={15} /><span className="text-xs font-semibold">Sorties</span></div>
            <p className="text-white font-black text-xl tabular-nums">{fmt(expense)} <span className="text-white/30 text-sm">DA</span></p>
          </div>
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-gold-400 mb-1"><Wallet size={15} /><span className="text-xs font-semibold">Solde</span></div>
            <p className={`font-black text-xl tabular-nums ${balance >= 0 ? 'text-gold-400' : 'text-red-400'}`}>{fmt(balance)} <span className="text-white/30 text-sm">DA</span></p>
          </div>
        </div>

        {/* Exports */}
        <div className="flex flex-wrap gap-2.5">
          <button onClick={exportComptable} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-4 py-2.5">
            <FileSpreadsheet size={15} />Export comptable ({month})
          </button>
          <button onClick={exportCaisse} className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white border border-white/10 rounded-xl px-4 py-2.5">
            <Download size={15} />Export caisse
          </button>
        </div>

        {/* Ajouter un mouvement */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Plus size={15} className="text-gold-500" />Nouveau mouvement de caisse</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
            <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))} className={inputCls}>
              <option value="income">Entrée</option><option value="expense">Sortie</option>
            </select>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Libellé" className={`${inputCls} md:col-span-2`} />
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Montant" className={inputCls} />
            <input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex items-center gap-2">
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className={`${inputCls} max-w-[120px]`}>
              <option value="DZD">DZD (DA)</option><option value="EUR">EUR (€)</option>
            </select>
            <button onClick={add} disabled={saving} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}Ajouter
            </button>
          </div>
        </div>

        {/* Mouvements du mois */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] text-white/50 text-sm font-semibold">Mouvements de {month}</div>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 size={22} className="animate-spin text-gold-500" /></div>
          ) : monthEntries.length === 0 ? (
            <p className="py-12 text-center text-white/25 text-sm">Aucun mouvement ce mois.</p>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[420px] overflow-y-auto">
              {monthEntries.map(e => (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${e.kind === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {e.kind === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{e.label || e.category}</p>
                      <p className="text-white/25 text-xs">{e.entry_date} · {e.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`font-bold text-sm tabular-nums ${e.kind === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {e.kind === 'income' ? '+' : '−'}{fmt(e.amount)} {e.currency === 'EUR' ? '€' : 'DA'}
                    </span>
                    <button onClick={() => remove(e.id)} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
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
