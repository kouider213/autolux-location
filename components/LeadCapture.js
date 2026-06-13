import { useState } from 'react';
import { BellRing, X, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/i18n';

// Bouton "Être rappelé" + mini-formulaire (nom + tél) qui enregistre un lead en base
// AVANT WhatsApp → aucun contact perdu. Le bouton WhatsApp direct reste ailleurs, intact.
// Props: category, criteria, budget_max, currency, city, whatsappUrl (optionnel)
export default function LeadCapture({ category, criteria, budget_max, currency = 'DZD', city, whatsappUrl, className = '' }) {
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim() || !phone.trim()) { setErr(L('Nom et téléphone requis.', 'الاسم والهاتف إجباريان.', 'Name and phone required.')); return; }
    setErr(''); setSending(true);
    try {
      await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: name, client_phone: phone, category, criteria, budget_max, currency, city, lang }),
      });
    } catch { /* best-effort */ }
    setSending(false); setDone(true);
  };

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-gold-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none transition-colors";

  return (
    <>
      <button onClick={() => { setOpen(true); setDone(false); setErr(''); }}
        className={`flex items-center justify-center gap-2 w-full border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 font-semibold py-3.5 rounded-xl transition-all ${className}`}>
        <BellRing size={17} />{L('Être rappelé', 'اطلب أن نتصل بك', 'Request a callback')}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)} dir={ar ? 'rtl' : 'ltr'}>
          <div className="bg-[#151515] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={18} /></button>

            {done ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={26} className="text-emerald-400" /></div>
                <h3 className="text-white font-bold text-lg mb-2">{L('Demande envoyée ✅', 'تم إرسال الطلب ✅', 'Request sent ✅')}</h3>
                <p className="text-white/45 text-sm mb-5">{L('Notre équipe vous rappelle très vite.', 'سيتصل بك فريقنا قريباً جداً.', 'Our team will call you back shortly.')}</p>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3 rounded-xl transition-colors">
                    <MessageCircle size={16} />{L('Discuter maintenant sur WhatsApp', 'تحدّث الآن عبر واتساب', 'Chat now on WhatsApp')}
                  </a>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-1">{L('Être rappelé', 'اطلب أن نتصل بك', 'Request a callback')}</h3>
                <p className="text-white/40 text-sm mb-5">{L('Laissez-nous votre numéro, on vous rappelle.', 'اترك لنا رقمك وسنتصل بك.', 'Leave us your number, we’ll call you back.')}</p>
                <div className="space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={L('Votre nom', 'اسمك', 'Your name')} className={inputCls} />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={L('Téléphone / WhatsApp', 'الهاتف / واتساب', 'Phone / WhatsApp')} inputMode="tel" className={inputCls} />
                  {err && <p className="text-red-400 text-xs">{err}</p>}
                  <button onClick={submit} disabled={sending}
                    className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}{L('Envoyer ma demande', 'إرسال طلبي', 'Send my request')}
                  </button>
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                      className="block text-center text-white/35 hover:text-gold-400 text-xs pt-1">
                      {L('ou contacter directement sur WhatsApp', 'أو التواصل مباشرة عبر واتساب', 'or contact directly on WhatsApp')}
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
