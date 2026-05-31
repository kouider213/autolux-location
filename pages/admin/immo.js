import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Image, Building2 } from 'lucide-react';

const MAX_PHOTOS = 20;

const TYPES = ['appartement', 'villa', 'maison', 'local', 'bureau', 'terrain'];
const PRICE_TYPES = ['vente', 'location', 'mensuel'];

const emptyForm = {
  title: '', type: 'appartement', price: '', price_type: 'vente',
  surface: '', rooms: '', floor: '', address: '', district: '', city: 'Oran',
  description: '',
};

export default function AdminImmoPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editProp, setEditProp]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [photos, setPhotos]         = useState([]); // { url, file? }
  const [uploading, setUploading]   = useState(false);
  const fileInputRef                = useRef(null);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('properties').select('*, property_photos(url, position)').order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setForm(emptyForm); setEditProp(null); setPhotos([]); setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title, type: p.type, price: p.price || '', price_type: p.price_type,
      surface: p.surface || '', rooms: p.rooms || '', floor: p.floor || '',
      address: p.address || '', district: p.district || '', city: p.city || 'Oran',
      description: p.description || '',
    });
    setPhotos((p.property_photos || []).sort((a,b) => a.position - b.position).map(ph => ({ url: ph.url })));
    setEditProp(p);
    setShowForm(true);
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) { toast.error(`Maximum ${MAX_PHOTOS} photos`); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error('Photo trop lourde (max 15MB)'); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/upload-car-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, filename: `immo_${Date.now()}_${file.name}` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur upload');
      setPhotos(prev => [...prev, { url: data.url }]);
      toast.success('Photo ajoutée');
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Titre obligatoire'); return; }
    setSaving(true);
    try {
      let propId;
      const payload = {
        title: form.title.trim(), type: form.type, price_type: form.price_type,
        price: form.price ? Number(form.price) : null,
        surface: form.surface ? Number(form.surface) : null,
        rooms: form.rooms ? Number(form.rooms) : null,
        floor: form.floor ? Number(form.floor) : null,
        address: form.address || null, district: form.district || null,
        city: form.city || 'Oran', description: form.description || null,
      };

      if (editProp) {
        const { error } = await supabase.from('properties').update(payload).eq('id', editProp.id);
        if (error) throw error;
        propId = editProp.id;
      } else {
        const { data, error } = await supabase.from('properties').insert([payload]).select('id').single();
        if (error) throw error;
        propId = data.id;
      }

      // Save photos
      await supabase.from('property_photos').delete().eq('property_id', propId);
      if (photos.length > 0) {
        await supabase.from('property_photos').insert(
          photos.map((ph, i) => ({ property_id: propId, url: ph.url, position: i }))
        );
      }

      toast.success(editProp ? 'Bien modifié' : 'Bien ajouté');
      setShowForm(false);
      loadProperties();
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    await supabase.from('properties').delete().eq('id', p.id);
    toast.success('Bien supprimé');
    loadProperties();
  };

  const toggleAvailable = async (p) => {
    await supabase.from('properties').update({ available: !p.available }).eq('id', p.id);
    loadProperties();
  };

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  return (
    <>
      <Head><title>Immobilier — Fik Admin</title></Head>
      <AdminLayout title="Immobilier">
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-white/35 text-sm">{properties.length} bien{properties.length !== 1 ? 's' : ''}</p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm">
              <Plus size={15} />Ajouter un bien
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 text-center">
              <Building2 size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30 mb-4">Aucun bien immobilier. Ajoutez le premier.</p>
              <button onClick={openAdd} className="btn-gold py-2.5 px-6 text-sm"><Plus size={14} />Ajouter</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => {
                const mainPhoto = (p.property_photos || []).sort((a,b) => a.position - b.position)[0]?.url;
                return (
                  <div key={p.id} className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
                    {/* Photo */}
                    <div className="aspect-video bg-[#1a1a1a] relative">
                      {mainPhoto
                        ? <img src={mainPhoto} alt={p.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Building2 size={32} className="text-white/10" /></div>
                      }
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.available ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] bg-black/60 text-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm capitalize">
                          {p.type}
                        </span>
                      </div>
                      {(p.property_photos?.length || 0) > 1 && (
                        <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                          <Image size={9} />{p.property_photos.length}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 truncate">{p.title}</h3>
                      <p className="text-white/35 text-xs mb-3">{p.district || p.city}</p>
                      <div className="flex items-center justify-between mb-3">
                        {p.price
                          ? <div><span className="text-gold-400 font-bold">{Number(p.price).toLocaleString()}€</span><span className="text-white/25 text-xs"> / {p.price_type}</span></div>
                          : <span className="text-white/25 text-xs">Prix sur demande</span>
                        }
                        <div className="flex items-center gap-1 text-white/30 text-xs">
                          {p.surface && <span>{p.surface}m²</span>}
                          {p.rooms && <span>· {p.rooms}p</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs transition-all">
                          <Edit2 size={12} />Modifier
                        </button>
                        <button onClick={() => toggleAvailable(p)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs transition-all ${p.available ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                          {p.available ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => handleDelete(p)}
                          className="flex items-center justify-center py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all">
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#141414] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
                <h2 className="text-white font-bold">{editProp ? 'Modifier le bien' : 'Ajouter un bien'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* Infos principales */}
                <div className="space-y-3">
                  <div>
                    <label className="label-dark">Titre *</label>
                    <input type="text" value={form.title} onChange={set('title')} placeholder="Ex: Appartement F3 Centre-ville Oran" className="input-dark w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-dark">Type</label>
                      <select value={form.type} onChange={set('type')} className="input-dark w-full appearance-none">
                        {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-dark">Type de prix</label>
                      <select value={form.price_type} onChange={set('price_type')} className="input-dark w-full appearance-none">
                        {PRICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-dark">Prix (€)</label>
                      <input type="number" value={form.price} onChange={set('price')} placeholder="Ex: 25000" className="input-dark w-full" min="0" />
                    </div>
                    <div>
                      <label className="label-dark">Surface (m²)</label>
                      <input type="number" value={form.surface} onChange={set('surface')} placeholder="Ex: 85" className="input-dark w-full" min="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label-dark">Pièces</label>
                      <input type="number" value={form.rooms} onChange={set('rooms')} placeholder="3" className="input-dark w-full" min="1" />
                    </div>
                    <div>
                      <label className="label-dark">Étage</label>
                      <input type="number" value={form.floor} onChange={set('floor')} placeholder="2" className="input-dark w-full" min="0" />
                    </div>
                    <div>
                      <label className="label-dark">Ville</label>
                      <input type="text" value={form.city} onChange={set('city')} className="input-dark w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-dark">Quartier</label>
                      <input type="text" value={form.district} onChange={set('district')} placeholder="Ex: Hay Badr" className="input-dark w-full" />
                    </div>
                    <div>
                      <label className="label-dark">Adresse</label>
                      <input type="text" value={form.address} onChange={set('address')} placeholder="Rue, numéro..." className="input-dark w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="label-dark">Description</label>
                    <textarea value={form.description} onChange={set('description')} rows={3}
                      placeholder="Décrivez le bien, ses atouts, équipements..."
                      className="input-dark w-full resize-none" />
                  </div>
                </div>

                {/* Photos — max 20 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-dark mb-0">Photos ({photos.length}/{MAX_PHOTOS})</label>
                    {photos.length < MAX_PHOTOS && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-1.5 text-gold-400 text-xs hover:text-gold-300 disabled:opacity-40 transition-colors">
                        <Upload size={12} />{uploading ? 'Upload...' : 'Ajouter photo'}
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple
                    style={{ display: 'none' }}
                    onChange={async e => {
                      const files = Array.from(e.target.files || []);
                      for (const f of files.slice(0, MAX_PHOTOS - photos.length)) {
                        await uploadPhoto(f);
                      }
                    }} />

                  {photos.length === 0 ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video bg-white/[0.03] border-2 border-dashed border-white/[0.08] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold-500/30 transition-colors">
                      <Image size={24} className="text-white/20" />
                      <span className="text-white/25 text-sm">Cliquer pour ajouter des photos</span>
                      <span className="text-white/15 text-xs">Maximum {MAX_PHOTOS} photos</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] group">
                          <img src={ph.url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                          {i === 0 && <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-gold-500/80 text-noir-950 font-bold py-0.5">Principale</div>}
                          <button onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl bg-white/[0.03] border-2 border-dashed border-white/[0.08] flex items-center justify-center hover:border-gold-500/30 transition-colors">
                          <Plus size={18} className="text-white/20" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 btn-outline py-3">Annuler</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 btn-gold py-3 disabled:opacity-50">
                    {saving ? 'Enregistrement...' : (editProp ? 'Sauvegarder' : 'Ajouter')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
