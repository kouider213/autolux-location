import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Car, Plus, Edit2, Trash2, Eye, EyeOff, Camera, ImageIcon, Loader2, X, ChevronLeft, ChevronRight, GripVertical, Star } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { uploadImageFile } from '../../lib/photoUpload';

const CATEGORIES   = ['citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'];
const FUELS        = ['essence', 'diesel', 'hybride', 'électrique'];
const TRANSMISSIONS = ['manuelle', 'automatique'];

const emptyForm = {
  name: '', base_price: '', resale_price: '', currency: 'DZD',
  category: 'berline', seats: 5, fuel: 'essence',
  transmission: 'manuelle', description: '', featured: false,
};
const sym = (c) => (c === 'EUR' ? '€' : 'DA');

export default function AdminCarsPage() {
  const [cars, setCars]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [photos, setPhotos]     = useState([]); // [{url}]
  const fileInputRef            = useRef(null);
  const cameraInputRef          = useRef(null);

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    const { data } = await supabase
      .from('cars')
      .select('*, car_photos(url, position)')
      .order('name');
    setCars(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setForm(emptyForm); setEditCar(null); setPhotos([]); setShowForm(true);
  };

  const openEdit = (car) => {
    setForm({
      name: car.name, base_price: car.base_price, resale_price: car.resale_price, currency: car.currency || 'DZD', featured: !!car.featured,
      category: car.category, seats: car.seats, fuel: car.fuel,
      transmission: car.transmission, description: car.description || '',
    });
    const sorted = (car.car_photos || []).sort((a, b) => a.position - b.position);
    setPhotos(sorted.map(p => ({ url: p.url })));
    setEditCar(car);
    setShowForm(true);
  };

  const uploadPhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    let added = 0, errors = 0;
    for (const file of files) {
      if (photos.length + added >= 10) { toast.error('Maximum 10 photos'); break; }
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (added) toast.success(`${added} photo${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}`);
    if (errors) toast.error(`${errors} photo${errors > 1 ? 's' : ''} en échec`);
  };

  const videoInputRef = useRef(null);
  const isVid = (u) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u || '');
  const uploadVideo = async (file) => {
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) { toast.error('Vidéo trop lourde (max 80MB)'); return; }
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const path = `cars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('videos').upload(path, file, { contentType: file.type || 'video/mp4', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('videos').getPublicUrl(path);
      setPhotos(prev => [...prev, { url: data.publicUrl }]);
      toast.success('Vidéo ajoutée');
    } catch (err) { toast.error('Erreur vidéo: ' + err.message); }
    finally { setUploading(false); if (videoInputRef.current) videoInputRef.current.value = ''; }
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));
  const movePhoto = (idx, dir) => {
    setPhotos(prev => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.base_price || !form.resale_price) {
      toast.error('Nom, prix propriétaire et prix client obligatoires');
      return;
    }
    if (Number(form.resale_price) < Number(form.base_price)) {
      toast.error('Prix client doit être ≥ prix propriétaire');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      base_price:    Number(form.base_price),
      resale_price:  Number(form.resale_price),
      currency:      form.currency,
      featured:      form.featured,
      category:      form.category,
      seats:         Number(form.seats),
      fuel:          form.fuel,
      transmission:  form.transmission,
      image_url:     photos[0]?.url || null,
      description:   form.description || null,
    };
    let error, carId;
    if (editCar) {
      ({ error } = await supabase.from('cars').update(payload).eq('id', editCar.id));
      carId = editCar.id;
    } else {
      const { data, error: e } = await supabase.from('cars').insert([payload]).select('id').single();
      error = e; carId = data?.id;
    }
    if (error) { toast.error('Erreur sauvegarde'); setSaving(false); return; }

    // Save photos
    if (carId) {
      await supabase.from('car_photos').delete().eq('car_id', carId);
      if (photos.length > 0) {
        await supabase.from('car_photos').insert(
          photos.map((ph, i) => ({ car_id: carId, url: ph.url, position: i }))
        );
      }
    }

    toast.success(editCar ? 'Véhicule modifié' : 'Véhicule ajouté');
    setShowForm(false);
    loadCars();
    setSaving(false);
  };

  const handleToggle = async (car) => {
    await supabase.from('cars').update({ available: !car.available }).eq('id', car.id);
    toast.success(car.available ? 'Désactivé' : 'Activé');
    loadCars();
  };

  const handleDelete = async (car) => {
    if (!confirm(`Supprimer ${car.name} ?`)) return;
    await supabase.from('cars').delete().eq('id', car.id);
    toast.success('Supprimé'); loadCars();
  };

  const up = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const marge = form.base_price && form.resale_price
    ? Number(form.resale_price) - Number(form.base_price) : null;

  // ── Car card photo carousel state
  const [photoIdx, setPhotoIdx] = useState({});

  return (
    <>
      <Head><title>Véhicules — Fik Admin</title></Head>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => uploadPhotos(e.target.files)} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple
        className="hidden" onChange={e => uploadPhotos(e.target.files)} />
      <input ref={videoInputRef} type="file" accept="video/*"
        className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(f); }} />

      <AdminLayout title="Véhicules">
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              {cars.length} véhicule{cars.length !== 1 ? 's' : ''}
            </p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm flex items-center gap-2">
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map(car => {
                const allPhotos = (car.car_photos || [])
                  .sort((a, b) => a.position - b.position)
                  .map(p => p.url);
                if (car.image_url && !allPhotos.includes(car.image_url)) {
                  allPhotos.unshift(car.image_url);
                }
                const idx = photoIdx[car.id] || 0;
                const currentPhoto = allPhotos[idx];

                return (
                  <div key={car.id}
                    className={`relative bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden transition-all hover:border-white/15 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] ${!car.available ? 'opacity-60' : ''}`}>

                    {/* Photo */}
                    <div className="h-44 bg-[#0e0e0e] flex items-center justify-center overflow-hidden relative group">
                      {currentPhoto
                        ? <img src={currentPhoto} alt={car.name} className="w-full h-full object-cover" />
                        : <Car size={40} className="text-white/10" />
                      }

                      {/* Photo navigation */}
                      {allPhotos.length > 1 && (
                        <>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [car.id]: Math.max(0, (p[car.id] || 0) - 1) }))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft size={14} />
                          </button>
                          <button onClick={() => setPhotoIdx(p => ({ ...p, [car.id]: Math.min(allPhotos.length - 1, (p[car.id] || 0) + 1) }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={14} />
                          </button>
                          {/* Dots */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {allPhotos.map((_, i) => (
                              <button key={i}
                                onClick={() => setPhotoIdx(p => ({ ...p, [car.id]: i }))}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/30'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          car.available
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/25'
                            : 'bg-red-500/20 text-red-400 border-red-500/25'
                        }`}>
                          {car.available ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {/* Photo count */}
                      {allPhotos.length > 1 && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[10px] bg-black/60 text-white/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                            {idx + 1}/{allPhotos.length}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141414] to-transparent" />
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-bold text-sm leading-tight">{car.name}</h3>
                          {car.category && (
                            <span className="text-white/30 text-[10px] capitalize">{car.category}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gold-400 font-black text-base tabular-nums leading-tight">{Number(car.resale_price).toLocaleString('fr-FR')} {sym(car.currency)}</p>
                          <p className="text-white/25 text-[10px]">/ jour client</p>
                        </div>
                      </div>

                      {/* Prix breakdown */}
                      <div className="flex items-center justify-between mb-3 bg-white/[0.04] rounded-xl px-3 py-2">
                        <div className="text-center">
                          <p className="text-white/25 text-[9px] uppercase tracking-wide">Proprio</p>
                          <p className="text-white/55 text-xs font-semibold tabular-nums">{Number(car.base_price).toLocaleString('fr-FR')} {sym(car.currency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/25 text-[9px] uppercase tracking-wide">Marge</p>
                          <p className="text-emerald-400 text-xs font-bold tabular-nums">+{(car.resale_price - car.base_price).toLocaleString('fr-FR')} {sym(car.currency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/25 text-[9px] uppercase tracking-wide">Photos</p>
                          <p className="text-white/55 text-xs font-semibold">{allPhotos.length}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(car)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/10 text-white/55 hover:text-white text-xs py-2.5 rounded-xl transition-all">
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button onClick={() => handleToggle(car)}
                          className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            car.available
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                          }`}>
                          {car.available ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => handleDelete(car)}
                          className="flex items-center justify-center px-2.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modal ajout/modification ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowForm(false)}>
            <div className="bg-[#141414] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-white font-bold text-base">
                    {editCar ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
                  </h2>
                  {editCar && <p className="text-white/30 text-xs mt-0.5">{editCar.name}</p>}
                </div>
                <button onClick={() => setShowForm(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/50 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* Nom */}
                <div>
                  <label className="label-dark">Nom du véhicule *</label>
                  <input value={form.name} onChange={up('name')} placeholder="Ex: Renault Clio 5"
                    className="input-dark text-sm" />
                </div>

                {/* Devise */}
                <div>
                  <label className="label-dark">Devise</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['DZD', 'EUR'].map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, currency: c }))}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${form.currency === c ? 'bg-gold-500 text-noir-950' : 'bg-white/[0.04] border border-white/[0.08] text-white/50'}`}>
                        {c === 'DZD' ? 'Dinar (DA)' : 'Euro (€)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mise en avant */}
                <button type="button" onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${form.featured ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/[0.04] border-white/[0.08]'}`}>
                  <span className="flex items-center gap-2 text-sm"><Star size={15} className={form.featured ? 'text-gold-400 fill-gold-400' : 'text-white/40'} /><span className={form.featured ? 'text-gold-400 font-semibold' : 'text-white/50'}>Mettre en avant (carousel accueil)</span></span>
                  <span className={`text-xs ${form.featured ? 'text-gold-400' : 'text-white/30'}`}>{form.featured ? 'OUI' : 'Non'}</span>
                </button>

                {/* Prix */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-dark">Prix proprio ({sym(form.currency)}/j) *</label>
                    <input type="number" value={form.base_price} onChange={up('base_price')} placeholder={form.currency === 'DZD' ? '6000' : '44'}
                      className="input-dark text-sm" />
                  </div>
                  <div>
                    <label className="label-dark">Prix client ({sym(form.currency)}/j) *</label>
                    <input type="number" value={form.resale_price} onChange={up('resale_price')} placeholder={form.currency === 'DZD' ? '8000' : '55'}
                      className="input-dark text-sm" />
                  </div>
                </div>

                {/* Marge preview */}
                {marge !== null && (
                  <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${
                    marge >= 0
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <span className="text-white/50">Marge / jour</span>
                    <span className={`font-bold tabular-nums ${marge >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {marge >= 0 ? '+' : ''}{marge.toLocaleString('fr-FR')} {sym(form.currency)}
                    </span>
                  </div>
                )}

                {/* Catégorie + places */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-dark">Catégorie</label>
                    <select value={form.category} onChange={up('category')} className="input-dark text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Places</label>
                    <input type="number" value={form.seats} onChange={up('seats')} min={2} max={9}
                      className="input-dark text-sm" />
                  </div>
                </div>

                {/* Carburant + boîte */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-dark">Carburant</label>
                    <select value={form.fuel} onChange={up('fuel')} className="input-dark text-sm">
                      {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Boîte</label>
                    <select value={form.transmission} onChange={up('transmission')} className="input-dark text-sm">
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Photos multiples */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-dark mb-0">Photos & vidéos ({photos.length}/10)</label>
                    <div className="flex items-center gap-2">
                      {photos.length > 0 && <span className="text-white/25 text-[10px]">1ère = principale</span>}
                      <button type="button" onClick={() => videoInputRef.current?.click()} className="text-[10px] text-gold-400 hover:text-gold-300 border border-gold-500/30 rounded-lg px-2 py-1">+ Vidéo</button>
                    </div>
                  </div>

                  {/* Grid photos existantes */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0e0e0e] group">
                          {isVid(ph.url)
                            ? <><video src={ph.url} muted className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center text-white text-xl pointer-events-none">▶</span></>
                            : <img src={ph.url} alt={`photo ${i+1}`} className="w-full h-full object-cover" />}
                          {/* Badge principale */}
                          {i === 0 && (
                            <div className="absolute top-1 left-1 bg-gold-500 text-noir-950 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                              {isVid(ph.url) ? 'VIDÉO' : 'PRINCIPALE'}
                            </div>
                          )}
                          {/* Actions overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {i > 0 && (
                              <button onClick={() => movePhoto(i, -1)}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center">
                                <ChevronLeft size={12} className="text-white" />
                              </button>
                            )}
                            <button onClick={() => removePhoto(i)}
                              className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center">
                              <Trash2 size={11} className="text-white" />
                            </button>
                            {i < photos.length - 1 && (
                              <button onClick={() => movePhoto(i, 1)}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center">
                                <ChevronRight size={12} className="text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload buttons */}
                  {photos.length < 10 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" disabled={uploading} onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white/55 hover:text-white text-sm py-3 rounded-xl transition-all disabled:opacity-40">
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                        {uploading ? 'Import...' : 'Caméra'}
                      </button>
                      <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white/55 hover:text-white text-sm py-3 rounded-xl transition-all disabled:opacity-40">
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                        {uploading ? 'Import...' : 'Galerie'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="label-dark">Description</label>
                  <textarea value={form.description} onChange={up('description')} rows={2}
                    className="input-dark text-sm resize-none" placeholder="Options, équipements..." />
                </div>

                {/* Save */}
                <button onClick={handleSave} disabled={saving || uploading}
                  className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40">
                  {saving ? 'Sauvegarde...' : editCar ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
                </button>

              </div>
            </div>
          </div>
        )}

      </AdminLayout>
    </>
  );
}
