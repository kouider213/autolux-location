import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { useLang } from '../lib/i18n';

export default function NewsletterSignup() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error

  const T = {
    title: lang === 'ar' ? 'النشرة البريدية' : lang === 'en' ? 'Newsletter' : 'Newsletter',
    sub: lang === 'ar' ? 'أفضل العروض قبل الجميع — سيارات، عقارات، باقات.' : lang === 'en' ? 'Best deals first — cars, real estate, packs.' : 'Nos meilleures offres en avant-première — voitures, immo, packs.',
    ph: lang === 'ar' ? 'بريدك الإلكتروني' : lang === 'en' ? 'Your email' : 'Votre email',
    btn: lang === 'ar' ? 'اشترك' : lang === 'en' ? 'Subscribe' : "S'inscrire",
    done: lang === 'ar' ? 'تم تسجيلك ✅' : lang === 'en' ? "You're in ✅" : 'Inscrit ✅',
    err: lang === 'ar' ? 'بريد غير صالح' : lang === 'en' ? 'Invalid email' : 'Email invalide',
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setState('error'); return; }
    setState('loading');
    try {
      const r = await fetch('/api/newsletter-subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch { setState('error'); }
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <Mail size={15} className="text-gold-500" />
        <h3 className="text-white font-bold text-sm">{T.title}</h3>
      </div>
      <p className="text-white/35 text-xs mb-3 leading-relaxed">{T.sub}</p>
      {state === 'done' ? (
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold"><Check size={15} />{T.done}</div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
            placeholder={T.ph} dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="flex-1 min-w-0 bg-[#0e0e0e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:border-gold-500/50 outline-none" />
          <button type="submit" disabled={state === 'loading'}
            className="bg-gold-500 text-noir-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60 flex-shrink-0">
            {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : T.btn}
          </button>
        </form>
      )}
      {state === 'error' && <p className="text-red-400 text-xs mt-1.5">{T.err}</p>}
    </div>
  );
}
