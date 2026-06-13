import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Send, Users, Loader2, TestTube2, Trash2, Image as ImageIcon, Video, MousePointerClick, Eye, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const inputCls = "w-full bg-white/[0.04] border border-white/[0.07] focus:border-gold-500/40 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors";

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok, msg }
  const [testEmail, setTestEmail] = useState('doubakouider@gmail.com');
  const [confirmAll, setConfirmAll] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [panel, setPanel] = useState(null); // 'video' | 'button' | null
  const [vid, setVid] = useState({ link: '', thumb: '' });
  const [btn, setBtn] = useState({ text: '', link: '' });

  // Ajoute du HTML à la fin du message
  const appendHtml = (html) => setBody(b => (b && !b.endsWith('\n') ? b + '\n' : b) + html + '\n');

  // Upload image → URL publique (bucket car-images)
  const uploadImage = async (file) => {
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
    if (!d.url) throw new Error(d.error || 'upload échoué');
    return d.url;
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      appendHtml(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:10px;display:block;margin:14px auto" />`);
      toast.success('Image ajoutée');
    } catch (e) { toast.error(e.message); }
    setUploading(false);
  };

  const onPickVidThumb = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setVid(v => ({ ...v, thumb: url })); toast.success('Miniature prête'); }
    catch (e) { toast.error(e.message); }
    setUploading(false);
  };

  // Bloc vidéo email = miniature cliquable + bouton ▶ (les emails ne lisent pas <video>)
  const appendVideoBlock = (link, thumb) => {
    if (thumb) {
      appendHtml(
        `<a href="${link}" style="text-decoration:none;display:block;margin:14px auto;max-width:100%">` +
        `<img src="${thumb}" alt="Voir la vidéo" style="max-width:100%;height:auto;border-radius:10px;display:block;margin:0 auto" />` +
        `</a>` +
        `<p style="text-align:center;margin:6px 0 14px"><a href="${link}" style="background:#e9b949;color:#1a1500;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px;display:inline-block">▶ Regarder la vidéo</a></p>`
      );
    } else {
      appendHtml(`<p style="text-align:center;margin:16px 0"><a href="${link}" style="background:#e9b949;color:#1a1500;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:9px;display:inline-block">▶ Regarder la vidéo</a></p>`);
    }
  };

  const insertVideo = () => {
    if (!/^https?:\/\//.test(vid.link)) { toast.error('Lien vidéo (https://) requis'); return; }
    const thumb = vid.thumb || (/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.test(vid.link)
      ? 'https://img.youtube.com/vi/' + (vid.link.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1] + '/hqdefault.jpg' : '');
    appendVideoBlock(vid.link, thumb);
    setVid({ link: '', thumb: '' }); setPanel(null); toast.success('Vidéo ajoutée');
  };

  // Upload direct navigateur -> Supabase Storage (bucket 'videos', public). Contourne la limite Vercel.
  const uploadToStorage = async (file, ext) => {
    const path = `newsletter/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('videos').upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (error) throw new Error(error.message);
    return supabase.storage.from('videos').getPublicUrl(path).data.publicUrl;
  };

  // Génère une miniature (1ère image) depuis un fichier vidéo, côté navigateur
  const genVideoThumb = (file) => new Promise((resolve) => {
    try {
      const v = document.createElement('video');
      v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(file);
      const fail = () => { try { URL.revokeObjectURL(v.src); } catch {} resolve(null); };
      v.onloadeddata = () => { try { v.currentTime = Math.min(0.6, (v.duration || 2) / 2); } catch { fail(); } };
      v.onseeked = () => {
        try {
          const c = document.createElement('canvas');
          c.width = v.videoWidth || 640; c.height = v.videoHeight || 360;
          c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
          c.toBlob((b) => { URL.revokeObjectURL(v.src); resolve(b); }, 'image/jpeg', 0.8);
        } catch { fail(); }
      };
      v.onerror = fail;
      setTimeout(fail, 8000); // sécurité
    } catch { resolve(null); }
  });

  const onPickVideoFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const videoUrl = await uploadToStorage(file, ext);
      let thumbUrl = '';
      const blob = await genVideoThumb(file);
      if (blob) { try { thumbUrl = await uploadToStorage(new File([blob], 'thumb.jpg', { type: 'image/jpeg' }), 'jpg'); } catch {} }
      appendVideoBlock(videoUrl, thumbUrl);
      toast.success('Vidéo ajoutée');
    } catch (e) { toast.error('Échec : ' + e.message + (/exceeded|size/i.test(e.message) ? ' (vidéo trop lourde — réduis-la)' : '')); }
    setUploading(false);
  };

  const insertButton = () => {
    if (!btn.text.trim() || !/^https?:\/\//.test(btn.link)) { toast.error('Texte + lien (https://) requis'); return; }
    appendHtml(`<p style="text-align:center;margin:16px 0"><a href="${btn.link}" style="background:#e9b949;color:#1a1500;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:9px;display:inline-block">${btn.text}</a></p>`);
    setBtn({ text: '', link: '' }); setPanel(null); toast.success('Bouton ajouté');
  };

  const load = () => {
    supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const active = subs.filter(s => s.status === 'active');

  const send = async (test) => {
    if (!title.trim() || !body.trim()) { toast.error('Titre et contenu requis'); return; }
    if (test && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail.trim())) { setResult({ ok: false, msg: 'Email de test invalide.' }); return; }
    setConfirmAll(false);
    setSending(true); setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setResult({ ok: false, msg: 'Session expirée — reconnecte-toi (déconnexion puis /login).' }); return; }
      const r = await fetch('/api/newsletter-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ title, body, test, testEmail: test ? testEmail.trim() : undefined }),
      });
      const json = await r.json();
      if (!r.ok) { setResult({ ok: false, msg: json.error || `Échec (HTTP ${r.status})` }); toast.error('Échec'); return; }
      const msg = test ? `Email test envoyé à ${testEmail.trim()} ✅` : `Envoyé à ${json.sent}/${json.total} abonné(s) ✅`;
      setResult({ ok: true, msg }); toast.success('OK');
    } catch (e) { setResult({ ok: false, msg: e.message }); toast.error(e.message); }
    finally { setSending(false); }
  };

  const removeSub = async (id) => {
    if (!confirm('Supprimer cet abonné ?')) return;
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubs(s => s.filter(x => x.id !== id));
  };

  const exportCsv = () => {
    const rows = [['email', 'langue', 'statut', 'date'], ...subs.map(s => [s.email, s.lang, s.status, s.created_at])];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <Head><title>Newsletter — Admin</title></Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center"><Mail size={18} className="text-gold-500" /></div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Newsletter</h1>
            <p className="text-white/30 text-sm">{active.length} abonné(s) actif(s) · {subs.length} au total</p>
          </div>
          <button onClick={exportCsv} className="ml-auto text-xs font-semibold text-white/50 hover:text-gold-400 border border-white/10 rounded-lg px-3 py-2">Exporter CSV</button>
        </div>

        {/* Composer */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-bold text-sm flex items-center gap-2"><Send size={15} className="text-gold-500" />Nouvelle campagne</h2>
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-1.5">Objet de l'email</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Ex : -20% sur la location ce week-end !" />
          </div>
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-1.5">Message</label>

            {/* Barre d'outils */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} className="text-gold-400" />} Photo
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} className="text-gold-400" />} Vidéo galerie
                <input type="file" accept="video/*" className="hidden" onChange={onPickVideoFile} />
              </label>
              <button type="button" onClick={() => setPanel(panel === 'video' ? null : 'video')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-2"><Video size={14} className="text-gold-400" />Vidéo (lien)</button>
              <button type="button" onClick={() => setPanel(panel === 'button' ? null : 'button')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-2"><MousePointerClick size={14} className="text-gold-400" />Bouton</button>
              <button type="button" onClick={() => appendHtml('<b>texte en gras</b>')}
                className="text-xs font-bold text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-2">B</button>
              <button type="button" onClick={() => setPreview(p => !p)}
                className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border ml-auto ${preview ? 'bg-gold-500 text-noir-950 border-gold-500' : 'text-white/70 bg-white/[0.05] border-white/10'}`}><Eye size={14} />Aperçu</button>
            </div>

            {/* Panneau vidéo */}
            {panel === 'video' && (
              <div className="bg-[#0e0e0e] border border-white/[0.08] rounded-xl p-3 mb-2 space-y-2">
                <p className="text-white/40 text-xs">Lien de la vidéo (YouTube ou autre) + miniature (optionnelle, auto pour YouTube)</p>
                <input value={vid.link} onChange={e => setVid(v => ({ ...v, link: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 cursor-pointer">
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}{vid.thumb ? 'Miniature ✓' : 'Miniature'}
                    <input type="file" accept="image/*" className="hidden" onChange={onPickVidThumb} />
                  </label>
                  <button type="button" onClick={insertVideo} className="text-xs font-bold bg-gold-500 text-noir-950 rounded-lg px-4 py-2">Insérer la vidéo</button>
                  <button type="button" onClick={() => setPanel(null)} className="text-white/40 hover:text-white p-1"><X size={15} /></button>
                </div>
              </div>
            )}

            {/* Panneau bouton */}
            {panel === 'button' && (
              <div className="bg-[#0e0e0e] border border-white/[0.08] rounded-xl p-3 mb-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={btn.text} onChange={e => setBtn(b => ({ ...b, text: e.target.value }))} placeholder="Texte du bouton (ex: Réserver)" className={inputCls} />
                  <input value={btn.link} onChange={e => setBtn(b => ({ ...b, link: e.target.value }))} placeholder="https://fikconciergerie.com/cars" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={insertButton} className="text-xs font-bold bg-gold-500 text-noir-950 rounded-lg px-4 py-2">Insérer le bouton</button>
                  <button type="button" onClick={() => setPanel(null)} className="text-white/40 hover:text-white p-1"><X size={15} /></button>
                </div>
              </div>
            )}

            <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className={inputCls} placeholder={"Bonjour,\n\nDécouvrez nos nouvelles offres...\n\nUtilisez les boutons ci-dessus pour ajouter photos, vidéos et boutons."} />
            <p className="text-white/25 text-[11px] mt-1.5">Astuce : tape ton texte, puis clique Photo / Vidéo / Bouton pour insérer. Les sauts de ligne sont gardés.</p>
            <p className="text-emerald-400/70 text-[11px] mt-1">🌍 Chaque abonné reçoit le message traduit automatiquement dans sa langue (FR / العربية / EN). Écris en français, on traduit pour toi.</p>

            {/* Aperçu live */}
            {preview && (
              <div className="mt-3 bg-white rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Aperçu du message</p>
                <div style={{ color: '#444', fontSize: 14, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
          {/* Email de test */}
          <div>
            <label className="text-white/40 text-xs font-semibold block mb-1.5">Email pour le test</label>
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} className={inputCls} placeholder="ton@email.com" inputMode="email" />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => send(true)} disabled={sending}
              className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white border border-white/10 rounded-xl px-4 py-2.5 disabled:opacity-50">
              <TestTube2 size={15} />Envoyer un test
            </button>
            {!confirmAll ? (
              <button onClick={() => { if (!title.trim() || !body.trim()) { toast.error('Titre et contenu requis'); return; } setResult(null); setConfirmAll(true); }} disabled={sending || active.length === 0}
                className="flex items-center gap-2 text-sm font-bold bg-gold-500 text-noir-950 rounded-xl px-5 py-2.5 disabled:opacity-50">
                <Send size={15} />Envoyer à tous ({active.length})
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap bg-gold-500/10 border border-gold-500/25 rounded-xl px-3 py-2">
                <span className="text-gold-300 text-sm font-semibold">Envoyer à {active.length} abonné(s) ?</span>
                <button onClick={() => send(false)} disabled={sending}
                  className="flex items-center gap-1.5 text-sm font-bold bg-gold-500 text-noir-950 rounded-lg px-4 py-2 disabled:opacity-50">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Confirmer
                </button>
                <button onClick={() => setConfirmAll(false)} disabled={sending} className="text-sm font-semibold text-white/50 hover:text-white px-3 py-2">Annuler</button>
              </div>
            )}
          </div>

          {/* Résultat permanent (diagnostic) */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${result.ok ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-red-500/10 border-red-500/25 text-red-300'}`}>
              {result.msg}
            </div>
          )}
        </div>

        {/* Liste abonnés */}
        <div className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <Users size={15} className="text-white/40" /><span className="text-white/50 text-sm font-semibold">Abonnés</span>
          </div>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 size={22} className="animate-spin text-gold-500" /></div>
          ) : subs.length === 0 ? (
            <p className="py-12 text-center text-white/25 text-sm">Aucun abonné pour le moment.</p>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
              {subs.map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{s.email}</p>
                    <p className="text-white/25 text-xs">{s.lang?.toUpperCase()} · {s.source} · {new Date(s.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {s.status === 'active' ? 'Actif' : 'Désabonné'}
                    </span>
                    <button onClick={() => removeSub(s.id)} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
