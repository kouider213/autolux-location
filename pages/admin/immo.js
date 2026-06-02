import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Building2, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_PHOTOS = 20;
const TYPES = ['appartement', 'villa', 'maison', 'studio', 'local', 'bureau', 'terrain', 'duplex'];
const TRANSACTIONS = [
  { key: 'location', label: 'À louer' },
  { key: 'vente',    label: 'À vendre' },
];
const CURRENCIES = ['EUR', 'DZD'];
const STATUSES = [
  { key: 'disponible',  label: 'Disponible', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { key: 'loue',        label: 'Loué',       cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { key: 'vendu',       label: 'Vendu',      cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'coming_soon', label: 'Bientôt',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
];

const emptyForm = {
  title: '', type: 'appartement', transaction: 'location',
  price: '', currency: 'EUR', city: 'Oran', district: '', address: '',
  surface: '', rooms: '', bedrooms: '', bathrooms: '', floor: '',
  charges_included: false, charges_amount: '', deposit: '', min_duration: '',
  status: 'disponible', featured: false, description: '', conditions: '',
};

export default function AdminImmoPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editProp, setEditProp]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [photos, setPhotos]         = useState([]);
  const [uploading, setUploading]   = useState(false);
  const [photoIdx, setPhotoIdx]     = useState({});
  const fileInputRef                = useRef(null);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('properties')
      .select('*, property_photos(url, position)')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditProp(null); setPhotos([]); setShowForm(true); };

  const openEdit = (p) => {
    setForm({
      title: p.title, type: p.type, transaction: p.transaction || 'location',
      price: p.price || '', currency: p.currency || 'EUR', city: p.city || 'Oran',
      district: p.district || '', address: p.address || '',
      surface: p.surface || '', rooms: p.rooms || '', bedrooms: p.bedrooms || '',
      bathrooms: p.bathrooms || '', floor: p.floor ?? '',
      charges_included: !!p.charges_included, charges_amount: p.charges_amount || '',
      deposit: p.deposit || '', min_duration: p.min_duration || '',
      status: p.status || 'disponible', featured: !!p.featured,
      description: p.description || '', conditions: p.conditions || '',
    });
    setPhotos((p.property_photos || []).sort((a, b) => a.position - b.position).map(ph => ({ url: ph.url })));
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
        reader.onerror = rej; reader.readAsDataURL(file);
      });
      // API attend { base64, fileName, mimeType }
      const response = await fetch('/api/upload-car-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, fileName: `immo_${Date.now()}_${file.name}`, mimeType: file.type }),
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
  const movePhoto = (idx, dir) => setPhotos(prev => {
    const next = [...prev]; const to = idx + dir;
    if (to < 0 || to >= next.length) return prev;
    [next[idx], next[to]] = [next[to], next[idx]]; return next;
  });

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Titre obligatoire'); return; }
    setSaving(true);
    try {
      let propId;
      const num = (v) => v === '' || v == null ? null : Number(v);
      const payload = {
        title: form.title.trim(), type: form.type, transaction: form.transaction,
        // price_type gardé pour compat affichage existant
        price_type: form.transaction === 'vente' ? 'vente' : 'location',
        price: num(form.price), currency: form.currency,
        city: form.city || 'Oran', district: form.district || null, address: form.address || null,
        surface: num(form.surface), rooms: num(form.rooms),
        bedrooms: num(form.bedrooms), bathrooms: num(form.bathrooms), floor: num(form.floor),
        charges_included: form.charges_included, charges_amount: num(form.charges_amount),
        deposit: num(form.deposit), min_duration: form.min_duration || null,
        status: form.status, featured: form.featured,
        description: form.description || null, conditions: form.conditions || null,
        available: form.status === 'disponible', // compat ancien champ
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

  const toggleFeatured = async (p) => {
    await supabase.from('properties').update({ featured: !p.featured }).eq('id', p.id);
    loadProperties();
  };

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));
  const cur = (c) => c === 'DZD' ? 'DA' : '€';

  return (
    <>
      <Head><title>Immobilier — Fik Admin</title></Head>
      <AdminLayout title="Immobilier">
        <div className="space-y-5">

          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{properties.length} bien{properties.length !== 1 ? 's' : ''}</p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm flex items-center gap-2"><Plus size={15} /> Ajouter un bien</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : properties.length === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-16 text-center">
              <Building2 size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30 mb-4">Aucun bien immobilier. Ajoutez le premier.</p>
              <button onClick={openAdd} className="btn-gold py-2.5 px-6 text-sm"><Plus size={14} /> Ajouter</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map(p => {
                const all = (p.property_photos || []).sort((a, b) => a.position - b.position).map(ph => ph.url);
                const idx = photoIdx[p.id] || 0;
                const photo = all[idx];
                const st = STATUSES.find(s => s.key === p.status) || STATUSES[0];
                const txn = TRANSACTIONS.find(t => t.key === (p.transaction || 'location'));
                return (
                  <div key={p.id} className="relative bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                    <div className="h-40 bg-[#0e0e0e] relative group flex items-center justify-center overflow-hidden">
                      {photo ? <img src={photo} alt={p.title} className="w-full h-full object-cover" /> : <Building2 size={32} className="text-white/10" />}
                      {all.length > 1 && (
                        <>
                          <button onClick={() => setPhotoIdx(s => ({ ...s, [p.id]: Math.max(0, (s[p.id] || 0) - 1) }))} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><ChevronLeft size={14} /></button>
                          <button onClick={() => setPhotoIdx(s => ({ ...s, [p.id]: Math.min(all.length - 1, (s[p.id] || 0) + 1) }))} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><ChevronRight size={14} /></button>
                        </>
                      )}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${st.cls}`}>{st.label}</span>
                        {txn && <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/60 text-white/70 backdrop-blur-sm">{txn.label}</span>}
                      </div>
                      <button onClick={() => toggleFeatured(p)} className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center ${p.featured ? 'bg-gold-500 text-noir-950' : 'bg-black/50 text-white/50'}`}><Star size={13} className={p.featured ? 'fill-current' : ''} /></button>
                      {all.length > 0 && <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white/50 px-2 py-0.5 rounded-full flex items-center gap-1"><ImageIcon size={9} />{all.length}</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 truncate">{p.title}</h3>
                      <p className="text-white/35 text-xs mb-3 capitalize">{p.type} · {p.district || p.city}</p>
                      <div className="flex items-center justify-between mb-3">
                        {p.price ? <span className="text-gold-400 font-black text-base">{Number(p.price).toLocaleString()} {cur(p.currency)}</span> : <span className="text-white/25 text-xs">Sur demande</span>}
                        <div className="flex items-center gap-1 text-white/30 text-xs">{p.surface && <span>{p.surface}m²</span>}{p.rooms && <span>· {p.rooms}p</span>}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs transition-all"><Edit2 size={12} /> Modifier</button>
                        <button onClick={() => handleDelete(p)} className="flex items-center justify-center py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all"><Trash2 size={12} /></button>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#141414] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="text-white font-bold">{editProp ? 'Modifier le bien' : 'Ajouter un bien'}</h2>
                <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/50"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="label-dark">Titre *</label>
                  <input value={form.title} onChange={set('title')} placeholder="Ex: Appartement F3 — Hay Badr, Oran" className="input-dark w-full text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Type de bien</label><select value={form.type} onChange={set('type')} className="input-dark w-full text-sm capitalize">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="label-dark">Transaction</label><select value={form.transaction} onChange={set('transaction')} className="input-dark w-full text-sm">{TRANSACTIONS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}</select></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><label className="label-dark">Prix</label><input type="number" value={form.price} onChange={set('price')} placeholder="25000" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">Devise</label><select value={form.currency} onChange={set('currency')} className="input-dark w-full text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label-dark">Surface m²</label><input type="number" value={form.surface} onChange={set('surface')} placeholder="85" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">Pièces</label><input type="number" value={form.rooms} onChange={set('rooms')} placeholder="3" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">Étage</label><input type="number" value={form.floor} onChange={set('floor')} placeholder="2" className="input-dark w-full text-sm" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label-dark">Chambres</label><input type="number" value={form.bedrooms} onChange={set('bedrooms')} placeholder="2" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">SDB</label><input type="number" value={form.bathrooms} onChange={set('bathrooms')} placeholder="1" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">Ville</label><input value={form.city} onChange={set('city')} className="input-dark w-full text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Quartier</label><input value={form.district} onChange={set('district')} placeholder="Hay Badr" className="input-dark w-full text-sm" /></div>
                  <div><label className="label-dark">Adresse</label><input value={form.address} onChange={set('address')} placeholder="Rue, n°..." className="input-dark w-full text-sm" /></div>
                </div>

                {/* Location-specific */}
                {form.transaction === 'location' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label-dark">Caution</label><input type="number" value={form.deposit} onChange={set('deposit')} placeholder="2 mois" className="input-dark w-full text-sm" /></div>
                    <div><label className="label-dark">Durée min.</label><input value={form.min_duration} onChange={set('min_duration')} placeholder="1 an / longue durée" className="input-dark w-full text-sm" /></div>
                  </div>
                )}

                {/* Charges */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setForm(s => ({ ...s, charges_included: !s.charges_included }))}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${form.charges_included ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/[0.04] border-white/[0.08] text-white/50'}`}>
                    <span>Charges incluses</span><span>{form.charges_included ? 'OUI' : 'Non'}</span>
                  </button>
                  {!form.charges_included && <div><label className="label-dark">Charges (montant)</label><input type="number" value={form.charges_amount} onChange={set('charges_amount')} placeholder="optionnel" className="input-dark w-full text-sm" /></div>}
                </div>

                {/* Status + featured */}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-dark">Statut</label><select value={form.status} onChange={set('status')} className="input-dark w-full text-sm">{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                  <button type="button" onClick={() => setForm(s => ({ ...s, featured: !s.featured }))}
                    className={`mt-auto flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${form.featured ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'bg-white/[0.04] border-white/[0.08] text-white/50'}`}>
                    <span className="flex items-center gap-2"><Star size={14} className={form.featured ? 'fill-gold-400' : ''} />Mise en avant</span><span>{form.featured ? 'OUI' : 'Non'}</span>
                  </button>
                </div>

                <div><label className="label-dark">Description</label><textarea value={form.description} onChange={set('description')} rows={3} placeholder="Atouts, environnement, équipements..." className="input-dark w-full resize-none text-sm" /></div>
                <div><label className="label-dark">Conditions</label><textarea value={form.conditions} onChange={set('conditions')} rows={2} placeholder="Conditions de location/vente..." className="input-dark w-full resize-none text-sm" /></div>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label-dark mb-0">Photos ({photos.length}/{MAX_PHOTOS})</label>
                    {photos.length > 0 && <span className="text-white/25 text-[10px]">1ère = principale</span>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={async e => { const files = Array.from(e.target.files || []); for (const f of files.slice(0, MAX_PHOTOS - photos.length)) await uploadPhoto(f); }} />
                  {photos.length === 0 ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-white/[0.03] border-2 border-dashed border-white/[0.08] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold-500/30 transition-colors">
                      <ImageIcon size={24} className="text-white/20" />
                      <span className="text-white/25 text-sm">{uploading ? 'Upload...' : 'Cliquer pour ajouter des photos'}</span>
                      <span className="text-white/15 text-xs">Jusqu'à {MAX_PHOTOS} photos</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((ph, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0e0e0e] group">
                          <img src={ph.url} alt={`p${i}`} className="w-full h-full object-cover" />
                          {i === 0 && <div className="absolute top-1 left-1 bg-gold-500 text-noir-950 text-[7px] font-black px-1.5 py-0.5 rounded">PRINCIPALE</div>}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {i > 0 && <button onClick={() => movePhoto(i, -1)} className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><ChevronLeft size={11} className="text-white" /></button>}
                            <button onClick={() => removePhoto(i)} className="w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center"><X size={10} className="text-white" /></button>
                            {i < photos.length - 1 && <button onClick={() => movePhoto(i, 1)} className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><ChevronRight size={11} className="text-white" /></button>}
                          </div>
                        </div>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl bg-white/[0.03] border-2 border-dashed border-white/[0.08] flex items-center justify-center hover:border-gold-500/30 transition-colors"><Plus size={18} className="text-white/20" /></button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 btn-outline py-3">Annuler</button>
                  <button onClick={handleSave} disabled={saving || uploading} className="flex-1 btn-gold py-3 disabled:opacity-50">{saving ? 'Enregistrement...' : (editProp ? 'Sauvegarder' : 'Ajouter')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
