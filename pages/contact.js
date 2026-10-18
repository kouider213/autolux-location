import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageCircle, MapPin, Clock, Shield, Star, Zap, Heart, Car, CheckCircle, ArrowRight, Phone, Instagram, Music2, Facebook, Mail } from 'lucide-react';
import { getSettings, useSettings, waNumber, siteEmails } from '../lib/settings';
import { useLang } from '../lib/i18n';
import { formatIntl } from '../lib/format';

function SocialSection() {
  const { t } = useLang();
  const [s, setS] = useState(null);
  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return null;
  const socials = [
    s.instagram && { icon: Instagram, label: 'Instagram', href: s.instagram, color: 'text-pink-400', bg: 'hover:border-pink-500/30' },
    s.tiktok    && { icon: Music2,    label: 'TikTok',    href: s.tiktok,    color: 'text-white',     bg: 'hover:border-white/30' },
    s.facebook  && { icon: Facebook,  label: 'Facebook',  href: s.facebook,  color: 'text-blue-400',  bg: 'hover:border-blue-500/30' },
  ].filter(Boolean);
  if (socials.length === 0) return null;
  return (
    <div className="px-5 mb-20">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-badge mb-4 inline-block">{t('contact.follow')}</span>
        <h2 className="font-display text-3xl font-bold text-white mb-8">{t('contact.community')}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {socials.map(soc => (
            <a key={soc.label} href={soc.href} target="_blank" rel="noopener noreferrer"
              className={`group bg-[#141414] border border-white/[0.06] ${soc.bg} rounded-2xl px-8 py-5 flex items-center gap-3 transition-all hover:-translate-y-1`}>
              <soc.icon size={22} className={soc.color} />
              <span className="text-white font-semibold">{soc.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const WHY_US = [
  { icon: Shield, tk: 'wu1t', dk: 'wu1d' },
  { icon: Zap,    tk: 'wu2t', dk: 'wu2d' },
  { icon: Clock,  tk: 'wu3t', dk: 'wu3d' },
  { icon: Heart,  tk: 'wu4t', dk: 'wu4d' },
  { icon: Car,    tk: 'wu5t', dk: 'wu5d' },
  { icon: Star,   tk: 'wu6t', dk: 'wu6d' },
];

// Le « + » de la police décorative est rogné (« 500| ») : on l'écrit dans la police du texte.
function PlusFix({ value }) {
  const v = String(value ?? '');
  return v.endsWith('+') ? <>{v.slice(0, -1)}<span className="font-body font-bold ml-0.5">+</span></> : v;
}

const STATS = [
  // Mêmes chiffres que l'accueil (réglages admin) — plus de 150+/4.9 ici contre 500+/98 % sur l'accueil.
  { vk: 'ct.s1v', lk: 'ct.s1', v: (st) => `${Number(st.stat_clients) || 500}+` },
  { vk: 'ct.s2v', lk: 'ct.s2' },
  { vk: 'ct.s3v', lk: 'st.sat', v: (st) => `${Number(st.stat_satisfaction) || 98}%` },
  { vk: 'ct.s4v', lk: 'ct.s4' },
];

export default function ContactPage() {
  const { t } = useLang();
  const settings = useSettings();
  const WHATSAPP = waNumber(settings);
  return (
    <>
      <Head>
        <title>Contact & Pourquoi nous choisir — Fik Conciergerie</title>
        <meta name="description" content="Fik Conciergerie, location de véhicules premium à Oran. Sans caution, 7j/7, confirmation rapide. Découvrez pourquoi nos clients nous font confiance." />
        <meta property="og:title" content="Fik Conciergerie — Contact" />
        <meta property="og:description" content="Location de véhicules premium à Oran. Sans caution. Contactez-nous 24h/24." />
      </Head>

      <div className="grain min-h-screen bg-[#0e0e0e]">
        <Navbar />

        {/* Hero section */}
        <div className="relative pt-28 pb-20 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0e0e0e]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <span className="section-badge mb-5 inline-block">{t('contact.badge')}</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              {t('contact.title1')} <br />
              <span className="text-gold-gradient italic">{t('contact.title2')}</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
              {t('ct.sub')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 mb-20">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {STATS.map(s => (
              <div key={s.lk} className="lux-card p-5 md:p-7 text-center">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
                <div className="font-display font-black text-3xl md:text-4xl text-gold-gradient mb-1"><PlusFix value={s.v ? s.v(settings) : t(s.vk)} /></div>
                <div className="text-white/35 text-xs">{t(s.lk)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact cards (+ carte à droite sur PC) */}
        <div className="px-5 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="section-badge mb-4 inline-block">{t('ct.join')}</span>
              <h2 className="font-display text-3xl font-bold text-white">{t('ct.contact')}</h2>
            </div>
            <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-6">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">

              {/* WhatsApp — principal */}
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                className="lux-card group !border-[#25D366]/25 p-6 flex flex-col gap-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/[0.03] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl flex items-center justify-center">
                  <MessageCircle size={24} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-display text-white font-bold text-xl mb-1">WhatsApp</h3>
                  <p dir="ltr" className="text-[#25D366] font-semibold text-sm mb-2">{settings.phone || formatIntl(WHATSAPP)}</p>
                  <p className="text-white/35 text-sm">{t('ct.wa_d')}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[#25D366]/70 text-xs font-medium mt-auto">
                  {t('ct.open_wa')} <ArrowRight size={12} />
                </div>
              </a>

              {/* Email (devis écrits, entreprises) */}
              {siteEmails(settings).length > 0 && (
                <div
                  className="lux-card group p-6 flex flex-col gap-4">
                  <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center">
                    <Mail size={24} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-white font-bold text-xl mb-1">Email</h3>
                    {siteEmails(settings).map(em => (
                      <a key={em} href={`mailto:${em}`} dir="ltr" className="block text-gold-400 hover:text-gold-300 font-semibold text-sm mb-1 break-all">{em}</a>
                    ))}
                    <p className="text-white/35 text-sm mt-1">{t('ct.mail_d')}</p>
                  </div>
                  <a href={`mailto:${siteEmails(settings)[0]}`} className="flex items-center gap-1.5 text-gold-400/70 hover:text-gold-400 text-xs font-medium mt-auto">
                    {t('ct.write')} <ArrowRight size={12} />
                  </a>
                </div>
              )}

              {/* Adresse */}
              <a href={settings.maps_url || "https://maps.google.com/maps?q=M8GM%2BQMV+Oran+Algeria"} target="_blank" rel="noopener noreferrer"
                className="lux-card group p-6 flex flex-col gap-4">
                <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-display text-white font-bold text-xl mb-1">{t('ct.loc')}</h3>
                  <p className="text-gold-400 font-semibold text-sm mb-2">{t('ct.loc_v')}</p>
                  <p className="text-white/35 text-sm">{t('ct.loc_d')}</p>
                </div>
                <div className="flex items-center gap-1.5 text-gold-400/70 text-xs font-medium mt-auto">
                  {t('ct.see_maps')} <ArrowRight size={12} />
                </div>
              </a>

              {/* Horaires */}
              <div className="lux-card p-6 flex flex-col gap-4">
                <div className="w-14 h-14 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center">
                  <Clock size={24} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-display text-white font-bold text-xl mb-1">{t('ct.dispo')}</h3>
                  <p className="text-gold-400 font-semibold text-sm mb-2">{t('ct.dispo_v')}</p>
                  <p className="text-white/35 text-sm">{t('ct.dispo_d')}</p>
                </div>
                <div className="mt-auto flex flex-col gap-1.5">
                  {[t('ct.h1'), t('ct.h2')].map(h => (
                    <div key={h} className="flex items-center gap-2 text-white/40 text-xs">
                      <CheckCircle size={10} className="text-gold-400 flex-shrink-0" />{h}
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Carte — à côté des cartes sur PC, dessous sur tablette/téléphone */}
            <div className="mt-5 lg:mt-0 gold-frame rounded-3xl overflow-hidden flex flex-col min-h-[340px]">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-white font-semibold">{t('ct.zone')}</h2>
                  <p className="text-white/40 text-xs truncate">{settings.address}</p>
                </div>
                <a href={settings.maps_url || `https://maps.google.com/maps?q=${encodeURIComponent(settings.address || 'Oran')}`} target="_blank" rel="noopener noreferrer"
                  className="btn-gold text-xs py-2 px-4 flex-shrink-0">
                  {t('ct.open_gps')}
                </a>
              </div>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || 'Oran, Algérie')}&output=embed&z=15`}
                className="w-full flex-1 min-h-[280px] grayscale-[0.4] invert-[0.92] hue-rotate-180 contrast-[0.9]" style={{ border: 0 }}
                allowFullScreen loading="lazy" title="Fik Conciergerie Oran"
              />
            </div>
            </div>

            {/* Numéros associés (optionnels) */}
            {[settings.whatsapp2, settings.whatsapp3].some(Boolean) && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <span className="text-white/35 text-sm">{t('ct.more_wa')}</span>
                {[settings.whatsapp2, settings.whatsapp3].filter(Boolean).map((num, i) => {
                  const clean = String(num).replace(/\D/g, '');
                  return (
                    <a key={i} href={`https://wa.me/${clean}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={14} /> +{clean}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pourquoi nous */}
        <div className="px-5 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="section-badge mb-4 inline-block">{t('ct.diff')}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                {t('ct.why1')} <span className="text-gold-gradient italic">{t('ct.why2')}</span> ?
              </h2>
              <p className="text-white/35 max-w-xl mx-auto">
                {t('ct.why_sub')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {WHY_US.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.tk} className="lux-card flex sm:block gap-4 p-5 sm:p-7">
                    <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-gold-400/20 to-gold-700/5 border border-gold-500/30 rounded-2xl flex items-center justify-center sm:mb-5">
                      <Icon size={20} className="text-gold-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-white font-bold text-lg mb-1 sm:mb-2">{t(item.tk)}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{t(item.dk)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <SocialSection />

        {/* CTA final */}
        <div className="px-5 pb-24">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#1a1a0d] to-[#141414] border border-gold-500/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(226,182,20,0.06),transparent_70%)]" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold text-white mb-3">
                  {t('ct.ready')}
                </h2>
                <p className="text-white/40 mb-8">
                  {t('ct.ready_d')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.4)]">
                    <MessageCircle size={18} />{t('ct.contact_us')}
                  </a>
                  <Link href="/reservation" className="btn-gold py-4 px-8">
                    {t('ct.book_online')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
