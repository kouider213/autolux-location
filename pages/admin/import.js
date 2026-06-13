import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Ship, Loader2, Upload, Trash2, X, Copy, ExternalLink, Save, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { ALL_IMPORT_STATUSES, statusLabel } from '../../lib/importStatus';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const sym = (c) => (c === 'DZD' || c === 'DA' ? 'DA' : '€');

const STATUS_CLS = {
  REQUESTED: 'bg-amber-500/15 text-amber-400', SEARCHING: 'bg-amber-500/15 text-amber-400',
  FOUND: 'bg-blue-500/15 text-blue-400', PURCHASED: 'bg-blue-500/15 text-blue-400',
  SHIPPING: 'bg-indigo-500/15 text-indigo-400', CUSTOMS: 'bg-indigo-500/15 text-indigo-400',
  READY: 'bg-emerald-500/15 text-emerald-400', DELIVERED: 'bg-white/10 text-white/50',
  CANCELLED: 'bg-red-500/15 text-red-400',
};

export default function AdminImportPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('import_orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    if (!q.trim()) return true;
    const s = `${o.order_ref} ${o.client_name} ${o.client_phone} ${o.vehicle_brand} ${o.vehicle_model}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <AdminLayout title="Importation véhicules">
      <Head><title>Importation — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><Ship size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Suivi d'importation</h1>
            <p className="text-white/30 text-sm">Gérez les commandes d'importation A→Z — le client suit avec son numéro</p>
          </div>
          <div className="ml-auto relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…"
              className="bg-white/[0.04] border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none w-48" />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-gold-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-12 text-center text-white/30 text-sm">
            Aucune commande d'importation pour l'instant.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => (
              <OrderCard key={o.id} order={o} open={openId === o.id}
                onToggle={() => setOpenId(openId === o.id ? null : o.id)}
                onSaved={(updated) => setOrders(list => list.map(x => x.id === updated.id ? updated : x))}
                onDeleted={(id) => setOrders(list => list.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function OrderCard({ order, open, onToggle, onSaved, onDeleted }) {
  const [form, setForm] = useState(order);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setForm(order); }, [order.id]);

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const photos = Array.isArray(form.photos) ? form.photos : [];

  const save = async (patch) => {
    setSaving(true);
    try {
      const r = await fetch('/api/update-import-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, patch }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'erreur');
      setForm(d.order); onSaved(d.order);
      toast.success('Enregistré');
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const changeStatus = (status) => { setForm(s => ({ ...s, status })); save({ status }); };

  const saveAll = () => save({
    client_name: form.client_name, client_phone: form.client_phone, client_email: form.client_email,
    client_city: form.client_city, vehicle_brand: form.vehicle_brand, vehicle_model: form.vehicle_model,
    vehicle_year: form.vehicle_year, vehicle_type: form.vehicle_type, vehicle_fuel: form.vehicle_fuel,
    vehicle_gearbox: form.vehicle_gearbox, vehicle_color: form.vehicle_color, vehicle_specs: form.vehicle_specs,
    budget: form.budget, currency: form.currency, country_origin: form.country_origin, deadline: form.deadline,
    notes_client: form.notes_client, notes_admin: form.notes_admin,
  });

  const uploadPhotos = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const urls = [...photos];
    for (const file of Array.from(files)) {
      try {
        const base64 = await new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(String(fr.result).split(',')[1]);
          fr.onerror = rej; fr.readAsDataURL(file);
        });
        const r = await fetch('/api/upload-car-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
        });
        const d = await r.json();
        if (d.url) urls.push(d.url);
      } catch { toast.error('Échec upload ' + file.name); }
    }
    setUploading(false);
    await save({ photos: urls });
  };

  const removePhoto = (url) => save({ photos: photos.filter(u => u !== url) });

  const copyLink = () => {
    navigator.clipboard.writeText(`https://fikconciergerie.com/suivi-import/${order.order_ref}`);
    toast.success('Lien de suivi copié');
  };

  const del = async () => {
    if (!confirm(`Supprimer définitivement la commande ${order.order_ref} ?`)) return;
    const { error } = await supabase.from('import_orders').delete().eq('id', order.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Commande supprimée');
    onDeleted?.(order.id);
  };

  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Résumé cliquable */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02]">
        {photos[0] ? (
          <img src={photos[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0"><Ship size={18} className="text-white/20" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm truncate">{[form.vehicle_brand, form.vehicle_model].filter(Boolean).join(' ') || 'Véhicule à définir'}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_CLS[form.status] || 'bg-white/10 text-white/40'}`}>{statusLabel(form.status, 'fr')}</span>
          </div>
          <p className="text-white/35 text-xs mt-0.5">{order.order_ref} · {form.client_name || '—'} · {form.client_phone || ''}</p>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] p-5 space-y-5">
          {/* Lien suivi + statut */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2"><Copy size={13} />Copier lien suivi</button>
            <a href={`/suivi-import/${order.order_ref}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2"><ExternalLink size={13} />Voir la page client</a>
          </div>

          {/* Statut */}
          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Statut de l'importation</label>
            <div className="flex flex-wrap gap-2">
              {ALL_IMPORT_STATUSES.map(s => (
                <button key={s.key} onClick={() => changeStatus(s.key)} disabled={saving}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                    form.status === s.key ? 'bg-gold-500 text-noir-950 border-gold-500' : 'text-white/55 border-white/10 hover:border-white/25'
                  }`}>{s.fr}</button>
              ))}
            </div>
            <p className="text-white/25 text-[11px] mt-2">Changer le statut envoie automatiquement un email au client (si email fourni).</p>
          </div>

          {/* Photos */}
          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Photos du véhicule (visibles par le client)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.06] group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(url)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white/80 hover:text-red-400"><X size={13} /></button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-gold-500/40 flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-gold-400 transition-colors">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                <span className="text-[10px] mt-1">Ajouter</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => uploadPhotos(e.target.files)} />
              </label>
            </div>
          </div>

          {/* Infos véhicule */}
          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Informations véhicule</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <input value={form.vehicle_brand || ''} onChange={set('vehicle_brand')} placeholder="Marque" className={inputCls} />
              <input value={form.vehicle_model || ''} onChange={set('vehicle_model')} placeholder="Modèle" className={inputCls} />
              <input value={form.vehicle_year || ''} onChange={set('vehicle_year')} placeholder="Année" className={inputCls} />
              <input value={form.vehicle_type || ''} onChange={set('vehicle_type')} placeholder="Type" className={inputCls} />
              <input value={form.vehicle_fuel || ''} onChange={set('vehicle_fuel')} placeholder="Carburant" className={inputCls} />
              <input value={form.vehicle_gearbox || ''} onChange={set('vehicle_gearbox')} placeholder="Boîte" className={inputCls} />
              <input value={form.vehicle_color || ''} onChange={set('vehicle_color')} placeholder="Couleur" className={inputCls} />
              <input value={form.country_origin || ''} onChange={set('country_origin')} placeholder="Pays d'origine" className={inputCls} />
              <input value={form.deadline || ''} onChange={set('deadline')} placeholder="Délai" className={inputCls} />
              <input type="number" value={form.budget || ''} onChange={set('budget')} placeholder="Budget" className={inputCls} />
              <select value={form.currency || 'EUR'} onChange={set('currency')} className={inputCls}><option value="EUR">EUR</option><option value="DZD">DZD</option></select>
            </div>
            <textarea value={form.vehicle_specs || ''} onChange={set('vehicle_specs')} rows={2} placeholder="Options / précisions" className={`${inputCls} resize-none mt-2.5`} />
          </div>

          {/* Client */}
          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Client</label>
            <div className="grid grid-cols-2 gap-2.5">
              <input value={form.client_name || ''} onChange={set('client_name')} placeholder="Nom" className={inputCls} />
              <input value={form.client_phone || ''} onChange={set('client_phone')} placeholder="Téléphone" className={inputCls} />
              <input value={form.client_email || ''} onChange={set('client_email')} placeholder="Email" className={inputCls} />
              <input value={form.client_city || ''} onChange={set('client_city')} placeholder="Ville" className={inputCls} />
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-gold-400/80 text-xs font-semibold mb-2 block">Message au client (visible sur le suivi)</label>
              <textarea value={form.notes_client || ''} onChange={set('notes_client')} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="text-white/40 text-xs font-semibold mb-2 block">Notes privées (jamais visibles)</label>
              <textarea value={form.notes_admin || ''} onChange={set('notes_admin')} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}Enregistrer les modifications
            </button>
            <button onClick={del} className="flex items-center gap-2 text-sm font-semibold text-red-400/70 hover:text-red-400 border border-red-500/15 hover:border-red-500/30 rounded-xl px-4 py-2.5">
              <Trash2 size={15} />Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
