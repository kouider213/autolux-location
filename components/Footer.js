import Link from 'next/link';
import { MapPin, MessageCircle, Star, Instagram, Music2, Facebook, Mail, Phone } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { useSettings, waNumber, siteEmails, phoneInfo, legalIds } from '../lib/settings';
import NewsletterSignup from './NewsletterSignup';
import { GOOGLE_MAPS_URL } from '../lib/google';
import { formatIntl } from '../lib/format';

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
  const { t, lang } = useLang();
  const settings = useSettings();
  const WHATSAPP = waNumber(settings);

  return (
    <footer className="relative border-t border-white/[0.07] bg-[#040404] overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.06) 0%,transparent 70%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-5 pt-14 md:pt-20 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-x-6 gap-y-10 md:gap-x-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings.logo_url || '/logo.png'} alt="Fik Conciergerie" className="w-10 h-10 object-contain" />
              <div>
                <span className="font-display font-bold text-white text-base block leading-tight">Fik <span className="text-gold-500">Conciergerie</span></span>
                <span className="text-white/25 text-[10px] tracking-widest uppercase font-body">{t('foot.premium')}</span>
              </div>
            </div>
            <p className="text-white/45 text-sm font-body leading-relaxed mb-5 max-w-sm">{t('foot.tagline')}</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle size={14} />WhatsApp
            </a>
            <SocialIcons s={settings} />
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-gold-500/80 text-[10px] font-black uppercase tracking-[0.2em] mb-5">{t('foot.nav')}</h3>
            <ul className="space-y-3">
              {[
                { h: '/', l: t('foot.f_home') },
                { h: '/cars', l: t('foot.f_rental') },
                { h: '/vente-voitures', l: t('foot.f_sale') },
                { h: '/packs', l: lang === 'ar' ? 'الباقات' : lang === 'en' ? 'Stay packages' : 'Packs séjour' },
                { h: '/entreprises', l: lang === 'ar' ? 'الشركات' : lang === 'en' ? 'Business' : 'Entreprises' },
                { h: '/reservation', l: t('foot.f_book') },
                { h: '/reviews', l: t('foot.f_reviews') },
                { h: '/contact', l: t('foot.f_contact') },
              ].map(x => (
                <li key={x.h}>
                  <Link href={x.h} className="text-white/50 text-sm font-body hover:text-gold-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-gold-500/80 text-[10px] font-black uppercase tracking-[0.2em] mb-5">{t('foot.info')}</h3>
            <ul className="space-y-3">
              {[
                { h: '/commande-vehicule', l: t('foot.f_order') },
                { h: '/conditions', l: t('foot.f_cond') },
                { h: '/faq', l: t('nav.faq') },
                { h: '/blog', l: t('nav.blog') },
                { h: '/immo', l: t('foot.f_immo') },
              ].map(x => (
                <li key={x.h}>
                  <Link href={x.h} className="text-white/50 text-sm font-body hover:text-gold-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold-500/0 group-hover:bg-gold-500 rounded-full transition-colors" />
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-gold-500/80 text-[10px] font-black uppercase tracking-[0.2em] mb-5">{t('foot.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-white/55 text-sm font-body leading-relaxed hover:text-gold-400 transition-colors">
                  {settings.address || t('foot.addr')}<br /><span className="text-gold-500/60 text-xs">{lang === 'ar' ? 'عرض على خرائط Google ←' : lang === 'en' ? 'View on Google Maps →' : 'Voir sur Google Maps →'}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={13} className="text-gold-500 flex-shrink-0" />
                <a href={`https://wa.me/${WHATSAPP}`} dir="ltr" className="text-white/55 text-sm font-body hover:text-gold-400 transition-colors">{formatIntl(WHATSAPP)}</a>
              </li>
              {phoneInfo(settings) && (
                <li className="flex items-center gap-3">
                  <Phone size={13} className="text-gold-500 flex-shrink-0" />
                  <a href={`tel:${phoneInfo(settings).tel}`} dir="ltr" className="text-white/55 text-sm font-body hover:text-gold-400 transition-colors">{phoneInfo(settings).display} <span className="text-white/30 text-xs">🇩🇿</span></a>
                </li>
              )}
              {siteEmails(settings).map(em => (
                <li key={em} className="flex items-center gap-3">
                  <Mail size={13} className="text-gold-500 flex-shrink-0" />
                  <a href={`mailto:${em}`} dir="ltr" className="text-white/55 text-sm font-body hover:text-gold-400 transition-colors break-all">{em}</a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <Star size={13} className="text-gold-500 flex-shrink-0" />
                <span className="text-white/55 text-sm font-body">{t('foot.hours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Liens SEO Oran */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-6">
          {[
            { h: '/conciergerie-oran', l: 'Conciergerie Oran' },
            { h: '/location-voiture-oran', l: 'Location voiture Oran' },
            { h: '/location-voiture-aeroport-oran', l: 'Location aéroport Oran' },
            { h: '/vente-voiture-oran', l: 'Vente voiture Oran' },
            { h: '/vente-voiture-occasion-oran', l: 'Voiture occasion Oran' },
            { h: '/importation-voiture-algerie', l: 'Importation véhicule' },
            { h: '/immobilier-oran', l: 'Immobilier Oran' },
          ].map(x => (
            <Link key={x.h} href={x.h} className="text-white/30 text-xs font-body hover:text-gold-400 transition-colors">{x.l}</Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/[0.05] pt-8 mb-8 max-w-md mx-auto">
          <NewsletterSignup />
        </div>

        {/* Liens légaux & confiance */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-5">
          {[
            { h: '/a-propos', l: lang === 'ar' ? 'من نحن' : lang === 'en' ? 'About us' : 'Qui sommes-nous' },
            { h: '/cgv', l: lang === 'ar' ? 'الشروط العامة' : lang === 'en' ? 'Terms & conditions' : 'Conditions générales' },
            { h: '/mentions-legales', l: lang === 'ar' ? 'إشعارات قانونية' : lang === 'en' ? 'Legal notice' : 'Mentions légales' },
            { h: '/confidentialite', l: lang === 'ar' ? 'الخصوصية' : lang === 'en' ? 'Privacy' : 'Confidentialité' },
          ].map(x => (
            <Link key={x.h} href={x.h} className="text-white/30 text-xs font-body hover:text-gold-400 transition-colors">{x.l}</Link>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/15 text-xs font-body">© {new Date().getFullYear()} Fik Conciergerie — {t('foot.rights')}{legalIds(settings) && <span dir="ltr"> · {legalIds(settings)}</span>}</p>
          <span className="text-white/15 text-xs font-body">{t('foot.perks')}</span>
        </div>

        {/* Signature géante en contour or */}
        <p aria-hidden="true" className="num-outline font-display font-black text-center leading-none mt-10 select-none whitespace-nowrap opacity-60"
          style={{ fontSize: 'clamp(34px, 10vw, 140px)' }}>
          Fik Conciergerie
        </p>
      </div>
    </footer>
  );
}
