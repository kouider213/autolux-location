import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Tag, Plus, Edit2, Trash2, Camera, ImageIcon, Loader2, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { uploadImageFile } from '../../lib/photoUpload';

const FUELS        = ['essence', 'diesel', 'hybride', 'électrique'];
const TRANSMISSIONS = ['manuelle', 'automatique'];
const CURRENCIES   = ['EUR', 'DZD'];
const STATUSES     = [
  { key: 'disponible', label: 'Disponible', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { key: 'reserve',    label: 'Réservé',    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { key: 'vendu',      label: 'Vendu',      cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'coming_soon', label: 'Bientôt',   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
];

const emptyForm = {
  brand: '', model: '', year: '', mileage: '', fuel: 'essence',
  transmission: 'manuelle', price: '', currency: 'EUR', city: 'Oran',
  description: '', condition: '', status: 'disponible', featured: false,
};

export default function AdminVehiclesSalePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editV, setEditV]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [photos, setPhotos]     = useState([]);
  const [photoIdx, setPhotoIdx] = useState({});
  const fileRef                 = useRef(null);
  const camRef                  = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from('vehicles_for_sale')
      .select('*, vehicle_sale_photos(url, position)')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    setVehicles(data || []);
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditV(null); setPhotos([]); setShowForm(true); };

  const openEdit = (v) => {
    setForm({
      brand: v.brand, model: v.model, year: v.year || '', mileage: v.mileage || '',
      fuel: v.fuel || 'essence', transmission: v.transmission || 'manuelle',
      price: v.price || '', currency: v.currency || 'EUR', city: v.city || 'Oran',
      description: v.description || '', condition: v.condition || '',
      status: v.status || 'disponible', featured: !!v.featured,
    });
    const sorted = (v.vehicle_sale_photos || []).sort((a, b) => a.position - b.position);
    setPhotos(sorted.map(p => ({ url: p.url })));
    setEditV(v);
    setShowForm(true);
  };

  const uploadPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    let added = 0, errors = 0;
    for (const file of files) {
      if (photos.length + added >= 12) { toast.error('Maximum 12 photos'); break; }
      try {
        const url = await uploadImageFile(file);  // convertit HEIC→JPEG + compresse + upload
        setPhotos(prev => [...prev, { url }]);
        added++;
      } catch (err) {
        errors++;
        console.error('[upload]', err);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (camRef.current) camRef.current.value = '';
    if (added) toast.success(`${added} photo${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}`);
    if (errors) toast.error(`${errors} photo${errors > 1 ? 's' : ''} en échec`);
  };

  const videoRef = useRef(null);
  const isVid = (u) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u || '');
  const uploadVideo = async (file) => {
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) { toast.error('Vidéo trop lourde (max 80MB)'); return; }
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const path = `vente/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('videos').upload(path, file, { contentType: file.type || 'video/mp4', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('videos').getPublicUrl(path);
      setPhotos(prev => [...prev, { url: data.publicUrl }]);
      toast.success('Vidéo ajoutée');
    } catch (err) { toast.error('Erreur vidéo: ' + err.message); }
    finally { setUploading(false); if (videoRef.current) videoRef.current.value = ''; }
  };

  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const movePhoto = (i, dir) => setPhotos(prev => {
    const next = [...prev]; const to = i + dir;
    if (to < 0 || to >= next.length) return prev;
    [next[i], next[to]] = [next[to], next[i]]; return next;
  });

  const handleSave = async () => {
    if (!form.brand || !form.model) { toast.error('Marque et modèle obligatoires'); return; }
    setSaving(true);
    const payload = {
      brand: form.brand.trim(), model: form.model.trim(),
      year: form.year ? Number(form.year) : null,
      mileage: form.mileage ? Number(form.mileage) : null,
      fuel: form.fuel, transmission: form.transmission,
      price: form.price ? Number(form.price) : null,
      currency: form.currency, city: form.city || null,
      description: form.description || null, condition: form.condition || null,
      status: form.status, featured: form.featured,
      image_url: photos[0]?.url || null,
    };
    let error, vId;
    if (editV) {
      ({ error } = await supabase.from('vehicles_for_sale').update(payload).eq('id', editV.id));
      vId = editV.id;
    } else {
      const { data, error: e } = await supabase.from('vehicles_for_sale').insert([payload]).select('id').single();
      error = e; vId = data?.id;
    }
    if (error) { toast.error('Erreur sauvegarde'); setSaving(false); return; }

    if (vId) {
      await supabase.from('vehicle_sale_photos').delete().eq('vehicle_id', vId);
      if (photos.length > 0) {
        await supabase.from('vehicle_sale_photos').insert(
          photos.map((ph, i) => ({ vehicle_id: vId, url: ph.url, position: i }))
        );
      }
    }
    toast.success(editV ? 'Véhicule modifié' : 'Véhicule ajouté');
    setShowForm(false); load(); setSaving(false);
  };

  const handleDelete = async (v) => {
    if (!confirm(`Supprimer ${v.brand} ${v.model} ?`)) return;
    await supabase.from('vehicles_for_sale').delete().eq('id', v.id);
    toast.success('Supprimé'); load();
  };

  const toggleFeatured = async (v) => {
    await supabase.from('vehicles_for_sale').update({ featured: !v.featured }).eq('id', v.id);
    load();
  };

  const up = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const cur = (c) => c === 'DZD' ? 'DA' : '€';

  return (
    <>
      <Head><title>Véhicules à vendre — Fik Admin</title></Head>
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => uploadPhotos(e.target.files)} />
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => uploadPhotos(e.target.files)} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(f); }} />

      <AdminLayout title="Véhicules à vendre">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              {vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''} à vendre
            </p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm flex items-center gap-2">
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : vehicles.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center">
              <Tag size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucun véhicule à vendre. Cliquez sur "Ajouter".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles.map(v => {
                const all = (v.vehicle_sale_photos || []).sort((a, b) => a.position - b.position).map(p => p.url);
                if (v.image_url && !all.includes(v.image_url)) all.unshift(v.image_url);
                const idx = photoIdx[v.id] || 0;
                const photo = all[idx];
                const st = STATUSES.find(s => s.key === v.status) || STATUSES[0];
                return (
                  <div key={v.id} className="relative bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="h-44 bg-[#0e0e0e] flex items-center justify-center overflow-hidden relative group">
                      {photo ? <img src={photo} alt={v.model} className="w-full h-full object-cover" /> : <Tag size={36} className="text-white/10" />}
                      {all.length > 1 && (
                        <>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [v.id]: Math.max(0, (p[v.id] || 0) - 1) }))} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={14} /></button>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [v.id]: Math.min(all.length - 1, (p[v.id] || 0) + 1) }))} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={14} /></button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {all.map((_, i) => <button key={i} onClick={() => setPhotoIdx(p => ({ ...p, [v.id]: i }))} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/30'}`} />)}
                          </div>
                        </>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${st.cls}`}>{st.label}</span>
                      </div>
                      <button onClick={() => toggleFeatured(v)} className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${v.featured ? 'bg-gold-500 text-noir-950' : 'bg-black/50 text-white/50'}`} title="Mettre en avant">
                        <Star size={13} className={v.featured ? 'fill-current' : ''} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141414] to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-bold text-sm leading-tight">{v.brand} {v.model}</h3>
                          <span className="text-white/30 text-[10px]">{[v.year, v.mileage ? `${Number(v.mileage).toLocaleString()} km` : null, v.city].filter(Boolean).join(' · ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gold-400 font-black text-base tabular-nums leading-tight">{v.price ? `${Number(v.price).toLocaleString()} ${cur(v.currency)}` : '—'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/10 text-white/55 hover:text-white text-xs py-2.5 rounded-xl transition-all"><Edit2 size={12} /> Modifier</button>
                        <button onClick={() => handleDelete(v)} className="flex items-center justify-center px-2.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={12} /></button>
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
                <h2 className="text-white font-bold text-base">{editV ? 'Modifier' : 'Ajouter un véhicule à vendre'}</h2>
                <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white transition-all"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Marque *</label><input value={form.brand} onChange={up('brand')} placeholder="Renault" className="input-dark text-sm" /></div>
                  <div><label className="label-dark">Modèle *</label><input value={form.model} onChange={up('model')} placeholder="Clio 4" className="input-dark text-sm" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label-dark">Année</label><input type="number" value={form.year} onChange={up('year')} placeholder="2020" className="input-dark text-sm" /></div>
                  <div><label className="label-dark">Km</label><input type="number" value={form.mileage} onChange={up('mileage')} placeholder="85000" className="input-dark text-sm" /></div>
                  <div><label className="label-dark">Ville</label><input value={form.city} onChange={up('city')} placeholder="Oran" className="input-dark text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Carburant</label><select value={form.fuel} onChange={up('fuel')} className="input-dark text-sm">{FUELS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                  <div><label className="label-dark">Boîte</label><select value={form.transmission} onChange={up('transmission')} className="input-dark text-sm">{TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><label className="label-dark">Prix</label><input type="number" value={form.price} onChange={up('price')} placeholder="9500" className="input-dark text-sm" /></div>
                  <div><label className="label-dark">Devise</label><select value={form.currency} onChange={up('currency')} className="input-dark text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Statut</label><select value={form.status} onChange={up('status')} className="input-dark text-sm">{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                  <div><label className="label-dark">État général</label><input value={form.condition} onChange={up('condition')} placeholder="Très bon état" className="input-dark text-sm" /></div>
                </div>

                {/* Featured */}
                <button type="button" onClick={() => setForm(s => ({ ...s, featured: !s.featured }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${form.featured ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.04] border-white/[0.08]'}`}>
                  <span className="flex items-center gap-2 text-sm"><Star size={15} className={form.featured ? 'text-gold-400 fill-gold-400' : 'text-white/40'} /><span className={form.featured ? 'text-gold-400 font-semibold' : 'text-white/50'}>Mettre en avant</span></span>
                  <span className={`text-xs ${form.featured ? 'text-gold-400' : 'text-white/30'}`}>{form.featured ? 'OUI' : 'Non'}</span>
                </button>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-dark mb-0">Photos & vidéos ({photos.length}/12)</label>
                    <div className="flex items-center gap-2">
                      {photos.length > 0 && <span className="text-white/25 text-[10px]">1ère = principale</span>}
                      <button type="button" onClick={() => videoRef.current?.click()} className="text-[10px] text-gold-400 hover:text-gold-300 border border-gold-500/30 rounded-lg px-2 py-1">+ Vidéo</button>
                    </div>
                  </div>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0e0e0e] group">
                          {isVid(ph.url)
                            ? <><video src={ph.url} muted className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center text-white text-xl pointer-events-none">▶</span></>
                            : <img src={ph.url} alt={`p${i}`} className="w-full h-full object-cover" />}
                          {i === 0 && <div className="absolute top-1 left-1 bg-gold-500 text-noir-950 text-[8px] font-black px-1.5 py-0.5 rounded-md">{isVid(ph.url) ? 'VIDÉO' : 'PRINCIPALE'}</div>}
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

                <div><label className="label-dark">Description</label><textarea value={form.description} onChange={up('description')} rows={3} className="input-dark text-sm resize-none" placeholder="Équipements, historique, options..." /></div>

                <button onClick={handleSave} disabled={saving || uploading} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40">{saving ? 'Sauvegarde...' : editV ? 'Enregistrer' : 'Ajouter le véhicule'}</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
