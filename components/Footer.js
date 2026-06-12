import Link from 'next/link';
import { MapPin, MessageCircle, Star, Instagram, Music2, Facebook } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber } from '../lib/settings';
import NewsletterSignup from './NewsletterSignup';

function SocialIcons({ s }) {
  const items = [
    s.instagram && { Icon: Instagram, href: s.instagram, label: 'Instagram' },
    s.tiktok    && { Icon: Music2,    href: s.tiktok,    label: 'TikTok' },
    s.facebook  && { Icon: Facebook,  href: s.facebook,  label: 'Facebook' },
  ].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-2.5 mt-4">
      {items.map(({ Icon, href, label }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-gold-500 hover:text-noir-950 text-white/50 flex items-center justify-center transition-all">
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  const { t } = useLang();
  const settings = useSettings();
  const WHATSAPP = waNumber(settings);

  return (
    <footer className="relative border-t border-white/[0.07] bg-[#040404]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-5 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings.logo_url || '/logo.png'} alt="Fik Conciergerie" className="w-10 h-10 object-contain" />
              <div>
                <span className="font-display font-bold text-white text-base block leading-tight">Fik <span className="text-gold-500">Conciergerie</span></span>
                <span className="text-white/25 text-[10px] tracking-widest uppercase font-body">{t('foot.premium')}</span>
              </div>
            </div>
            <p className="text-white/30 text-sm font-body leading-relaxed mb-5">{t('foot.tagline')}</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle size={14} />WhatsApp
            </a>
            <SocialIcons s={settings} />
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.nav')}</h3>
            <ul className="space-y-3">
              {[
                { h: '/', l: t('foot.f_home') },
                { h: '/cars', l: t('foot.f_rental') },
                { h: '/vente-voitures', l: t('foot.f_sale') },
                { h: '/reservation', l: t('foot.f_book') },
                { h: '/reviews', l: t('foot.f_reviews') },
                { h: '/contact', l: t('foot.f_contact') },
              ].map(x => (
                <li key={x.h}>
                  <Link href={x.h} className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.info')}</h3>
            <ul className="space-y-3">
              {[
                { h: '/commande-vehicule', l: t('foot.f_order') },
                { h: '/conditions', l: t('foot.f_cond') },
                { h: '/faq', l: t('nav.faq') },
                { h: '/blog', l: t('nav.blog') },
                { h: '/immo', l: t('foot.f_immo') },
              ].map(x => (
                <li key={x.h}>
                  <Link href={x.h} className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">{t('foot.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <span className="text-white/35 text-sm font-body leading-relaxed">{settings.address || t('foot.addr')}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={13} className="text-gold-500 flex-shrink-0" />
                <a href={`https://wa.me/${WHATSAPP}`} className="text-white/35 text-sm font-body hover:text-gold-400 transition-colors">+{WHATSAPP}</a>
              </li>
              <li className="flex items-center gap-3">
                <Star size={13} className="text-gold-500 flex-shrink-0" />
                <span className="text-white/35 text-sm font-body">{t('foot.hours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/[0.05] pt-8 mb-8 max-w-md mx-auto">
          <NewsletterSignup />
        </div>

        {/* Liens légaux & confiance */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-5">
          {[
            { h: '/a-propos', l: 'Qui sommes-nous' },
            { h: '/cgv', l: 'Conditions générales' },
            { h: '/mentions-legales', l: 'Mentions légales' },
            { h: '/confidentialite', l: 'Confidentialité' },
          ].map(x => (
            <Link key={x.h} href={x.h} className="text-white/30 text-xs font-body hover:text-gold-400 transition-colors">{x.l}</Link>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/15 text-xs font-body">© {new Date().getFullYear()} Fik Conciergerie — {t('foot.rights')}</p>
          <span className="text-white/15 text-xs font-body">{t('foot.perks')}</span>
        </div>
      </div>
    </footer>
  );
}
