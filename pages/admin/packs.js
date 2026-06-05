import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Package, Plus, Edit2, Trash2, Camera, ImageIcon, Loader2, X, ChevronLeft, ChevronRight, Star, Car, Building2, Home, Waves, UserCheck } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { uploadImageFile } from '../../lib/photoUpload';

const TIERS = [
  { key: 'entree',     label: 'Entrée de gamme', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { key: 'medium',     label: 'Médium',          cls: 'bg-gold-500/15 text-gold-400 border-gold-500/25' },
  { key: 'premium',    label: 'Premium',         cls: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  { key: 'entreprise', label: 'Entreprise / Groupe', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
];
const PRICE_TYPES = [
  { key: 'sejour',   label: 'par séjour' },
  { key: 'jour',     label: 'par jour' },
  { key: 'semaine',  label: 'par semaine' },
  { key: 'sur_devis', label: 'sur devis' },
];
const CURRENCIES = ['DZD', 'EUR'];
const STATUSES = [
  { key: 'disponible',   label: 'Disponible',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { key: 'coming_soon',  label: 'Bientôt',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  { key: 'indisponible', label: 'Indisponible', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
];
const INCLUSIONS = [
  { key: 'inc_car',       icon: Car,       label: 'Voiture' },
  { key: 'inc_apartment', icon: Building2, label: 'Appartement' },
  { key: 'inc_villa',     icon: Home,      label: 'Villa' },
  { key: 'inc_jetski',    icon: Waves,     label: 'Jet ski' },
  { key: 'inc_driver',    icon: UserCheck, label: 'Chauffeur' },
];

const emptyForm = {
  title: '', tier: 'entree', tagline: '', description: '',
  price: '', price_type: 'sejour', currency: 'DZD', duration: '',
  inc_car: true, inc_apartment: false, inc_villa: false, inc_jetski: false, inc_driver: false,
  features: '', status: 'disponible', featured: false,
};

export default function AdminPacksPage() {
  const [packs, setPacks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [photos, setPhotos]     = useState([]);
  const [photoIdx, setPhotoIdx] = useState({});
  const fileRef = useRef(null);
  const camRef  = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from('packs')
      .select('*, pack_photos(url, position)')
      .order('featured', { ascending: false })
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    setPacks(data || []);
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditP(null); setPhotos([]); setShowForm(true); };

  const openEdit = (p) => {
    setForm({
      title: p.title || '', tier: p.tier || 'entree', tagline: p.tagline || '', description: p.description || '',
      price: p.price || '', price_type: p.price_type || 'sejour', currency: p.currency || 'DZD', duration: p.duration || '',
      inc_car: !!p.inc_car, inc_apartment: !!p.inc_apartment, inc_villa: !!p.inc_villa, inc_jetski: !!p.inc_jetski, inc_driver: !!p.inc_driver,
      features: (p.features || []).join('\n'), status: p.status || 'disponible', featured: !!p.featured,
    });
    const sorted = (p.pack_photos || []).sort((a, b) => a.position - b.position);
    setPhotos(sorted.map(x => ({ url: x.url })));
    setEditP(p);
    setShowForm(true);
  };

  const uploadPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    let added = 0, errors = 0;
    for (const file of files) {
      if (photos.length + added >= 12) { toast.error('Maximum 12 photos'); break; }
      try { const url = await uploadImageFile(file); setPhotos(prev => [...prev, { url }]); added++; }
      catch (err) { errors++; console.error('[upload]', err); }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (camRef.current) camRef.current.value = '';
    if (added) toast.success(`${added} photo${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}`);
    if (errors) toast.error(`${errors} photo${errors > 1 ? 's' : ''} en échec`);
  };

  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const movePhoto = (i, dir) => setPhotos(prev => {
    const next = [...prev]; const to = i + dir;
    if (to < 0 || to >= next.length) return prev;
    [next[i], next[to]] = [next[to], next[i]]; return next;
  });

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Le titre est obligatoire'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), tier: form.tier, tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      price: form.price ? Number(form.price) : null,
      price_type: form.price_type, currency: form.currency,
      duration: form.duration.trim() || null,
      inc_car: form.inc_car, inc_apartment: form.inc_apartment, inc_villa: form.inc_villa,
      inc_jetski: form.inc_jetski, inc_driver: form.inc_driver,
      features: form.features.split('\n').map(s => s.trim()).filter(Boolean),
      status: form.status, featured: form.featured,
      image_url: photos[0]?.url || null,
    };
    let error, pId;
    if (editP) {
      ({ error } = await supabase.from('packs').update(payload).eq('id', editP.id));
      pId = editP.id;
    } else {
      const { data, error: e } = await supabase.from('packs').insert([payload]).select('id').single();
      error = e; pId = data?.id;
    }
    if (error) { toast.error('Erreur sauvegarde: ' + error.message); setSaving(false); return; }

    if (pId) {
      await supabase.from('pack_photos').delete().eq('pack_id', pId);
      if (photos.length > 0) {
        await supabase.from('pack_photos').insert(photos.map((ph, i) => ({ pack_id: pId, url: ph.url, position: i })));
      }
    }
    toast.success(editP ? 'Pack modifié' : 'Pack ajouté');
    setShowForm(false); load(); setSaving(false);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer le pack "${p.title}" ?`)) return;
    await supabase.from('packs').delete().eq('id', p.id);
    toast.success('Supprimé'); load();
  };

  const toggleFeatured = async (p) => {
    await supabase.from('packs').update({ featured: !p.featured }).eq('id', p.id);
    load();
  };

  const up = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const cur = (c) => c === 'DZD' ? 'DA' : '€';
  const priceTxt = (p) => (!p.price || p.price_type === 'sur_devis') ? 'Sur devis' : `${Number(p.price).toLocaleString()} ${cur(p.currency)}`;

  return (
    <>
      <Head><title>Packs — Fik Admin</title></Head>
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => uploadPhotos(e.target.files)} />
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => uploadPhotos(e.target.files)} />

      <AdminLayout title="Packs séjour">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              {packs.length} pack{packs.length !== 1 ? 's' : ''}
            </p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm flex items-center gap-2"><Plus size={15} /> Ajouter</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : packs.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center">
              <Package size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucun pack. Cliquez sur "Ajouter".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map(p => {
                const all = (p.pack_photos || []).sort((a, b) => a.position - b.position).map(x => x.url);
                if (p.image_url && !all.includes(p.image_url)) all.unshift(p.image_url);
                const idx = photoIdx[p.id] || 0;
                const photo = all[idx];
                const tier = TIERS.find(t => t.key === p.tier) || TIERS[0];
                const incs = INCLUSIONS.filter(i => p[i.key]);
                return (
                  <div key={p.id} className="relative bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="h-40 bg-[#0e0e0e] flex items-center justify-center overflow-hidden relative group">
                      {photo ? <img src={photo} alt={p.title} className="w-full h-full object-cover" /> : <Package size={36} className="text-white/10" />}
                      {all.length > 1 && (
                        <>
                          <button onClick={() => setPhotoIdx(s => ({ ...s, [p.id]: Math.max(0, (s[p.id] || 0) - 1) }))} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={14} /></button>
                          <button onClick={() => setPhotoIdx(s => ({ ...s, [p.id]: Math.min(all.length - 1, (s[p.id] || 0) + 1) }))} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={14} /></button>
                        </>
                      )}
                      <div className="absolute top-2.5 left-2.5"><span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${tier.cls}`}>{tier.label}</span></div>
                      <button onClick={() => toggleFeatured(p)} className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${p.featured ? 'bg-gold-500 text-noir-950' : 'bg-black/50 text-white/50'}`} title="Mettre en avant">
                        <Star size={13} className={p.featured ? 'fill-current' : ''} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141414] to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-bold text-sm leading-tight">{p.title}</h3>
                        <p className="text-gold-400 font-black text-sm tabular-nums leading-tight whitespace-nowrap ml-2">{priceTxt(p)}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {incs.map(({ key, icon: Icon }) => <span key={key} className="w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center"><Icon size={11} className="text-gold-500/80" /></span>)}
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/10 text-white/55 hover:text-white text-xs py-2.5 rounded-xl transition-all"><Edit2 size={12} /> Modifier</button>
                        <button onClick={() => handleDelete(p)} className="flex items-center justify-center px-2.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#141414] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="text-white font-bold text-base">{editP ? 'Modifier le pack' : 'Ajouter un pack'}</h2>
                <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white transition-all"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
                <div><label className="label-dark">Titre du pack *</label><input value={form.title} onChange={up('title')} placeholder="Pack Évasion" className="input-dark text-sm" /></div>
                <div><label className="label-dark">Accroche (1 ligne)</label><input value={form.tagline} onChange={up('tagline')} placeholder="Voiture + Appartement — l'essentiel" className="input-dark text-sm" /></div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Gamme</label><select value={form.tier} onChange={up('tier')} className="input-dark text-sm">{TIERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}</select></div>
                  <div><label className="label-dark">Durée</label><input value={form.duration} onChange={up('duration')} placeholder="7 jours" className="input-dark text-sm" /></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label-dark">Prix</label><input type="number" value={form.price} onChange={up('price')} placeholder="(vide = sur devis)" className="input-dark text-sm" /></div>
                  <div><label className="label-dark">Unité</label><select value={form.price_type} onChange={up('price_type')} className="input-dark text-sm">{PRICE_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}</select></div>
                  <div><label className="label-dark">Devise</label><select value={form.currency} onChange={up('currency')} className="input-dark text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                {/* Inclusions */}
                <div>
                  <label className="label-dark">Ce que le pack inclut</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {INCLUSIONS.map(({ key, icon: Icon, label }) => (
                      <button key={key} type="button" onClick={() => setForm(s => ({ ...s, [key]: !s[key] }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${form[key] ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'bg-white/[0.04] border-white/[0.08] text-white/45'}`}>
                        <Icon size={15} className={form[key] ? 'text-gold-400' : 'text-white/35'} /> {label}
                        <span className="ml-auto text-xs">{form[key] ? '✓' : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Statut</label><select value={form.status} onChange={up('status')} className="input-dark text-sm">{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                  <button type="button" onClick={() => setForm(s => ({ ...s, featured: !s.featured }))}
                    className={`mt-6 flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${form.featured ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.04] border-white/[0.08]'}`}>
                    <span className="flex items-center gap-2 text-sm"><Star size={15} className={form.featured ? 'text-gold-400 fill-gold-400' : 'text-white/40'} /><span className={form.featured ? 'text-gold-400 font-semibold' : 'text-white/50'}>Populaire</span></span>
                    <span className={`text-xs ${form.featured ? 'text-gold-400' : 'text-white/30'}`}>{form.featured ? 'OUI' : 'Non'}</span>
                  </button>
                </div>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-dark mb-0">Photos ({photos.length}/12)</label>
                    {photos.length > 0 && <span className="text-white/25 text-[10px]">1ère = principale</span>}
                  </div>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0e0e0e] group">
                          <img src={ph.url} alt={`p${i}`} className="w-full h-full object-cover" />
                          {i === 0 && <div className="absolute top-1 left-1 bg-gold-500 text-noir-950 text-[8px] font-black px-1.5 py-0.5 rounded-md">PRINCIPALE</div>}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {i > 0 && <button onClick={() => movePhoto(i, -1)} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center"><ChevronLeft size={12} className="text-white" /></button>}
                            <button onClick={() => removePhoto(i)} className="w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center"><Trash2 size={11} className="text-white" /></button>
                            {i < photos.length - 1 && <button onClick={() => movePhoto(i, 1)} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center"><ChevronRight size={12} className="text-white" /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {photos.length < 12 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" disabled={uploading} onClick={() => camRef.current?.click()} className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/55 text-sm py-3 rounded-xl transition-all disabled:opacity-40">{uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}{uploading ? 'Import...' : 'Caméra'}</button>
                      <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/55 text-sm py-3 rounded-xl transition-all disabled:opacity-40">{uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}{uploading ? 'Import...' : 'Galerie'}</button>
                    </div>
                  )}
                </div>

                <div><label className="label-dark">Détails inclus (une ligne par élément)</label><textarea value={form.features} onChange={up('features')} rows={4} className="input-dark text-sm resize-none" placeholder={"Voiture de location\nAppartement équipé\nAssurance incluse"} /></div>
                <div><label className="label-dark">Description</label><textarea value={form.description} onChange={up('description')} rows={3} className="input-dark text-sm resize-none" placeholder="Présentation du pack..." /></div>

                <button onClick={handleSave} disabled={saving || uploading} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40">{saving ? 'Sauvegarde...' : editP ? 'Enregistrer' : 'Ajouter le pack'}</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
