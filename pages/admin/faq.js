import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HelpCircle, Plus, Trash2, Save, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { DEFAULT_FAQ } from '../../lib/faq';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const blank = { question_fr: '', question_ar: '', answer_fr: '', answer_ar: '' };

export default function AdminFaqPage() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoad]  = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_faq').select('*').order('position', { ascending: true })
      .then(({ data }) => { setRows(data && data.length ? data : DEFAULT_FAQ.map(r => ({ ...r }))); setLoad(false); })
      .catch(() => { setRows(DEFAULT_FAQ.map(r => ({ ...r }))); setLoad(false); });
  }, []);

  const setField = (i, f) => (e) => setRows(rs => rs.map((r, j) => j === i ? { ...r, [f]: e.target.value } : r));
  const add    = () => setRows(rs => [...rs, { ...blank }]);
  const remove = (i) => setRows(rs => rs.filter((_, j) => j !== i));
  const move   = (i, dir) => setRows(rs => {
    const j = i + dir;
    if (j < 0 || j >= rs.length) return rs;
    const copy = [...rs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  });
  const loadDefaults = () => setRows(DEFAULT_FAQ.map(r => ({ ...r })));

  const save = async () => {
    setSaving(true);
    const clean = rows.filter(r => (r.question_fr || r.question_ar || '').trim());
    // Stratégie simple : on remplace tout (delete all + insert avec position)
    const del = await supabase.from('site_faq').delete().neq('id', 0);
    if (del.error) { setSaving(false); toast.error('Erreur: ' + del.error.message); return; }
    if (clean.length) {
      const payload = clean.map((r, i) => ({
        question_fr: r.question_fr || '', question_ar: r.question_ar || '',
        answer_fr: r.answer_fr || '', answer_ar: r.answer_ar || '', position: i,
      }));
      const ins = await supabase.from('site_faq').insert(payload);
      if (ins.error) { setSaving(false); toast.error('Erreur: ' + ins.error.message); return; }
    }
    setSaving(false);
    toast.success('FAQ enregistrée et publiée');
  };

  return (
    <>
      <Head><title>FAQ — Fik Admin</title></Head>
      <AdminLayout title="FAQ">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-white/40 text-sm flex items-center gap-2"><HelpCircle size={15} className="text-gold-400" /> Questions/réponses affichées sur la page FAQ (FR + arabe).</p>
              <button onClick={loadDefaults} className="text-white/40 hover:text-white text-xs flex items-center gap-1.5"><RotateCcw size={12} /> Valeurs par défaut</button>
            </div>

            {rows.map((r, i) => (
              <div key={i} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gold-400/70 text-xs font-bold">#{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center"><ChevronUp size={14} /></button>
                    <button onClick={() => move(i, 1)} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center"><ChevronDown size={14} /></button>
                    <button onClick={() => remove(i)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 flex items-center justify-center"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs font-semibold mb-1.5 block">Question (FR)</label>
                    <input value={r.question_fr || ''} onChange={setField(i, 'question_fr')} className={inputCls} />
                  </div>
                  <div dir="rtl">
                    <label className="text-white/40 text-xs font-semibold mb-1.5 block text-right">السؤال (عربية)</label>
                    <input value={r.question_ar || ''} onChange={setField(i, 'question_ar')} className={inputCls + ' text-right'} />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-semibold mb-1.5 block">Réponse (FR)</label>
                    <textarea value={r.answer_fr || ''} onChange={setField(i, 'answer_fr')} rows={2} className={inputCls + ' resize-none'} />
                  </div>
                  <div dir="rtl">
                    <label className="text-white/40 text-xs font-semibold mb-1.5 block text-right">الجواب (عربية)</label>
                    <textarea value={r.answer_ar || ''} onChange={setField(i, 'answer_ar')} rows={2} className={inputCls + ' resize-none text-right'} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={add} className="w-full border border-dashed border-white/15 hover:border-gold-500/40 rounded-2xl py-3 text-white/40 hover:text-gold-400 text-sm flex items-center justify-center gap-2 transition-all">
              <Plus size={15} /> Ajouter une question
            </button>

            <button onClick={save} disabled={saving} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer et publier'}
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
