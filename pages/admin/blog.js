import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Newspaper, Plus, Trash2, Save, X, Eye, EyeOff, ImageIcon, Loader2, Edit3 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../lib/blog';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const emptyPost = { slug: '', title_fr: '', title_ar: '', excerpt_fr: '', excerpt_ar: '', body_fr: '', body_ar: '', cover_url: '', published: false };

export default function AdminBlogPage() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [editing, setEdit]  = useState(null); // null = liste, sinon objet en édition
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoad(false); })
      .catch(() => setLoad(false));
  };
  useEffect(load, []);

  const setF = (f) => (e) => setEdit(p => ({ ...p, [f]: e.target.value }));

  const onCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/upload-car-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Upload échoué');
      setEdit(p => ({ ...p, cover_url: json.url }));
      toast.success('Image téléversée');
    } catch (err) { toast.error('Erreur image: ' + err.message); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!editing.title_fr && !editing.title_ar) { toast.error('Titre requis'); return; }
    setSaving(true);
    const slug = (editing.slug || slugify(editing.title_fr || editing.title_ar)).trim();
    const payload = {
      slug,
      title_fr: editing.title_fr || '', title_ar: editing.title_ar || '',
      excerpt_fr: editing.excerpt_fr || '', excerpt_ar: editing.excerpt_ar || '',
      body_fr: editing.body_fr || '', body_ar: editing.body_ar || '',
      cover_url: editing.cover_url || '', published: !!editing.published,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert([payload]));
    }
    setSaving(false);
    if (error) { toast.error('Erreur: ' + error.message); return; }
    toast.success('Article enregistré');
    setEdit(null); load();
  };

  const del = async (p) => {
    if (!confirm('Supprimer cet article ?')) return;
    await supabase.from('blog_posts').delete().eq('id', p.id);
    toast.success('Supprimé'); load();
  };

  const togglePublish = async (p) => {
    await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id);
    load();
  };

  return (
    <>
      <Head><title>Blog — Fik Admin</title></Head>
      <AdminLayout title="Blog">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : editing ? (
          /* ── ÉDITEUR ── */
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2"><Edit3 size={16} className="text-gold-400" /> {editing.id ? 'Modifier l\'article' : 'Nouvel article'}</h2>
              <button onClick={() => setEdit(null)} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/50 flex items-center justify-center"><X size={16} /></button>
            </div>

            {/* Cover */}
            <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5">
              <label className="text-white/40 text-xs font-semibold mb-2 block">Image de couverture</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden flex items-center justify-center flex-shrink-0">
                  {editing.cover_url ? <img src={editing.cover_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-white/20" />}
                </div>
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer ${uploading ? 'bg-white/[0.04] text-white/40' : 'bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20'}`}>
                  {uploading ? <><Loader2 size={14} className="animate-spin" /> ...</> : <><ImageIcon size={14} /> Choisir</>}
                  <input type="file" accept="image/*" onChange={onCover} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-semibold mb-1.5 block">Titre (FR)</label>
                <input value={editing.title_fr || ''} onChange={setF('title_fr')} className={inputCls} placeholder="Ex: Louer une voiture à Oran sans caution" />
              </div>
              <div dir="rtl">
                <label className="text-white/40 text-xs font-semibold mb-1.5 block text-right">العنوان (عربية)</label>
                <input value={editing.title_ar || ''} onChange={setF('title_ar')} className={inputCls + ' text-right'} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold mb-1.5 block">Résumé (FR)</label>
                <textarea value={editing.excerpt_fr || ''} onChange={setF('excerpt_fr')} rows={2} className={inputCls + ' resize-none'} placeholder="Phrase d'accroche affichée dans la liste" />
              </div>
              <div dir="rtl">
                <label className="text-white/40 text-xs font-semibold mb-1.5 block text-right">ملخّص (عربية)</label>
                <textarea value={editing.excerpt_ar || ''} onChange={setF('excerpt_ar')} rows={2} className={inputCls + ' resize-none text-right'} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-semibold mb-1.5 block">Contenu (FR)</label>
                <textarea value={editing.body_fr || ''} onChange={setF('body_fr')} rows={8} className={inputCls + ' resize-y'} placeholder="Sépare les paragraphes par une ligne vide." />
              </div>
              <div dir="rtl">
                <label className="text-white/40 text-xs font-semibold mb-1.5 block text-right">المحتوى (عربية)</label>
                <textarea value={editing.body_ar || ''} onChange={setF('body_ar')} rows={8} className={inputCls + ' resize-y text-right'} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/40 text-xs font-semibold mb-1.5 block">Slug URL (optionnel — auto depuis le titre)</label>
                <input value={editing.slug || ''} onChange={setF('slug')} className={inputCls} placeholder="louer-voiture-oran-sans-caution" />
              </div>
              <button type="button" onClick={() => setEdit(p => ({ ...p, published: !p.published }))}
                className={`sm:col-span-2 flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${editing.published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.04] border-white/[0.08] text-white/50'}`}>
                <span className="flex items-center gap-2">{editing.published ? <Eye size={15} /> : <EyeOff size={15} />} {editing.published ? 'Publié (visible sur le site)' : 'Brouillon (masqué)'}</span>
                <span>{editing.published ? 'OUI' : 'Non'}</span>
              </button>
            </div>

            <button onClick={save} disabled={saving} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer l\'article'}
            </button>
          </div>
        ) : (
          /* ── LISTE ── */
          <div className="max-w-3xl space-y-4">
            <button onClick={() => setEdit({ ...emptyPost })} className="btn-gold py-3 px-6 text-sm flex items-center gap-2">
              <Plus size={16} /> Nouvel article
            </button>

            {posts.length === 0 ? (
              <div className="text-center py-16 text-white/30 text-sm flex flex-col items-center gap-3">
                <Newspaper size={32} className="text-white/15" /> Aucun article. Crée le premier pour ramener du trafic Google.
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(p => (
                  <div key={p.id} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-white/[0.04] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.cover_url ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" /> : <Newspaper size={16} className="text-white/15" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{p.title_fr || p.title_ar || '(sans titre)'}</p>
                      <p className="text-white/30 text-xs truncate">/blog/{p.slug}</p>
                    </div>
                    <button onClick={() => togglePublish(p)} title={p.published ? 'Publié' : 'Brouillon'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.05] text-white/40'}`}>
                      {p.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => setEdit(p)} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/50 flex items-center justify-center"><Edit3 size={14} /></button>
                    <button onClick={() => del(p)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/70 flex items-center justify-center"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
