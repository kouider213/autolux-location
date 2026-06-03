import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2, ChevronUp, ChevronDown, Save, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { SECTIONS, DEFAULT_CONDITIONS } from '../../lib/conditions';

export default function AdminConditionsPage() {
  const [data, setData]     = useState({});   // { section: [{text_fr, text_ar}] }
  const [loading, setLoad]  = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoad(true);
    const { data: rows } = await supabase.from('site_conditions').select('*').order('position');
    const grouped = {};
    for (const s of SECTIONS) grouped[s.key] = [];
    if (rows && rows.length > 0) {
      for (const r of rows) (grouped[r.section] = grouped[r.section] || []).push({ text_fr: r.text_fr || '', text_ar: r.text_ar || '' });
    }
    // Si totalement vide → charge les valeurs par défaut en mémoire
    const empty = Object.values(grouped).every(arr => arr.length === 0);
    setData(empty ? structuredClone(DEFAULT_CONDITIONS) : grouped);
    setLoad(false);
  };

  const loadDefaults = () => {
    if (!confirm('Remplacer le contenu actuel par les conditions par défaut ?')) return;
    setData(structuredClone(DEFAULT_CONDITIONS));
    toast.success('Valeurs par défaut chargées — pensez à Enregistrer');
  };

  const addItem = (section) => setData(d => ({ ...d, [section]: [...(d[section] || []), { text_fr: '', text_ar: '' }] }));
  const removeItem = (section, i) => setData(d => ({ ...d, [section]: d[section].filter((_, idx) => idx !== i) }));
  const moveItem = (section, i, dir) => setData(d => {
    const arr = [...d[section]]; const to = i + dir;
    if (to < 0 || to >= arr.length) return d;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    return { ...d, [section]: arr };
  });
  const setField = (section, i, lang, val) => setData(d => {
    const arr = [...d[section]]; arr[i] = { ...arr[i], [lang === 'fr' ? 'text_fr' : 'text_ar']: val };
    return { ...d, [section]: arr };
  });

  const save = async () => {
    setSaving(true);
    try {
      // Remplace tout : delete all puis insert
      await supabase.from('site_conditions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const rows = [];
      for (const s of SECTIONS) {
        (data[s.key] || []).forEach((item, pos) => {
          if ((item.text_fr || '').trim() || (item.text_ar || '').trim()) {
            rows.push({ section: s.key, position: pos, text_fr: item.text_fr || null, text_ar: item.text_ar || null });
          }
        });
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('site_conditions').insert(rows);
        if (error) throw error;
      }
      toast.success('Conditions enregistrées — visibles sur le site');
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors resize-none";

  return (
    <>
      <Head><title>Conditions — Fik Admin</title></Head>
      <AdminLayout title="Conditions du site">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="max-w-3xl space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-white/40 text-sm">Modifie le texte des conditions en français et en arabe. Ça se met à jour directement sur la page <span className="text-gold-400">/conditions</span>.</p>
              <button onClick={loadDefaults} className="flex items-center gap-2 text-white/50 hover:text-white text-xs bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 rounded-xl transition-all"><RotateCcw size={13} /> Valeurs par défaut</button>
            </div>

            {SECTIONS.map(s => (
              <section key={s.key} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-sm flex items-center gap-2"><span className="w-1 h-4 bg-gold-500 rounded-full" />{s.fr} <span className="text-white/30 text-xs">· {s.ar}</span></h2>
                  <button onClick={() => addItem(s.key)} className="flex items-center gap-1.5 text-gold-400 text-xs hover:text-gold-300"><Plus size={13} /> Ajouter</button>
                </div>

                <div className="space-y-3">
                  {(data[s.key] || []).length === 0 && <p className="text-white/25 text-xs">Aucune ligne. Cliquez sur "Ajouter".</p>}
                  {(data[s.key] || []).map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Ligne {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveItem(s.key, i, -1)} disabled={i === 0} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.05] text-white/40 hover:text-white disabled:opacity-30"><ChevronUp size={12} /></button>
                          <button onClick={() => moveItem(s.key, i, 1)} disabled={i === (data[s.key].length - 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.05] text-white/40 hover:text-white disabled:opacity-30"><ChevronDown size={12} /></button>
                          <button onClick={() => removeItem(s.key, i)} className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-white/30 text-[10px] mb-1 block">🇫🇷 Français</label>
                          <textarea value={item.text_fr} onChange={e => setField(s.key, i, 'fr', e.target.value)} rows={2} className={inputCls} placeholder="Texte en français..." />
                        </div>
                        <div>
                          <label className="text-white/30 text-[10px] mb-1 block">🇩🇿 العربية</label>
                          <textarea value={item.text_ar} onChange={e => setField(s.key, i, 'ar', e.target.value)} rows={2} dir="rtl" className={inputCls} placeholder="النص بالعربية..." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="sticky bottom-4">
              <button onClick={save} disabled={saving} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer et publier sur le site'}
              </button>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
