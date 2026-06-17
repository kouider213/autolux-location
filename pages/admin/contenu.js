import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Loader2, ImageIcon, Save, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { CONTENT_FIELDS } from '../../lib/content';
import toast from 'react-hot-toast';

// Éditeur de contenu du site (textes + images par page) → site_settings.content (JSONB).
export default function AdminContenu() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('site_settings').select('content').eq('id', 1).single()
      .then(({ data }) => { setContent(data?.content || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setText = (key, lang, val) => setContent(c => ({ ...c, [key]: { ...(c[key] && typeof c[key] === 'object' ? c[key] : {}), [lang]: val } }));
  const setImg  = (key, url) => setContent(c => ({ ...c, [key]: url }));

  const onImgFile = async (key, file) => {
    if (!file) return;
    setUploading(key);
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split('base64,')[1]); r.onerror = rej; r.readAsDataURL(file); });
      const resp = await fetch('/api/upload-car-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: b64, fileName: file.name || 'content.jpg', mimeType: file.type || 'image/jpeg' }) });
      const json = await resp.json();
      if (!json.url) throw new Error(json.error || 'upload échoué');
      setImg(key, json.url);
      toast.success('Image téléversée');
    } catch (e) { toast.error('Erreur image: ' + (e.message || e)); }
    finally { setUploading(''); }
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').update({ content }).eq('id', 1);
      if (error) throw new Error(error.message + ' — lance la migration 0032_site_content.sql');
      toast.success('Contenu enregistré ✅');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500/40';

  return (
    <AdminLayout title="Contenu du site">
      <Head><title>Contenu — Admin</title></Head>
      <div className="max-w-2xl mx-auto pb-28">
        <p className="text-white/40 text-sm mb-6">Modifie les textes et photos des pages. Laisse vide pour garder le texte par défaut du site.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={16} className="animate-spin" />Chargement…</div>
        ) : CONTENT_FIELDS.map(grp => (
          <div key={grp.group} className="mb-8">
            <h2 className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-4">{grp.group}</h2>
            <div className="space-y-5">
              {grp.items.map(f => (
                <div key={f.key} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                  <div className="text-white/70 text-sm font-medium mb-2">{f.label}</div>
                  {f.type === 'image' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-16 rounded-lg bg-[#222] overflow-hidden flex items-center justify-center flex-shrink-0">
                        {content[f.key] ? <img src={content[f.key]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-white/20" />}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="inline-flex items-center gap-2 text-xs text-gold-400 bg-gold-500/10 border border-gold-500/25 rounded-lg px-3 py-2 cursor-pointer w-fit">
                          {uploading === f.key ? <><Loader2 size={13} className="animate-spin" />Téléversement…</> : <><ImageIcon size={13} />Changer la photo</>}
                          <input type="file" accept="image/*" className="hidden" disabled={uploading === f.key} onChange={e => onImgFile(f.key, e.target.files?.[0])} />
                        </label>
                        {content[f.key] && <button onClick={() => setImg(f.key, '')} className="inline-flex items-center gap-1 text-red-400/60 hover:text-red-400 text-[11px] w-fit"><X size={11} />Remettre la photo par défaut</button>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input value={content[f.key]?.fr || ''} onChange={e => setText(f.key, 'fr', e.target.value)} placeholder={`FR — défaut : ${f.def || ''}`} className={inputCls} />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={content[f.key]?.ar || ''} onChange={e => setText(f.key, 'ar', e.target.value)} placeholder="AR (اختياري)" dir="rtl" className={inputCls} />
                        <input value={content[f.key]?.en || ''} onChange={e => setText(f.key, 'en', e.target.value)} placeholder="EN (optional)" className={inputCls} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Barre de sauvegarde fixe */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#0e0e0e]/95 border-t border-white/10 px-5 py-3 flex justify-end z-20">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}Enregistrer
        </button>
      </div>
    </AdminLayout>
  );
}
