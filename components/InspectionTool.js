import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Camera, ImagePlus, Loader2, Trash2, AlertTriangle, Check, MapPin } from 'lucide-react';
import { uploadImageFile } from '../lib/photoUpload';

const SEV = {
  leger: { label: 'Légère', color: '#eab308' },
  moyen: { label: 'Moyenne', color: '#f59e0b' },
  grave: { label: 'Grave', color: '#ef4444' },
};

// Outil d'état des lieux : multi-photos + marquage manuel des défauts (tap sur la photo).
export default function InspectionTool({ booking, onClose }) {
  const [stateType, setStateType] = useState('before');     // 'before' | 'after'
  const [photos, setPhotos]       = useState([]);           // [{ url }]
  const [markers, setMarkers]     = useState([]);           // [{ id, photo_index, x, y, severity, label }]
  const [accident, setAccident]   = useState(false);
  const [notes, setNotes]         = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [existing, setExisting]   = useState([]);
  const [activePhoto, setActive]  = useState(0);
  const fileRef = useRef(null);
  const camRef  = useRef(null);

  // Charge les états des lieux déjà enregistrés
  const loadExisting = () => {
    fetch(`/api/inspection?bookingId=${booking.id}`)
      .then(r => r.json()).then(d => { if (d.ok) setExisting(d.inspections); }).catch(() => {});
  };
  useEffect(loadExisting, [booking.id]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadImageFile(f);
        setPhotos(prev => [...prev, { url }]);
      }
      toast.success(`${files.length} photo(s) ajoutée(s)`);
    } catch (err) { toast.error('Erreur upload : ' + err.message); }
    setUploading(false);
    e.target.value = '';
  };

  // Tap sur la photo → place un marqueur de défaut
  const onPhotoTap = (photoIndex, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const id = Date.now() + Math.random();
    setMarkers(prev => [...prev, { id, photo_index: photoIndex, x, y, severity: 'leger', label: '' }]);
  };

  const updateMarker = (id, patch) => setMarkers(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  const removeMarker = (id) => setMarkers(prev => prev.filter(m => m.id !== id));
  const removePhoto  = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setMarkers(prev => prev.filter(m => m.photo_index !== idx).map(m => m.photo_index > idx ? { ...m, photo_index: m.photo_index - 1 } : m));
    setActive(0);
  };

  const save = async () => {
    if (photos.length === 0) { toast.error('Ajoute au moins une photo'); return; }
    if (markers.some(m => !m.label.trim())) { toast.error('Décris chaque défaut marqué (ex: rayure jante avant droite)'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/inspection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          stateType,
          photos: photos.map(p => p.url),
          markers: markers.map(({ photo_index, x, y, severity, label }) => ({ photo_index, x, y, severity, label })),
          notes, accident,
        }),
      });
      const d = await r.json();
      setSaving(false);
      if (!r.ok) { toast.error(d.error || 'Erreur'); return; }
      toast.success(`État des lieux ${stateType === 'before' ? 'au départ' : 'au retour'} enregistré`);
      setPhotos([]); setMarkers([]); setNotes(''); setAccident(false);
      loadExisting();
    } catch { setSaving(false); toast.error('Erreur réseau'); }
  };

  const photoMarkers = markers.filter(m => m.photo_index === activePhoto);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#141414] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-[#141414] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-white font-semibold text-sm">État des lieux</p>
            <p className="text-white/35 text-xs">{booking.client_name} · {booking.cars?.name || 'Véhicule'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Départ / Retour */}
          <div className="grid grid-cols-2 gap-2">
            {[['before', 'Au départ'], ['after', 'Au retour']].map(([v, l]) => (
              <button key={v} onClick={() => setStateType(v)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  stateType === v ? 'bg-gold-500 text-noir-950 border-gold-500' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                }`}>{l}</button>
            ))}
          </div>

          {/* Ajout photos */}
          <div className="grid grid-cols-2 gap-2">
            <input ref={camRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={onFiles} />
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
            <button onClick={() => camRef.current?.click()} disabled={uploading}
              className="flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 text-sm font-semibold py-2.5 rounded-xl">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}Appareil photo
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 text-sm font-semibold py-2.5 rounded-xl">
              <ImagePlus size={14} />Galerie
            </button>
          </div>

          {photos.length > 0 && (
            <>
              {/* Miniatures */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${activePhoto === i ? 'border-gold-500' : 'border-white/10'}`}>
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded">{i + 1}</span>
                  </button>
                ))}
              </div>

              {/* Photo active — tap pour marquer */}
              <div>
                <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5"><MapPin size={12} />Tape sur la photo à l'endroit du défaut</p>
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06] select-none cursor-crosshair"
                  onClick={(e) => onPhotoTap(activePhoto, e)}>
                  <img src={photos[activePhoto].url} alt="" className="w-full block pointer-events-none" />
                  {photoMarkers.map((m, idx) => (
                    <span key={m.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white border-2 border-white shadow-lg"
                      style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, background: SEV[m.severity].color }}>
                      {markers.indexOf(m) + 1}
                    </span>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); removePhoto(activePhoto); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white/80 flex items-center justify-center"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Liste des défauts marqués */}
              {markers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/40 text-xs">Défauts marqués ({markers.length})</p>
                  {markers.map((m) => (
                    <div key={m.id} className="bg-[#1e1e1e] rounded-xl p-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ background: SEV[m.severity].color }}>
                        {markers.indexOf(m) + 1}
                      </span>
                      <input value={m.label} onChange={e => updateMarker(m.id, { label: e.target.value })}
                        placeholder="Ex: rayure jante avant droite"
                        className="input-dark flex-1 text-sm py-1.5 min-w-0" />
                      <select value={m.severity} onChange={e => updateMarker(m.id, { severity: e.target.value })}
                        className="input-dark text-xs py-1.5 px-1.5 flex-shrink-0">
                        {Object.entries(SEV).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button onClick={() => removeMarker(m.id)} className="text-red-400/60 hover:text-red-400 flex-shrink-0"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Accident + notes */}
              <label className="flex items-center gap-2.5 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={accident} onChange={e => setAccident(e.target.checked)} className="w-4 h-4" />
                <AlertTriangle size={14} className="text-red-400" />Signaler un accident
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Note libre (carburant, propreté, km…)" className="input-dark w-full text-sm py-2" />

              <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Enregistrer l'état {stateType === 'before' ? 'au départ' : 'au retour'}
              </button>
            </>
          )}

          {/* États des lieux déjà enregistrés */}
          {existing.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-white/40 text-xs mb-3">Déjà enregistrés</p>
              <div className="space-y-3">
                {existing.map(ins => (
                  <div key={ins.id} className="bg-[#1e1e1e] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">{ins.state_type === 'after' ? 'Au retour' : 'Au départ'}</span>
                      <div className="flex items-center gap-2">
                        {ins.accident && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Accident</span>}
                        <span className="text-white/25 text-[10px]">{new Date(ins.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {(ins.photos || []).map((url, i) => (
                        <img key={i} src={url} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
                      ))}
                    </div>
                    {(ins.damages || []).length > 0 && (
                      <p className="text-white/40 text-xs mt-2">{ins.damages.length} défaut(s) marqué(s)</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
