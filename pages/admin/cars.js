import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Car, Plus, Edit2, Trash2, Eye, EyeOff, Camera, ImageIcon, Loader2, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminCarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const emptyForm = {
    name: '', base_price: '', resale_price: '',
    category: 'berline', seats: 5, fuel: 'essence',
    transmission: 'manuelle', image_url: '', description: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('name');
    setCars(data || []);
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyForm); setEditCar(null); setShowForm(true); };
  const openEdit = (car) => {
    setForm({
      name: car.name, base_price: car.base_price, resale_price: car.resale_price,
      category: car.category, seats: car.seats, fuel: car.fuel,
      transmission: car.transmission, image_url: car.image_url || '', description: car.description || '',
    });
    setEditCar(car);
    setShowForm(true);
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo trop lourde (max 10MB)'); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/upload-car-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setForm(f => ({ ...f, image_url: data.url }));
      toast.success('Photo importée ✓');
    } catch (err) {
      toast.error('Erreur upload: ' + (err.message || String(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.base_price || !form.resale_price) {
      toast.error('Nom, prix propriétaire et prix revendeur sont obligatoires');
      return;
    }
    if (Number(form.resale_price) < Number(form.base_price)) {
      toast.error('Le prix revendeur doit être supérieur ou égal au prix propriétaire');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      base_price: Number(form.base_price),
      resale_price: Number(form.resale_price),
      category: form.category,
      seats: Number(form.seats),
      fuel: form.fuel,
      transmission: form.transmission,
      image_url: form.image_url || null,
      description: form.description || null,
    };
    let error;
    if (editCar) {
      ({ error } = await supabase.from('cars').update(payload).eq('id', editCar.id));
    } else {
      ({ error } = await supabase.from('cars').insert([payload]));
    }
    setSaving(false);
    if (error) { toast.error('Erreur lors de la sauvegarde'); return; }
    toast.success(editCar ? 'Véhicule modifié' : 'Véhicule ajouté');
    setShowForm(false);
    loadCars();
  };

  const handleToggle = async (car) => {
    const { error } = await supabase
      .from('cars').update({ available: !car.available }).eq('id', car.id);
    if (!error) {
      toast.success(car.available ? 'Véhicule désactivé' : 'Véhicule activé');
      loadCars();
    }
  };

  const handleDelete = async (car) => {
    if (!confirm(`Supprimer ${car.name} ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from('cars').delete().eq('id', car.id);
    if (error) toast.error('Erreur suppression');
    else { toast.success('Véhicule supprimé'); loadCars(); }
  };

  const up = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <Head><title>Véhicules — Fik Conciergerie Admin</title></Head>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => uploadPhoto(e.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => uploadPhoto(e.target.files?.[0])}
      />
      <AdminLayout title="Véhicules">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-white/35 text-sm">{cars.length} véhicule{cars.length !== 1 ? 's' : ''} dans la flotte</p>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm flex items-center gap-2">
              <Plus size={15} /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map(car => (
                <div key={car.id} className={`bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden transition-all hover:border-white/15 ${!car.available ? 'opacity-60' : ''}`}>
                  {/* Image */}
                  <div className="h-40 bg-[#0e0e0e] flex items-center justify-center overflow-hidden relative">
                    {car.image_url
                      ? <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                      : <Car size={36} className="text-white/10" />
                    }
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        car.available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/20'
                      }`}>
                        {car.available ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {car.category && (
                      <div className="absolute bottom-2 right-2">
                        <span className="text-[10px] bg-black/60 text-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm capitalize">{car.category}</span>
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 truncate">{car.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center">
                        <p className="text-white/25 text-[10px] uppercase tracking-wide">Proprio</p>
                        <p className="text-white/60 text-sm font-semibold tabular-nums">{car.base_price} €</p>
                      </div>
                      <div className="w-px h-6 bg-white/[0.06]" />
                      <div className="text-center">
                        <p className="text-white/25 text-[10px] uppercase tracking-wide">Client</p>
                        <p className="text-gold-400 text-sm font-bold tabular-nums">{car.resale_price} €</p>
                      </div>
                      <div className="w-px h-6 bg-white/[0.06]" />
                      <div className="text-center">
                        <p className="text-white/25 text-[10px] uppercase tracking-wide">Marge</p>
                        <p className="text-emerald-400 text-sm font-semibold tabular-nums">+{car.resale_price - car.base_price} €</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(car)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/10 text-white/55 hover:text-white text-xs py-2 rounded-xl transition-colors">
                        <Edit2 size={12} /> Modifier
                      </button>
                      <button onClick={() => handleToggle(car)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                          car.available
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}>
                        {car.available ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => handleDelete(car)}
                        className="flex items-center justify-center px-2.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-[#141414] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-[#141414]">
                <h2 className="text-white font-bold text-base">{editCar ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/50 hover:text-white transition-all"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label-dark">Nom du véhicule *</label>
                  <input value={form.name} onChange={up('name')} placeholder="Ex: Clio 5" className="input-dark" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-dark">Prix propriétaire (€/j) *</label>
                    <input type="number" value={form.base_price} onChange={up('base_price')} placeholder="Ex: 37" className="input-dark" />
                  </div>
                  <div>
                    <label className="label-dark">Prix revendeur (€/j) *</label>
                    <input type="number" value={form.resale_price} onChange={up('resale_price')} placeholder="Ex: 45" className="input-dark" />
                  </div>
                </div>
                {form.base_price && form.resale_price && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 text-sm">
                    <span className="text-white/40">Marge / jour : </span>
                    <span className="text-emerald-400 font-bold">+{(form.resale_price - form.base_price).toFixed(0)} €</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-dark">Catégorie</label>
                    <select value={form.category} onChange={up('category')} className="input-dark">
                      {['citadine', 'berline', 'SUV', 'familiale', 'utilitaire', 'premium'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Places</label>
                    <input type="number" value={form.seats} onChange={up('seats')} min={2} max={9} className="input-dark" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-dark">Carburant</label>
                    <select value={form.fuel} onChange={up('fuel')} className="input-dark">
                      {['essence', 'diesel', 'hybride', 'électrique'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Boîte</label>
                    <select value={form.transmission} onChange={up('transmission')} className="input-dark">
                      <option value="manuelle">Manuelle</option>
                      <option value="automatique">Automatique</option>
                    </select>
                  </div>
                </div>

                {/* Photo upload */}
                <div>
                  <label className="label-dark">Photo du véhicule</label>
                  {form.image_url ? (
                    <div className="relative rounded-xl overflow-hidden h-44 bg-noir-800 mb-3">
                      <img src={form.image_url} alt="aperçu" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-500/80 transition-colors"
                      >×</button>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button type="button" disabled={uploading} onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white text-sm py-3 rounded-xl transition-colors disabled:opacity-50">
                      {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                      {uploading ? 'Import...' : 'Appareil photo'}
                    </button>
                    <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white text-sm py-3 rounded-xl transition-colors disabled:opacity-50">
                      {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                      {uploading ? 'Import...' : 'Galerie photos'}
                    </button>
                  </div>
                  <input
                    value={form.image_url}
                    onChange={up('image_url')}
                    placeholder="Ou colle une URL d'image"
                    className="input-dark text-sm"
                  />
                </div>

                <div>
                  <label className="label-dark">Description</label>
                  <textarea value={form.description} onChange={up('description')} rows={2} className="input-dark resize-none" />
                </div>
                <button onClick={handleSave} disabled={saving || uploading} className="btn-gold w-full py-3 disabled:opacity-50">
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
