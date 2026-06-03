import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, MessageCircle, Mail, Phone, MapPin, Instagram, Music2, Facebook, Percent, Save, Megaphone, ImageIcon, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { DEFAULT_SETTINGS } from '../../lib/settings';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors";

// Field défini hors du composant : sinon il est recréé à chaque frappe
// → React remonte l'input → le focus (et le clavier mobile) se ferme.
function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-white/40 text-xs font-semibold mb-1.5">{Icon && <Icon size={12} className="text-gold-500/70" />}{label}</label>
      {children}
      {hint && <p className="text-white/20 text-[11px] mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm]     = useState(DEFAULT_SETTINGS);
  const [loading, setLoad]  = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const onLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/upload-car-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Upload échoué');
      setForm(s => ({ ...s, logo_url: json.url }));
      toast.success('Logo téléversé — clique Enregistrer');
    } catch (err) {
      toast.error('Erreur logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setForm({ ...DEFAULT_SETTINGS, ...data }); setLoad(false); })
      .catch(() => setLoad(false));
  }, []);

  const up = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));

  // Nettoie un lien collé : enlève < >, espaces, et force https:// si absent
  const cleanUrl = (v) => {
    let s = (v || '').trim().replace(/^[<\s]+|[>\s]+$/g, '');
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    return s;
  };
  // Nettoie un numéro WhatsApp : chiffres uniquement
  const cleanWa = (v) => (v || '').replace(/\D/g, '');

  const save = async () => {
    setSaving(true);
    const payload = {
      id: 1,
      whatsapp: cleanWa(form.whatsapp), whatsapp2: cleanWa(form.whatsapp2), whatsapp3: cleanWa(form.whatsapp3),
      logo_url: form.logo_url || '',
      email: (form.email || '').trim(), phone: (form.phone || '').trim(), address: (form.address || '').trim(),
      maps_url: cleanUrl(form.maps_url), instagram: cleanUrl(form.instagram), tiktok: cleanUrl(form.tiktok), facebook: cleanUrl(form.facebook),
      acompte_pct: form.acompte_pct ? Number(form.acompte_pct) : 50,
      hero_title: (form.hero_title || '').trim(), hero_subtitle: (form.hero_subtitle || '').trim(), announcement: (form.announcement || '').trim(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });
    setSaving(false);
    if (error) { toast.error('Erreur: ' + error.message); return; }
    toast.success('Paramètres enregistrés');
  };

  return (
    <>
      <Head><title>Paramètres — Fik Admin</title></Head>
      <AdminLayout title="Paramètres du site">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="max-w-2xl space-y-6">

            {/* Marque / Logo */}
            <section className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2"><ImageIcon size={15} className="text-gold-400" /> Logo</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={form.logo_url || '/logo.png'} alt="Logo" className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex-1">
                  <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${uploadingLogo ? 'bg-white/[0.04] text-white/40' : 'bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20'}`}>
                    {uploadingLogo ? <><Loader2 size={14} className="animate-spin" /> Téléversement...</> : <><ImageIcon size={14} /> Changer le logo</>}
                    <input type="file" accept="image/*" onChange={onLogoFile} disabled={uploadingLogo} className="hidden" />
                  </label>
                  <p className="text-white/20 text-[11px] mt-2">PNG transparent recommandé. Apparaît dans le menu, le pied de page et l'admin.</p>
                  {form.logo_url && <button onClick={() => setForm(s => ({ ...s, logo_url: '' }))} className="text-red-400/60 hover:text-red-400 text-[11px] mt-1 block">Réinitialiser au logo par défaut</button>}
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2"><MessageCircle size={15} className="text-gold-400" /> Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="WhatsApp principal (sans +, sans espaces)" icon={MessageCircle} hint="Numéro utilisé partout sur le site. Ex: 213699112233"><input value={form.whatsapp} onChange={up('whatsapp')} inputMode="numeric" className={inputCls} /></Field>
                <Field label="Téléphone affiché" icon={Phone}><input value={form.phone || ''} onChange={up('phone')} placeholder="+213 ..." className={inputCls} /></Field>
                <Field label="WhatsApp associé 1 (optionnel)" icon={MessageCircle} hint="Affiché sur la page Contact. Vide = masqué."><input value={form.whatsapp2 || ''} onChange={up('whatsapp2')} inputMode="numeric" placeholder="213..." className={inputCls} /></Field>
                <Field label="WhatsApp associé 2 (optionnel)" icon={MessageCircle} hint="Affiché sur la page Contact. Vide = masqué."><input value={form.whatsapp3 || ''} onChange={up('whatsapp3')} inputMode="numeric" placeholder="213..." className={inputCls} /></Field>
                <Field label="Email" icon={Mail}><input value={form.email || ''} onChange={up('email')} placeholder="contact@..." className={inputCls} /></Field>
                <Field label="Adresse" icon={MapPin}><input value={form.address || ''} onChange={up('address')} className={inputCls} /></Field>
                <div className="sm:col-span-2"><Field label="Lien Google Maps" icon={MapPin} hint="Colle le lien de partage Google Maps de ton agence"><input value={form.maps_url || ''} onChange={up('maps_url')} className={inputCls} /></Field></div>
              </div>
            </section>

            {/* Réseaux sociaux */}
            <section className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2"><Instagram size={15} className="text-gold-400" /> Réseaux sociaux</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Instagram (lien)" icon={Instagram}><input value={form.instagram || ''} onChange={up('instagram')} placeholder="https://instagram.com/..." className={inputCls} /></Field>
                <Field label="TikTok (lien)" icon={Music2}><input value={form.tiktok || ''} onChange={up('tiktok')} placeholder="https://tiktok.com/@..." className={inputCls} /></Field>
                <Field label="Facebook (lien)" icon={Facebook}><input value={form.facebook || ''} onChange={up('facebook')} placeholder="https://facebook.com/..." className={inputCls} /></Field>
              </div>
            </section>

            {/* Textes & commande */}
            <section className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2"><Megaphone size={15} className="text-gold-400" /> Textes &amp; commande</h2>
              <div className="space-y-4">
                <Field label="Titre accueil (1ère ligne — optionnel)" icon={Megaphone} hint="Remplace le grand titre de l'accueil. Vide = titre par défaut."><input value={form.hero_title || ''} onChange={up('hero_title')} placeholder="Ex: Tout Oran, Sous Une Clé" className={inputCls} /></Field>
                <Field label="Sous-titre accueil (optionnel)" icon={Megaphone} hint="Phrase sous le titre. Vide = texte par défaut."><input value={form.hero_subtitle || ''} onChange={up('hero_subtitle')} placeholder="Ex: Location, vente & immobilier premium à Oran." className={inputCls} /></Field>
                <Field label="Bandeau d'annonce (optionnel)" icon={Megaphone} hint="Affiché en haut du site. Laisse vide pour masquer."><input value={form.announcement || ''} onChange={up('announcement')} placeholder="Ex: -10% sur les locations longue durée ce mois !" className={inputCls} /></Field>
                <Field label="Acompte commande véhicule (%)" icon={Percent} hint="Affiché sur la page commande sur mesure"><input type="number" value={form.acompte_pct} onChange={up('acompte_pct')} className={inputCls} /></Field>
              </div>
            </section>

            <button onClick={save} disabled={saving} className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
