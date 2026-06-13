import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FolderKanban, Loader2, Upload, Trash2, X, Copy, ExternalLink, Save, Search, MessageCircle, Plus, Car, Building2, Package } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import TranslateToFr from '../../components/TranslateToFr';
import { supabase } from '../../lib/supabase';
import { allStatusesFor, dossierStatusLabel, KIND_LABEL } from '../../lib/dossierStatus';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";
const LANG_F = { fr: '🇫🇷 FR', ar: '🇩🇿 ع', en: '🇬🇧 EN' };

export default function AdminDossiersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [nf, setNf] = useState({ kind: 'voiture', client_name: '', client_phone: '', client_email: '', subject: '', lang: 'fr' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(d => {
    if (kindFilter && d.kind !== kindFilter) return false;
    if (!q.trim()) return true;
    return `${d.ref} ${d.client_name} ${d.client_phone} ${d.subject}`.toLowerCase().includes(q.toLowerCase());
  });

  const createDossier = async () => {
    if (!nf.client_name && !nf.client_phone) { toast.error('Nom ou téléphone requis'); return; }
    setCreating(true);
    try {
      const r = await fetch('/api/create-dossier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nf) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'erreur');
      toast.success(`Dossier créé : ${d.ref}`);
      setNf({ kind: 'voiture', client_name: '', client_phone: '', client_email: '', subject: '', lang: 'fr' });
      await load();
    } catch (e) { toast.error(e.message); }
    setCreating(false);
  };

  return (
    <AdminLayout title="Suivi de dossiers">
      <Head><title>Dossiers — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><FolderKanban size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Suivi de dossiers</h1>
            <p className="text-white/30 text-sm">Achat/vente véhicule & immobilier — le client suit avec son numéro</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={kindFilter} onChange={e => setKindFilter(e.target.value)} className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-white text-sm outline-none">
              <option value="">Tous</option><option value="voiture">Véhicule</option><option value="immo">Immobilier</option><option value="pack">Pack séjour</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" className="bg-white/[0.04] border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none w-40" />
            </div>
          </div>
        </div>

        {/* Créer un dossier */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Plus size={15} className="text-gold-500" />Nouveau dossier</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <select value={nf.kind} onChange={e => setNf(f => ({ ...f, kind: e.target.value }))} className={inputCls}>
              <option value="voiture">🚗 Achat véhicule</option><option value="immo">🏠 Immobilier</option><option value="pack">🎒 Pack séjour</option>
            </select>
            <input value={nf.client_name} onChange={e => setNf(f => ({ ...f, client_name: e.target.value }))} placeholder="Nom client" className={inputCls} />
            <input value={nf.client_phone} onChange={e => setNf(f => ({ ...f, client_phone: e.target.value }))} placeholder="Téléphone" className={inputCls} />
            <input value={nf.client_email} onChange={e => setNf(f => ({ ...f, client_email: e.target.value }))} placeholder="Email (pour les emails auto)" className={inputCls} />
            <input value={nf.subject} onChange={e => setNf(f => ({ ...f, subject: e.target.value }))} placeholder="Objet (ex: Golf 8 2020)" className={`${inputCls} md:col-span-1`} />
            <select value={nf.lang} onChange={e => setNf(f => ({ ...f, lang: e.target.value }))} className={inputCls}>
              <option value="fr">Client FR</option><option value="ar">Client AR</option><option value="en">Client EN</option>
            </select>
          </div>
          <button onClick={createDossier} disabled={creating} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}Créer le dossier
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-gold-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-12 text-center text-white/30 text-sm">Aucun dossier.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => (
              <DossierCard key={d.id} dossier={d} open={openId === d.id}
                onToggle={() => setOpenId(openId === d.id ? null : d.id)}
                onSaved={(u) => setList(l => l.map(x => x.id === u.id ? u : x))}
                onDeleted={(id) => setList(l => l.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function DossierCard({ dossier, open, onToggle, onSaved, onDeleted }) {
  const [form, setForm] = useState(dossier);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setForm(dossier); }, [dossier.id]);

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const photos = Array.isArray(form.photos) ? form.photos : [];
  const KindIcon = form.kind === 'immo' ? Building2 : form.kind === 'pack' ? Package : Car;

  const save = async (patch) => {
    setSaving(true);
    try {
      const r = await fetch('/api/update-dossier', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: dossier.id, patch }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'erreur');
      setForm(d.dossier); onSaved(d.dossier); toast.success('Enregistré');
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const changeStatus = (status) => { setForm(s => ({ ...s, status })); save({ status }); };
  const saveAll = () => save({
    client_name: form.client_name, client_phone: form.client_phone, client_email: form.client_email, client_city: form.client_city,
    subject: form.subject, budget: form.budget, currency: form.currency, details: form.details,
    notes_client: form.notes_client, notes_admin: form.notes_admin,
  });

  const uploadPhotos = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const urls = [...photos];
    for (const file of Array.from(files)) {
      try {
        const base64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(file); });
        const r = await fetch('/api/upload-car-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }) });
        const d = await r.json(); if (d.url) urls.push(d.url);
      } catch { toast.error('Échec upload ' + file.name); }
    }
    setUploading(false);
    await save({ photos: urls });
  };
  const removePhoto = (url) => save({ photos: photos.filter(u => u !== url) });

  const copyLink = () => { navigator.clipboard.writeText(`https://fikconciergerie.com/suivi-dossier/${dossier.ref}`); toast.success('Lien copié'); };

  const sendStatusWA = () => {
    const phone = (form.client_phone || '').replace(/\D/g, '');
    if (!phone) { toast.error('Pas de téléphone client'); return; }
    const lg = form.lang === 'ar' ? 'ar' : form.lang === 'en' ? 'en' : 'fr';
    const link = `https://fikconciergerie.com/suivi-dossier/${dossier.ref}`;
    const sLabel = dossierStatusLabel(form.kind, form.status, lg);
    const subj = form.subject || '';
    const msg = lg === 'ar'
      ? `مرحباً ${form.client_name || ''}،\n\nتحديث بخصوص ملفك ${subj} لدى Fik Conciergerie.\n\n📌 الحالة: *${sLabel}*\n📋 رقم الملف: ${dossier.ref}\n🔗 تابع ملفك: ${link}\n\nنبقى رهن إشارتك.\nمع تحياتنا، فريق Fik Conciergerie.`
      : lg === 'en'
      ? `Hello ${form.client_name || ''},\n\nUpdate on your file ${subj} at Fik Conciergerie.\n\n📌 Status: *${sLabel}*\n📋 File no.: ${dossier.ref}\n🔗 Track your file: ${link}\n\nWe remain at your disposal.\nBest regards, the Fik Conciergerie team.`
      : `Bonjour ${form.client_name || ''},\n\nMise à jour de votre dossier ${subj} chez Fik Conciergerie.\n\n📌 Statut : *${sLabel}*\n📋 N° de dossier : ${dossier.ref}\n🔗 Suivez votre dossier : ${link}\n\nNous restons à votre disposition.\nBien à vous, l'équipe Fik Conciergerie.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const del = async () => {
    if (!confirm(`Supprimer le dossier ${dossier.ref} ?`)) return;
    const { error } = await supabase.from('dossiers').delete().eq('id', dossier.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Supprimé'); onDeleted?.(dossier.id);
  };

  return (
    <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02]">
        {photos[0] ? <img src={photos[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          : <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0"><KindIcon size={18} className="text-white/20" /></div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm truncate">{form.subject || (KIND_LABEL[form.kind] || KIND_LABEL.voiture).fr}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">{dossierStatusLabel(form.kind, form.status, 'fr')}</span>
          </div>
          <p className="text-white/35 text-xs mt-0.5">{dossier.ref} · {form.client_name || '—'} · {form.client_phone || ''} · <span className="text-gold-400 font-semibold">{LANG_F[form.lang] || LANG_F.fr}</span></p>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2"><Copy size={13} />Copier lien</button>
            <a href={`/suivi-dossier/${dossier.ref}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2"><ExternalLink size={13} />Voir page client</a>
            <button onClick={sendStatusWA} className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] bg-[#25D366]/15 hover:bg-[#25D366]/25 rounded-lg px-3 py-2"><MessageCircle size={13} />Statut + suivi WhatsApp</button>
          </div>

          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Statut</label>
            <div className="flex flex-wrap gap-2">
              {allStatusesFor(form.kind).map(s => (
                <button key={s.key} onClick={() => changeStatus(s.key)} disabled={saving}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${form.status === s.key ? 'bg-gold-500 text-noir-950 border-gold-500' : 'text-white/55 border-white/10 hover:border-white/25'}`}>{s.fr}</button>
              ))}
            </div>
            <p className="text-white/25 text-[11px] mt-2">Changer le statut envoie un email auto au client (si email fourni), dans sa langue.</p>
          </div>

          <div>
            <label className="text-white/40 text-xs font-semibold mb-2 block">Photos (visibles par le client)</label>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.06]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(url)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white/80 hover:text-red-400"><X size={13} /></button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-gold-500/40 flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-gold-400">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}<span className="text-[10px] mt-1">Ajouter</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => uploadPhotos(e.target.files)} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <input value={form.subject || ''} onChange={set('subject')} placeholder="Objet" className={`${inputCls} sm:col-span-2`} />
            <input type="number" value={form.budget || ''} onChange={set('budget')} placeholder="Budget" className={inputCls} />
            <select value={form.currency || 'DZD'} onChange={set('currency')} className={inputCls}><option value="DZD">DZD</option><option value="EUR">EUR</option></select>
            <input value={form.client_name || ''} onChange={set('client_name')} placeholder="Nom" className={inputCls} />
            <input value={form.client_phone || ''} onChange={set('client_phone')} placeholder="Téléphone" className={inputCls} />
            <input value={form.client_email || ''} onChange={set('client_email')} placeholder="Email" className={inputCls} />
            <input value={form.client_city || ''} onChange={set('client_city')} placeholder="Ville" className={inputCls} />
          </div>
          <textarea value={form.details || ''} onChange={set('details')} rows={2} placeholder="Précisions (visibles client)" className={`${inputCls} resize-none`} />
          <TranslateToFr text={form.details} lang={form.lang} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-gold-400/80 text-xs font-semibold mb-2 block">Message au client (visible)</label>
              <textarea value={form.notes_client || ''} onChange={set('notes_client')} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="text-white/40 text-xs font-semibold mb-2 block">Notes privées</label>
              <textarea value={form.notes_admin || ''} onChange={set('notes_admin')} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}Enregistrer
            </button>
            <button onClick={del} className="flex items-center gap-2 text-sm font-semibold text-red-400/70 hover:text-red-400 border border-red-500/15 rounded-xl px-4 py-2.5"><Trash2 size={15} />Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}
