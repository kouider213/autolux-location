import { useState } from 'react';
import Link from 'next/link';
import { FolderKanban, X, Loader2, CheckCircle2, Copy, Search } from 'lucide-react';
import { useLang } from '../lib/i18n';

// Bouton "Suivre mon dossier" : crée un dossier (achat véhicule / immo) avec suivi par numéro.
// Props: kind ('voiture'|'immo'), subject, listing_id, budget, currency
export default function StartDossier({ kind = 'voiture', subject, listing_id, budget, currency = 'DZD', className = '' }) {
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [ref, setRef] = useState(null);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim() || !phone.trim()) { setErr(L('Nom et téléphone requis.', 'الاسم والهاتف إجباريان.', 'Name and phone required.')); return; }
    setErr(''); setSending(true);
    try {
      const r = await fetch('/api/create-dossier', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, subject, listing_id, budget, currency, lang, client_name: name, client_phone: phone, client_email: email }),
      });
      const d = await r.json();
      if (d?.ok) setRef(d.ref);
      else setErr(L('Erreur, réessayez.', 'خطأ، أعد المحاولة.', 'Error, please retry.'));
    } catch { setErr(L('Erreur réseau.', 'خطأ في الشبكة.', 'Network error.')); }
    setSending(false);
  };

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-gold-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none transition-colors";

  return (
    <>
      <button onClick={() => { setOpen(true); setRef(null); setErr(''); }}
        className={`flex items-center justify-center gap-2 w-full border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 font-semibold py-3.5 rounded-xl transition-all ${className}`}>
        <FolderKanban size={17} />{L('Suivre mon dossier', 'افتح ملف متابعة', 'Open a tracking file')}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)} dir={ar ? 'rtl' : 'ltr'}>
          <div className="bg-[#151515] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={18} /></button>

            {ref ? (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={26} className="text-emerald-400" /></div>
                <h3 className="text-white font-bold text-lg mb-2">{L('Dossier ouvert ✅', 'تم فتح الملف ✅', 'File opened ✅')}</h3>
                <p className="text-white/45 text-sm mb-4">{L('Conservez votre numéro pour suivre votre dossier à tout moment.', 'احتفظ برقمك لمتابعة ملفك في أي وقت.', 'Keep your number to track your file anytime.')}</p>
                <div className="inline-flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-xl px-5 py-3 mb-4">
                  <span className="font-mono font-bold text-gold-400 text-lg tracking-wider">{ref}</span>
                  <button onClick={() => navigator.clipboard.writeText(ref)} className="text-white/40 hover:text-gold-400"><Copy size={16} /></button>
                </div>
                <Link href={`/suivi-dossier/${ref}`} className="btn-gold w-full py-3 justify-center"><Search size={15} />{L('Suivre mon dossier', 'تتبّع ملفي', 'Track my file')}</Link>
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-1">{L('Ouvrir un dossier de suivi', 'فتح ملف متابعة', 'Open a tracking file')}</h3>
                <p className="text-white/40 text-sm mb-4">{subject ? subject : L('Notre équipe vous accompagne et vous tient informé à chaque étape.', 'يرافقك فريقنا ويُبقيك على اطلاع في كل مرحلة.', 'Our team guides you and keeps you informed at every step.')}</p>
                <div className="space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={L('Votre nom', 'اسمك', 'Your name')} className={inputCls} />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={L('Téléphone / WhatsApp', 'الهاتف / واتساب', 'Phone / WhatsApp')} inputMode="tel" className={inputCls} />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder={L('Email (pour le suivi)', 'البريد (للمتابعة)', 'Email (for tracking)')} inputMode="email" className={inputCls} />
                  {err && <p className="text-red-400 text-xs">{err}</p>}
                  <button onClick={submit} disabled={sending} className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <FolderKanban size={16} />}{L('Ouvrir mon dossier', 'افتح ملفي', 'Open my file')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
