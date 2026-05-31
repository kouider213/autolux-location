import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Zap, Car, Star, ChevronDown, ArrowRight, Users, MapPin, CalendarCheck, Fuel } from 'lucide-react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const ease = [0.16, 1, 0.3, 1];

/* ─── Animated counter ─── */
function Counter({ to, suffix = '', inView }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const dur = 2200;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(e * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <>{val}{suffix}</>;
}

/* ─── Car card ─── */
function CarCard({ car, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div ref={ref}
      className="group relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: '3/4' }}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      {car.image_url ? (
        <img src={car.image_url} alt={car.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] flex items-center justify-center">
          <Car size={64} className="text-white/[0.06]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="absolute top-3 left-3">
        <span className="tag-category capitalize">{car.category}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display font-bold text-white text-lg mb-1 leading-tight">{car.name}</h3>
        <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-white/50 text-xs font-body flex items-center gap-1">
            <Fuel size={10} className="text-gold-500/60" />{car.fuel}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/50 text-xs font-body flex items-center gap-1">
            <Users size={10} className="text-gold-500/60" />{car.seats} places
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gold-400 font-display font-bold text-xl leading-none">{car.resale_price}€</div>
            <div className="text-white/30 text-xs font-body">/ jour</div>
          </div>
          <Link href={`/reservation?car=${car.id}`}
            className="bg-gold-500 hover:bg-gold-400 text-noir-950 font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(226,182,20,0.3)] flex items-center gap-1.5 font-body"
            onClick={e => e.stopPropagation()}>
            <CalendarCheck size={13} />Réserver
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function Home({ cars, reviews }) {
  const statsRef   = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <>
      <Head>
        <title>AutoLux — Location de Véhicules Premium Oran</title>
        <meta name="description" content="Louez votre véhicule idéal à Oran. Large gamme sans caution. Réservation rapide." />
      </Head>

      <div className="grain bg-[#080808] overflow-x-hidden">
        <Navbar />

        {/* ══ HERO ══ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0 opacity-[0.018]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.08) 0%,transparent 65%)' }} />
          <div className="absolute top-1/4 right-[12%] w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.09) 0%,transparent 70%)' }} />
          <div className="absolute bottom-1/3 left-[8%] w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.06) 0%,transparent 70%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

          <div className="relative z-10 text-center max-w-6xl mx-auto px-5 pt-28 pb-16">
            <motion.div className="inline-flex items-center gap-2 bg-gold-500/[0.07] border border-gold-500/20 rounded-full px-5 py-2 mb-14"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}>
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase font-body">
                Réservation disponible — Oran, Algérie
              </span>
            </motion.div>

            <h1 className="font-display font-black leading-[0.88] mb-10">
              {[
                { text: 'La',     gold: false },
                { text: 'Route,', gold: false },
                { text: 'Votre',  gold: true  },
                { text: 'Style',  gold: true  },
              ].map((w, i) => (
                <motion.span key={i}
                  className={`inline-block mr-[0.12em] ${w.gold ? 'text-gold-gradient italic' : 'text-hero-gradient'}`}
                  style={{ fontSize: 'clamp(54px, 9.5vw, 124px)' }}
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.13, ease }}>
                  {w.text}
                </motion.span>
              ))}
            </h1>

            <motion.p className="text-white/38 text-xl max-w-xl mx-auto mb-14 font-body leading-relaxed"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85, ease }}>
              Citadines, SUV, utilitaires et premium à Oran.{' '}
              <span className="text-white/60">Sans caution. Réservation en 2 minutes.</span>
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease }}>
              <Link href="/reservation" className="btn-gold text-base px-10 py-4 animate-pulse-gold">
                <CalendarCheck size={18} />Réserver maintenant
              </Link>
              <Link href="/cars" className="btn-outline text-base px-8 py-4">
                <Car size={16} />Voir la flotte<ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div className="inline-grid grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.05]"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease }}>
              {[
                { v: `${cars?.length || 14}`, l: 'Véhicules',  s: 'disponibles' },
                { v: '35+',                   l: 'Âge requis', s: 'minimum'     },
                { v: '0€',                    l: 'Caution',    s: 'garantie'    },
              ].map(s => (
                <div key={s.l} className="bg-[#0e0e0e] px-8 py-5 text-center">
                  <div className="font-display text-2xl font-bold text-gold-gradient">{s.v}</div>
                  <div className="text-white/55 text-xs font-body mt-0.5">{s.l}</div>
                  <div className="text-white/20 text-[10px] tracking-wider uppercase font-body">{s.s}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-[9px] tracking-[0.25em] uppercase font-body">Défiler</span>
            <ChevronDown size={13} />
          </motion.div>
        </section>

        {/* ══ FLEET GRID ══ */}
        <section className="py-28 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div className="mb-14"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="section-badge mb-5 inline-block">Notre flotte</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                  Choisissez votre <span className="text-gold-gradient italic">véhicule</span>
                </h2>
                <Link href="/cars" className="btn-outline text-sm py-2.5 self-start md:self-auto">
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(cars || []).slice(0, 8).map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} className="relative py-28 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-[#060606]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.05) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div className="mb-20"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="section-badge mb-5 inline-block">AutoLux en chiffres</span>
              <h2 className="font-display text-5xl md:text-6xl font-bold text-white mt-5">
                Confiance & <span className="text-gold-gradient italic">Excellence</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6">
              {[
                { to: cars?.length||14, suffix:'',  label:'Véhicules',         desc:'dans notre flotte', delay:0    },
                { to: 500,              suffix:'+', label:'Clients satisfaits', desc:'depuis l\'ouverture',delay:0.15 },
                { to: 0,               suffix:'€', label:'Caution',            desc:'confiance totale',  delay:0.3  },
                { to: 98,              suffix:'%', label:'Satisfaction',       desc:'avis vérifiés',     delay:0.45 },
              ].map((s, i) => (
                <motion.div key={i} className="text-center"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: s.delay, ease }}>
                  <div className="font-display font-black text-gold-gradient leading-none mb-3"
                       style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
                    <Counter to={s.to} suffix={s.suffix} inView={statsInView} />
                  </div>
                  <div className="text-white font-semibold text-base font-body mb-1">{s.label}</div>
                  <div className="text-white/30 text-sm font-body">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHY US ══ */}
        <section className="py-28 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                Pourquoi nous <span className="text-gold-gradient italic">choisir ?</span>
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, num:'01', title:'Sans caution',      desc:'Aucune caution exigée. Nous faisons confiance à nos clients et simplifions chaque location.' },
                { icon: Zap,    num:'02', title:'Réservation rapide', desc:'Réservez en ligne en 2 minutes. Confirmation immédiate par WhatsApp.' },
                { icon: Car,    num:'03', title:'Flotte variée',     desc:'Citadines, SUV, utilitaires 9 places, berlines. Un véhicule pour chaque besoin.' },
              ].map((item, i) => (
                <motion.div key={item.num} className="card-glass p-8 group hover:border-gold-500/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15, ease }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <div className="flex items-start justify-between mb-7">
                    <motion.div className="w-14 h-14 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <item.icon size={22} className="text-gold-400" />
                    </motion.div>
                    <span className="font-display text-6xl font-bold text-white/[0.04] select-none">{item.num}</span>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3 font-body">{item.title}</h3>
                  <p className="text-white/38 leading-relaxed text-sm font-body">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ REVIEWS ══ */}
        {reviews?.length > 0 && (
          <section className="py-28 px-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#060606]" />
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.04) 0%,transparent 70%)' }} />

            <div className="relative z-10 max-w-7xl mx-auto">
              <motion.div className="text-center mb-14"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <span className="section-badge mb-5 inline-block">Témoignages</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
                  Ils nous font <span className="text-gold-gradient italic">confiance</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500':'text-white/15'} />
                    ))}
                  </div>
                  <span className="text-white/35 text-sm font-body">{avgRating}/5 — {reviews.length} avis</span>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviews.slice(0, 3).map((review, i) => (
                  <motion.div key={review.id} className="card-dark p-7 relative overflow-hidden"
                    initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12, ease }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <span className="absolute top-3 right-5 font-display text-9xl text-gold-500/[0.05] leading-none select-none pointer-events-none">"</span>
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({length:5}).map((_,j)=>(
                        <Star key={j} size={13} className={j < review.rating ? 'text-gold-500 fill-gold-500':'text-white/10'} />
                      ))}
                    </div>
                    <p className="text-white/55 text-sm leading-relaxed italic mb-6 font-body">"{review.comment}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-500/25 to-gold-700/15 border border-gold-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold font-body">{review.client_name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm font-body">{review.client_name}</p>
                        {review.created_at && (
                          <p className="text-white/25 text-xs font-body">
                            {new Date(review.created_at).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link href="/reviews" className="btn-ghost text-sm text-white/35 hover:text-white font-body">
                  Voir tous les avis <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ══ CTA ══ */}
        <section className="relative py-32 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-[#080808]" />
          <div className="absolute inset-0 opacity-[0.018]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px)', backgroundSize: '70px 70px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(226,182,20,0.07) 0%,transparent 65%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
              <motion.div className="w-20 h-20 bg-gold-500/[0.08] border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-10"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Car size={32} className="text-gold-400" />
              </motion.div>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-[0.9]">
                Prêt à prendre<br /><span className="text-gold-gradient italic">la route ?</span>
              </h2>
              <p className="text-white/35 text-xl mb-12 font-body leading-relaxed">
                Réservez dès maintenant votre véhicule à Oran.<br />Simple, rapide, sans caution.
              </p>
              <Link href="/reservation" className="btn-gold text-lg px-14 py-5 animate-pulse-gold">
                <CalendarCheck size={20} />Réserver maintenant
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-white/[0.05] bg-[#060606] py-8 px-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(226,182,20,0.3)]">
                <span className="text-noir-950 font-black text-xs">AL</span>
              </div>
              <span className="font-display font-bold text-white">Auto<span className="text-gold-500">Lux</span></span>
            </div>
            <div className="flex gap-6 text-white/25 text-sm font-body">
              {[{h:'/cars',l:'Véhicules'},{h:'/conditions',l:'Conditions'},{h:'/reviews',l:'Avis'},{h:'/reservation',l:'Réserver'}].map(x=>(
                <Link key={x.h} href={x.h} className="hover:text-gold-400 transition-colors">{x.l}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-white/20 text-xs font-body">
              <MapPin size={10} /><span>Oran, Algérie — © {new Date().getFullYear()} AutoLux</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const { data: cars }    = await supabase.from('cars').select('*').order('resale_price');
  const { data: reviews } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6);
  return { props: { cars: cars||[], reviews: reviews||[] } };
}
