import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Loader2, Save, Search, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { I18N_DEFAULTS } from '../../lib/i18n';
import toast from 'react-hot-toast';

// Tous les textes du dictionnaire du site (lib/i18n.js), modifiables en FR/AR/EN
// → site_settings.content.i18n. Vide = texte d'origine.
const GROUPS = [
  { id: 'nav',     label: 'Menu',                      prefixes: ['nav'] },
  { id: 'home',    label: 'Accueil',                   prefixes: ['hero', 'home', 'poles', 'st'] },
  { id: 'cars',    label: 'Location',                  prefixes: ['cars', 'b', 'common', 'cc'] },
  { id: 'res',     label: 'Réservation',               prefixes: ['res', 'r'] },
  { id: 'detail',  label: 'Fiche voiture / bien',      prefixes: ['d'] },
  { id: 'sale',    label: 'Vente auto',                prefixes: ['sale'] },
  { id: 'order',   label: 'Commande véhicule',         prefixes: ['order', 'os', 'f', 'acompte'] },
  { id: 'immo',    label: 'Immobilier',                prefixes: ['immo'] },
  { id: 'contact', label: 'Contact',                   prefixes: ['ct', 'contact'] },
  { id: 'reviews', label: 'Avis',                      prefixes: ['rv'] },
  { id: 'cond',    label: 'Conditions',                prefixes: ['cd'] },
  { id: 'faq',     label: 'FAQ & Blog',                prefixes: ['faq', 'blog'] },
  { id: 'foot',    label: 'Pied de page',              prefixes: ['foot', 'footer'] },
  { id: 'misc',    label: 'WhatsApp, cookies, autres', prefixes: [] },
];

const groupOf = (key) => {
  const p = key.split('.')[0];
  return (GROUPS.find(g => g.prefixes.includes(p)) || GROUPS[GROUPS.length - 1]).id;
};

export default function AdminTextes() {
  const [ov, setOv]           = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [group, setGroup]     = useState('home');
  const [q, setQ]             = useState('');
  const [dirty, setDirty]     = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('site_settings').select('content').eq('id', 1).single()
      .then(({ data }) => { setOv(data?.content?.i18n || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const keys = useMemo(() => Object.keys(I18N_DEFAULTS.fr), []);
  const counts = useMemo(() => {
    const c = {};
    for (const k of keys) {
      const o = ov[k];
      if (o && ['fr', 'ar', 'en'].some(l => (o[l] || '').trim())) c[groupOf(k)] = (c[groupOf(k)] || 0) + 1;
    }
    return c;
  }, [keys, ov]);

  // Recherche : dans la clé, le texte d'origine (FR/AR/EN) et le texte modifié — tous groupes confondus.
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return keys.filter(k => groupOf(k) === group);
    return keys.filter(k => [k, I18N_DEFAULTS.fr[k], I18N_DEFAULTS.ar[k], I18N_DEFAULTS.en[k], ov[k]?.fr, ov[k]?.ar, ov[k]?.en]
      .some(v => typeof v === 'string' && v.toLowerCase().includes(s))).slice(0, 80);
  }, [q, group, keys, ov]);

  const setText = (key, lang, val) => {
    setOv(o => ({ ...o, [key]: { ...(o[key] || {}), [lang]: val } }));
    setDirty(true);
  };
  const reset = (key) => {
    setOv(o => { const n = { ...o }; delete n[key]; return n; });
    setDirty(true);
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      // On relit content pour ne pas écraser « Contenu du site » ni l'email 2 des Paramètres.
      const { data: cur, error: e1 } = await supabase.from('site_settings').select('content').eq('id', 1).single();
      if (e1) throw new Error(e1.message);
      const clean = {};
      for (const [k, o] of Object.entries(ov)) {
        const v = {};
        for (const l of ['fr', 'ar', 'en']) if ((o?.[l] || '').trim()) v[l] = o[l].trim();
        if (Object.keys(v).length) clean[k] = v;
      }
      const { error } = await supabase.from('site_settings').update({ content: { ...(cur?.content || {}), i18n: clean } }).eq('id', 1);
      if (error) throw new Error(error.message);
      try { localStorage.setItem('i18n_overrides', JSON.stringify(clean)); } catch {}
      setOv(clean);
      setDirty(false);
      toast.success('Textes enregistrés ✅ — visibles sur le site au prochain chargement');
    } catch (e) { toast.error('Erreur: ' + e.message); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-gold-500/40';

  return (
    <AdminLayout title="Textes du site">
      <Head><title>Textes — Admin</title></Head>
      <div className="max-w-3xl mx-auto pb-28">
        <p className="text-white/40 text-sm mb-4">
          Tous les textes du site (titres, boutons, descriptions). Le texte d&apos;origine est affiché en gris dans chaque case :
          écris par-dessus pour le remplacer, laisse vide pour garder l&apos;original. Pense à remplir aussi l&apos;arabe et l&apos;anglais,
          sinon ces langues gardent l&apos;ancien texte.
        </p>

        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Chercher un texte (ex : sans caution, Réserver, kilométrage…)"
            className={`${inputCls} pl-9 py-2.5`} />
        </div>

        {!q.trim() && (
          <div className="flex flex-wrap gap-2 mb-6">
            {GROUPS.map(g => (
              <button key={g.id} onClick={() => setGroup(g.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${group === g.id ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' : 'border-white/10 text-white/50 hover:text-white'}`}>
                {g.label}{counts[g.id] ? ` · ${counts[g.id]} modifié${counts[g.id] > 1 ? 's' : ''}` : ''}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gold-400" /></div>
        ) : shown.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">Aucun texte trouvé.</p>
        ) : (
          <div className="space-y-3">
            {shown.map(k => {
              const o = ov[k] || {};
              const changed = ['fr', 'ar', 'en'].some(l => (o[l] || '').trim());
              const long = (I18N_DEFAULTS.fr[k] || '').length > 70;
              const Input = long ? 'textarea' : 'input';
              return (
                <div key={k} className={`bg-[#141414] border rounded-xl p-4 ${changed ? 'border-gold-500/30' : 'border-white/[0.07]'}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-white/25 text-[11px] font-mono">{k}</span>
                    {changed && (
                      <button onClick={() => reset(k)} className="flex items-center gap-1 text-[11px] text-red-400/60 hover:text-red-400">
                        <RotateCcw size={11} /> Texte d&apos;origine
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input rows={long ? 3 : undefined} value={o.fr || ''} onChange={e => setText(k, 'fr', e.target.value)}
                      placeholder={`FR — ${I18N_DEFAULTS.fr[k] || ''}`} className={inputCls} />
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input rows={long ? 3 : undefined} value={o.ar || ''} onChange={e => setText(k, 'ar', e.target.value)}
                        placeholder={`AR — ${I18N_DEFAULTS.ar[k] || ''}`} dir="rtl" className={inputCls} />
                      <Input rows={long ? 3 : undefined} value={o.en || ''} onChange={e => setText(k, 'en', e.target.value)}
                        placeholder={`EN — ${I18N_DEFAULTS.en[k] || ''}`} className={inputCls} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#0e0e0e]/95 border-t border-white/10 px-5 py-3 flex justify-end z-20">
        <button onClick={save} disabled={saving || !dirty}
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Enregistrement…' : dirty ? 'Enregistrer les textes' : 'Aucune modification'}
        </button>
      </div>
    </AdminLayout>
  );
}
