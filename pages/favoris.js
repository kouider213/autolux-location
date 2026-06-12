import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ArrowRight, Car, Building2, Tag, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useLang, localizeValue } from '../lib/i18n';
import { useFavorites } from '../lib/favorites';

const cur = (c) => (c === 'EUR' ? '€' : 'DA');

export default function FavorisPage() {
  const { lang } = useLang();
  const ar = lang === 'ar', en = lang === 'en';
  const L = (fr, arT, enT) => (ar ? arT : en ? enT : fr);
  const { byType, toggle } = useFavorites();
  const groups = byType();
  const [data, setData] = useState({ car: [], immo: [], vente: [], pack: [] });
  const [loading, setLoading] = useState(true);

  const keysSig = JSON.stringify(groups);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      const out = { car: [], immo: [], vente: [], pack: [] };
      const q = [];
      if (groups.car?.length)   q.push(supabase.from('cars').select('*').in('id', groups.car).then(r => { out.car = r.data || []; }));
      if (groups.immo?.length)  q.push(supabase.from('properties').select('*, property_photos(url, position)').in('id', groups.immo).then(r => { out.immo = r.data || []; }));
      if (groups.vente?.length) q.push(supabase.from('vehicles_for_sale').select('*, vehicle_sale_photos(url, position)').in('id', groups.vente).then(r => { out.vente = r.data || []; }));
      if (groups.pack?.length)  q.push(supabase.from('packs').select('*, pack_photos(url, position)').in('id', groups.pack).then(r => { out.pack = r.data || []; }));
      await Promise.all(q);
      if (alive) { setData(out); setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSig]);

  const title = L('Mes favoris', 'مفضلتي', 'My favorites');
  const total = data.car.length + data.immo.length + data.vente.length + data.pack.length;

  const FavCard = ({ img, name, sub, price, href, bookHref, onRemove }) => (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden group">
      <Link href={href} className="block relative aspect-video overflow-hidden">
        {img ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             : <div className="w-full h-full bg-[#111]" />}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          aria-label={L('Retirer', 'إزالة', 'Remove')}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-red-500/90 border border-red-400 text-white">
          <Heart size={15} className="fill-current" />
        </button>
      </Link>
      <div className="p-4">
        <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{name}</h3>
        {sub && <p className="text-white/35 text-xs mb-3 capitalize line-clamp-1">{sub}</p>}
        <div className="flex items-center justify-between gap-2">
          {price ? <span className="text-gold-400 font-bold text-sm">{price}</span> : <span className="text-white/30 text-xs">{L('Sur demande', 'حسب الطلب', 'On request')}</span>}
          <Link href={bookHref || href} className="text-xs font-bold bg-gold-500 text-noir-950 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shrink-0">
            {bookHref ? L('Réserver', 'احجز', 'Book') : L('Voir', 'عرض', 'View')} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );

  const Section = ({ icon: Icon, label, children }) => (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-gold-400" />
        <h2 className="text-white font-bold text-lg">{label}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
    </div>
  );

  return (
    <>
      <Head><title>{title} — Fik Conciergerie</title></Head>
      <div className="grain min-h-screen bg-[#0e0e0e]" dir={ar ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="pt-28 pb-20 px-5 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-badge mb-4 inline-block">{L('Favoris', 'المفضلة', 'Favorites')}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white flex items-center justify-center gap-3">
              <Heart size={26} className="text-red-500 fill-current" />{title}
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : total === 0 ? (
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-12 text-center max-w-lg mx-auto">
              <Heart size={30} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/40 text-sm mb-1">{L('Aucun favori pour le moment.', 'لا توجد مفضلة بعد.', 'No favorites yet.')}</p>
              <p className="text-white/25 text-xs">{L("Touchez le cœur sur une voiture, un bien, un véhicule ou un pack.", 'اضغط على القلب على أي سيارة أو عقار أو باقة.', 'Tap the heart on any car, property, vehicle or pack.')}</p>
              <Link href="/cars" className="btn-gold inline-flex mt-5 px-6 py-3"><Car size={15} />{L('Voir les voitures', 'شاهد السيارات', 'See cars')}</Link>
            </div>
          ) : (
            <>
              {data.car.length > 0 && (
                <Section icon={Car} label={L('Voitures à louer', 'سيارات للإيجار', 'Cars to rent')}>
                  {data.car.map(c => (
                    <FavCard key={c.id} img={c.image_url} name={c.name}
                      sub={`${localizeValue(c.category, lang)} · ${c.seats} ${L('places', 'مقاعد', 'seats')}`}
                      price={`${Number(c.resale_price).toLocaleString('fr-FR')} ${cur(c.currency)}${L('/jour', '/يوم', '/day')}`}
                      href={`/cars/${c.id}`} bookHref={`/reservation?car=${c.id}`}
                      onRemove={() => toggle(c.id, 'car')} />
                  ))}
                </Section>
              )}
              {data.immo.length > 0 && (
                <Section icon={Building2} label={L('Immobilier', 'عقارات', 'Real estate')}>
                  {data.immo.map(p => {
                    const photo = (p.property_photos || []).sort((a, b) => a.position - b.position)[0]?.url || p.image_url;
                    return <FavCard key={p.id} img={photo} name={p.title} sub={[p.district, p.city].filter(Boolean).join(', ')}
                      price={p.price ? `${Number(p.price).toLocaleString('fr-FR')} ${cur(p.currency)}` : null}
                      href={`/immo/${p.id}`} onRemove={() => toggle(p.id, 'immo')} />;
                  })}
                </Section>
              )}
              {data.vente.length > 0 && (
                <Section icon={Tag} label={L('Véhicules à vendre', 'سيارات للبيع', 'Cars for sale')}>
                  {data.vente.map(v => {
                    const photo = (v.vehicle_sale_photos || []).sort((a, b) => a.position - b.position)[0]?.url || v.image_url;
                    return <FavCard key={v.id} img={photo} name={`${v.brand} ${v.model}`} sub={[v.year, v.fuel].filter(Boolean).join(' · ')}
                      price={v.price ? `${Number(v.price).toLocaleString('fr-FR')} ${cur(v.currency)}` : null}
                      href={`/vente-voitures/${v.id}`} onRemove={() => toggle(v.id, 'vente')} />;
                  })}
                </Section>
              )}
              {data.pack.length > 0 && (
                <Section icon={Package} label={L('Packs séjour', 'باقات الإقامة', 'Stay packs')}>
                  {data.pack.map(p => {
                    const photo = (p.pack_photos || []).sort((a, b) => a.position - b.position)[0]?.url || p.image_url;
                    return <FavCard key={p.id} img={photo} name={p.title || p.name} sub={p.city}
                      price={p.price ? `${Number(p.price).toLocaleString('fr-FR')} ${cur(p.currency)}` : null}
                      href={`/packs/${p.id}`} onRemove={() => toggle(p.id, 'pack')} />;
                  })}
                </Section>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
