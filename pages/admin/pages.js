import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, FileText, Globe } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { LEGAL_SLUGS } from '../../lib/legal';

const EMPTY = { title_fr: '', title_ar: '', title_en: '', body_fr: '', body_ar: '', body_en: '' };

export default function AdminPages() {
  const [slug, setSlug]   = useState('a-propos');
  const [form, setForm]   = useState(EMPTY);
  const [loading, setLoad] = useState(true);
  const [saving, setSave] = useState(false);
  const [showTr, setTr]   = useState(false);

  const load = (s) => {
    setLoad(true);
    fetch(`/api/save-legal?slug=${s}`).then(r => r.json()).then(d => {
      setForm(d.page ? { ...EMPTY, ...Object.fromEntries(Object.entries(d.page).filter(([k]) => k in EMPTY)) } : EMPTY);
      setLoad(false);
    }).catch(() => setLoad(false));
  };
  useEffect(() => { load(slug); }, [slug]);

  const up = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setSave(true);
    try {
      const r = await fetch('/api/save-legal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form }),
      });
      const d = await r.json();
      setSave(false);
      if (!r.ok) { toast.error(d.error || 'Erreur'); return; }
      toast.success('Page enregistrée');
    } catch { setSave(false); toast.error('Erreur réseau'); }
  };

  const cur = LEGAL_SLUGS.find(x => x.slug === slug);

  return (
    <AdminLayout title="Pages du site">
      <Head><title>Pages — Admin</title></Head>
      <div className="max-w-3xl space-y-5">
        <p className="text-white/40 text-sm">Modifie le contenu des pages légales et institutionnelles. Laisse vide pour garder le contenu par défaut. L'arabe et l'anglais sont <b className="text-white/60">traduits automatiquement</b> à partir du français (tu peux forcer une version).</p>

        {/* Onglets pages */}
        <div className="flex flex-wrap gap-2">
          {LEGAL_SLUGS.map(p => (
            <button key={p.slug} onClick={() => setSlug(p.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                slug === p.slug ? 'bg-gold-500 text-noir-950 border-gold-500' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white'
              }`}>{p.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gold-500" /></div>
        ) : (
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white/60 text-sm font-semibold"><FileText size={15} className="text-gold-400" />{cur?.label} — Français</div>
            <input value={form.title_fr} onChange={up('title_fr')} placeholder={`Titre (déf. "${cur?.defTitle}")`} className="input-dark w-full text-sm py-2.5" />
            <textarea value={form.body_fr} onChange={up('body_fr')} rows={14}
              placeholder={'Contenu en français.\n\nMise en forme :\n## Un titre de section\n- une puce\nUn paragraphe normal.'}
              className="input-dark w-full text-sm leading-relaxed resize-y" />

            <button onClick={() => setTr(v => !v)} className="text-gold-400 text-xs flex items-center gap-1.5">
              <Globe size={13} />{showTr ? 'Masquer' : 'Forcer'} les versions arabe / anglais (optionnel)
            </button>
            {showTr && (
              <div className="grid gap-4 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Arabe (laisser vide = auto)</label>
                  <input value={form.title_ar} onChange={up('title_ar')} placeholder="العنوان" dir="rtl" className="input-dark w-full text-sm py-2 mb-2" />
                  <textarea value={form.body_ar} onChange={up('body_ar')} rows={6} dir="rtl" className="input-dark w-full text-sm resize-y" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Anglais (laisser vide = auto)</label>
                  <input value={form.title_en} onChange={up('title_en')} placeholder="Title" className="input-dark w-full text-sm py-2 mb-2" />
                  <textarea value={form.body_en} onChange={up('body_en')} rows={6} className="input-dark w-full text-sm resize-y" />
                </div>
              </div>
            )}

            <button onClick={save} disabled={saving}
              className="w-full flex items-center justify-center gap-2 btn-gold py-3 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}Enregistrer
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
