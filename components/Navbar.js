import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/cars', label: 'Véhicules' },
    { href: '/conditions', label: 'Conditions' },
    { href: '/reviews', label: 'Avis' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-noir-950/95 backdrop-blur-md border-b border-white/5 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="text-noir-950 font-black text-sm">FC</span>
          </div>
          <span className="font-display font-bold text-xl text-white">
            Fik<span className="text-gold-500">Conciergerie</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                router.pathname === link.href
                  ? 'text-gold-500'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/admin" className="text-sm text-white/70 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-white/50 hover:text-red-400 transition-colors">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/reservation" className="btn-gold text-sm py-2 px-5">
                Réserver
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-noir-900 border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-gold-500 transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-4">
            {user ? (
              <>
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-white/80 py-1">Dashboard</Link>
                <button onClick={handleLogout} className="text-red-400 text-sm py-1">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-white/80 py-1">Connexion</Link>
                <Link href="/reservation" onClick={() => setMenuOpen(false)} className="btn-gold text-sm mt-2 text-center block">Réserver</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
