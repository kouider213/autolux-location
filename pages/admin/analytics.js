import Head from 'next/head';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Globe, Smartphone, Monitor, Tablet, TrendingUp, Eye, Car, Users } from 'lucide-react';

function BarChart({ data, max, color = 'gold' }) {
  if (!data || data.length === 0) return <p className="text-white/20 text-sm">Aucune donnée</p>;
  const maxVal = max || Math.max(...data.map(d => d.value), 1);
  const colors = { gold: 'bg-gold-500', emerald: 'bg-emerald-500', blue: 'bg-blue-500' };
  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-white/40 text-xs w-24 truncate text-right flex-shrink-0">{item.label}</span>
          <div className="flex-1 bg-white/[0.05] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors[color] || colors.gold}`}
              style={{ width: `${Math.max(2, (item.value / maxVal) * 100)}%` }}
            />
          </div>
          <span className="text-white/60 text-xs w-8 text-right flex-shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'gold' }) {
  const c = {
    gold:    { line: 'from-gold-500/0 via-gold-500 to-gold-500/0',          glow: 'bg-gold-500/8',    icon: 'bg-gold-500/15 text-gold-400',      grad: 'from-gold-300 to-gold-500' },
    emerald: { line: 'from-emerald-500/0 via-emerald-500 to-emerald-500/0', glow: 'bg-emerald-500/8', icon: 'bg-emerald-500/15 text-emerald-400', grad: 'from-emerald-300 to-emerald-400' },
    blue:    { line: 'from-blue-500/0 via-blue-500 to-blue-500/0',          glow: 'bg-blue-500/8',    icon: 'bg-blue-500/15 text-blue-400',       grad: 'from-blue-300 to-blue-400' },
    purple:  { line: 'from-purple-500/0 via-purple-500 to-purple-500/0',    glow: 'bg-purple-500/8',  icon: 'bg-purple-500/15 text-purple-400',   grad: 'from-purple-300 to-purple-400' },
  }[color];
  return (
    <div className="relative bg-[#141414] border border-white/[0.07] rounded-2xl p-5 overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.line}`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${c.glow} blur-3xl pointer-events-none`} />
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
          <Icon size={18} />
        </div>
        <div className={`font-display font-black text-3xl bg-gradient-to-br ${c.grad} bg-clip-text text-transparent mb-1 tabular-nums leading-none`}>{value}</div>
        <div className="text-white/70 font-semibold text-sm mb-0.5">{label}</div>
        {sub && <div className="text-white/25 text-xs">{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState(30); // days

  const [stats, setStats] = useState({
    totalViews: 0, uniqueSessions: 0, mobileRatio: 0,
    topPages: [], topCars: [], topCountries: [], byDay: [],
    carViews: 0, bookingViews: 0,
  });

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();

    const [pvRes, cvRes] = await Promise.all([
      supabase.from('page_views').select('*').gte('created_at', since),
      supabase.from('car_views').select('*, cars(name)').gte('created_at', since),
    ]);

    const pv = pvRes.data || [];
    const cv = cvRes.data || [];

    // Total views
    const totalViews = pv.length;

    // Unique sessions
    const uniqueSessions = new Set(pv.map(v => v.session_id).filter(Boolean)).size;

    // Device ratio
    const mobile = pv.filter(v => v.device === 'mobile').length;
    const mobileRatio = totalViews > 0 ? Math.round((mobile / totalViews) * 100) : 0;

    // Top pages
    const pageCount = {};
    pv.forEach(v => { pageCount[v.page] = (pageCount[v.page] || 0) + 1; });
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label: label || '/', value }));

    // Top countries
    const countryCount = {};
    pv.filter(v => v.country).forEach(v => {
      countryCount[v.country] = (countryCount[v.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    // Top cars by views
    const carCount = {};
    cv.forEach(v => {
      const name = v.cars?.name || v.car_id;
      carCount[name] = (carCount[name] || 0) + 1;
    });
    const topCars = Object.entries(carCount)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    // Views by day (last N days)
    const byDay = [];
    for (let i = Math.min(period, 14) - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const dayStr = d.toISOString().split('T')[0];
      const value = pv.filter(v => v.created_at?.startsWith(dayStr)).length;
      byDay.push({ label, value });
    }

    setStats({
      totalViews, uniqueSessions, mobileRatio,
      topPages, topCars, topCountries, byDay,
      carViews: cv.length,
      bookingViews: pv.filter(v => v.page?.includes('reservation')).length,
    });
    setLoading(false);
  };

  const deviceData = [
    { label: 'Mobile',  value: Math.round(stats.mobileRatio) },
    { label: 'Desktop', value: 100 - stats.mobileRatio },
  ];

  return (
    <>
      <Head><title>Analytics — Fik Admin</title></Head>
      <AdminLayout title="Analytics">
        {/* Period selector */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest">{period} derniers jours</p>
          <div className="flex gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === d ? 'bg-gold-500 text-noir-950' : 'text-white/40 hover:text-white'
                }`}>
                {d}j
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Eye}        label="Pages vues"      value={stats.totalViews}    sub={`${period} derniers jours`} color="gold" />
              <StatCard icon={Users}      label="Sessions uniques" value={stats.uniqueSessions} sub="visiteurs distincts"        color="blue" />
              <StatCard icon={Smartphone} label="Mobile"           value={`${stats.mobileRatio}%`} sub="des visites"            color="emerald" />
              <StatCard icon={Car}        label="Fiches vues"      value={stats.carViews}      sub="visites véhicules"           color="purple" />
            </div>

            {/* Visits by day */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                <TrendingUp size={13} className="text-gold-400" />
                Visites par jour
              </h2>
              {stats.byDay.length > 0 ? (
                <div className="flex items-end gap-1.5 h-32">
                  {stats.byDay.map((d) => {
                    const maxDay = Math.max(...stats.byDay.map(x => x.value), 1);
                    const pct = Math.max(4, (d.value / maxDay) * 100);
                    return (
                      <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                          <div
                            className="w-full bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-sm group-hover:from-gold-500 group-hover:to-gold-300 transition-all"
                            style={{ height: `${pct}%` }}
                          />
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {d.value}
                          </span>
                        </div>
                        <span className="text-[9px] text-white/25 hidden sm:block">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/20 text-sm">Aucune donnée pour cette période. Assurez-vous que le tracking est activé.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Top pages */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Pages les plus visitées</h2>
                {stats.topPages.length > 0
                  ? <BarChart data={stats.topPages} color="gold" />
                  : <p className="text-white/20 text-sm">Aucune donnée</p>
                }
              </div>

              {/* Top cars */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Car size={13} className="text-gold-400" />
                  Véhicules les plus vus
                </h2>
                {stats.topCars.length > 0
                  ? <BarChart data={stats.topCars} color="emerald" />
                  : <p className="text-white/20 text-sm">Aucune donnée</p>
                }
              </div>

              {/* Top countries */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Globe size={13} className="text-gold-400" />
                  Pays visiteurs
                </h2>
                {stats.topCountries.length > 0
                  ? <BarChart data={stats.topCountries} color="blue" />
                  : <p className="text-white/20 text-sm">Données géo disponibles après premières visites.</p>
                }
              </div>
            </div>

            {/* Microsoft Clarity embed */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Monitor size={13} className="text-blue-400" />
                  Microsoft Clarity
                  <span className="text-white/25 text-[10px] font-normal normal-case tracking-normal">heatmaps & enregistrements</span>
                </h2>
                <a href="https://clarity.microsoft.com/projects/view/wzu6j89axc" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Ouvrir Clarity →
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://clarity.microsoft.com/projects/view/wzu6j89axc/heatmaps" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 transition-all group">
                  <span className="text-2xl">🔥</span>
                  <span className="text-white font-semibold text-sm">Cartes thermiques</span>
                  <span className="text-white/30 text-xs">Zones de clics et scrolls</span>
                </a>
                <a href="https://clarity.microsoft.com/projects/view/wzu6j89axc/recordings" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 transition-all group">
                  <span className="text-2xl">🎬</span>
                  <span className="text-white font-semibold text-sm">Enregistrements</span>
                  <span className="text-white/30 text-xs">Replay sessions clients</span>
                </a>
              </div>
            </div>

            {/* Conversion */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Entonnoir de conversion</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Visites totales',      value: stats.totalViews,    color: 'text-white' },
                  { label: 'Vues véhicules',       value: stats.carViews,      color: 'text-gold-400' },
                  { label: 'Pages réservation',    value: stats.bookingViews,  color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center bg-white/[0.03] rounded-xl p-4">
                    <div className={`font-display font-black text-3xl mb-1 ${color}`}>{value}</div>
                    <div className="text-white/40 text-xs">{label}</div>
                    {stats.totalViews > 0 && (
                      <div className="text-white/20 text-[10px] mt-1">
                        {Math.round((value / stats.totalViews) * 100)}% du trafic
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
