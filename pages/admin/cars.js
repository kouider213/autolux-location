import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminCarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [saving, setSaving] = useState(false);

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
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Véhicules</h1>
              <p className="text-white/30 text-sm mt-1">{cars.length} véhicule(s) dans la flotte</p>
            </div>
            <button onClick={openAdd} className="btn-gold py-2.5 px-5 text-sm">
              + Ajouter
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cars.map(car => (
                <div key={car.id} className={`card-dark overflow-hidden transition-all duration-200 ${!car.available ? 'opacity-50' : ''}`}>
                  <div className="bg-noir-800 h-36 flex items-center justify-center overflow-hidden relative">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🚗</span>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        car.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {car.available ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1">{car.name}</h3>
                    <div className="flex justify-between text-xs mb-3">
                      <div>
                        <span className="text-white/30">Propriétaire : </span>
                        <span className="text-white/60">{car.base_price} €</span>
                      </div>
                      <div>
                        <span className="text-white/30">Revendeur : </span>
                        <span className="text-gold-500 font-semibold">{car.resale_price} €</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(car)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs py-1.5 rounded-lg transition-colors">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleToggle(car)} className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                        car.available
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}>
                        {car.available ? '⏸ Désact.' : '▶ Activer'}
                      </button>
                      <button onClick={() => handleDelete(car)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-2 py-1.5 rounded-lg transition-colors">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-white font-semibold text-lg">{editCar ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white text-xl">×</button>
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
                <div>
                  <label className="label-dark">URL de l'image</label>
                  <input value={form.image_url} onChange={up('image_url')} placeholder="https://..." className="input-dark" />
                </div>
                <div>
                  <label className="label-dark">Description</label>
                  <textarea value={form.description} onChange={up('description')} rows={2} className="input-dark resize-none" />
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3 disabled:opacity-50">
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
