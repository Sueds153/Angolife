import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { InterstitialAd } from './ads/InterstitialAd';
import { PublicityService } from '../services/PublicityService';

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick: (mode: 'login' | 'register') => void;
}

import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';

const Navbar: React.FC<{ onAuthClick: (mode: 'login' | 'register') => void }> = ({ onAuthClick }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="flex items-center justify-between border-b border-border-gold bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="flex flex-col items-center leading-none">
            <span className="text-gold-primary text-[8px] font-black uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-300">
              su-golden
            </span>
            <div className="h-[1px] w-full bg-gold-primary mt-0.5 group-hover:scale-x-110 transition-transform"></div>
          </div>
          <h2 className="text-gray-900 dark:text-white text-2xl font-extrabold tracking-tight transition-colors">
            ANGO<span className="text-gold-primary">LIFE</span>
          </h2>
        </Link>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <nav className="hidden lg:flex items-center gap-9 mr-4">
          <Link to="/exchange" className={`text-sm font-semibold transition-colors ${isActive('/exchange') ? 'text-gold-primary' : 'text-gray-500 dark:text-gray-300 hover:text-gold-primary'}`}>Câmbio</Link>
          <Link to="/jobs" className={`text-sm font-semibold transition-colors ${isActive('/jobs') ? 'text-gold-primary' : 'text-gray-500 dark:text-gray-300 hover:text-gold-primary'}`}>Empregos</Link>
          <Link to="/promotions" className={`text-sm font-semibold transition-colors ${isActive('/promotions') ? 'text-gold-primary' : 'text-gray-500 dark:text-gray-300 hover:text-gold-primary'}`}>Promoções</Link>
          {AuthService.isAdmin(user) && <Link to="/admin" className={`text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-gold-primary' : 'text-gray-500 dark:text-gray-300 hover:text-gold-primary'}`}>Admin</Link>}
        </nav>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="size-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gold-dark dark:text-gold-primary hover:bg-gold-primary/10 transition-all focus:outline-none"
        >
          <span className="material-symbols-outlined text-lg">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="w-[1px] h-8 bg-border-gold mx-2"></div>

        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">Membro Elite</span>
                <span className="text-xs font-black text-gray-900 dark:text-white max-w-[100px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="size-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                title="Sair"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onAuthClick('login')}
                className="text-gray-500 dark:text-gray-300 hover:text-gold-primary text-sm font-bold transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => onAuthClick('register')}
                className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-full h-10 px-6 bg-gold-gradient text-background-dark text-sm font-black uppercase tracking-widest shadow-lg shadow-gold-primary/20 hover:scale-105 transition-transform active:scale-95"
              >
                Cadastrar
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-[#050505] py-16 px-10 border-t border-border-gold mt-12 transition-colors duration-300">
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center leading-none">
            <span className="text-gold-primary text-[10px] font-black uppercase tracking-[0.2em]">
              su-golden
            </span>
            <div className="h-[1px] w-full bg-gold-primary mt-0.5"></div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">ANGO<span className="text-gold-primary">LIFE</span></h2>
        </div>
        <p className="text-gray-600 dark:text-gray-500 leading-relaxed max-w-md">Liderança e transparência no mercado angolano. A sua fonte definitiva para economia e negócios de alto padrão.</p>
      </div>
      <div className="flex flex-col gap-4">
        <h5 className="font-black text-gold-primary uppercase tracking-widest">Plataforma</h5>
        <div className="flex flex-col gap-3">
          <Link to="/exchange" className="text-gray-500 dark:text-gray-400 hover:text-gold-primary w-fit">Câmbio Real</Link>
          <Link to="/jobs" className="text-gray-500 dark:text-gray-400 hover:text-gold-primary w-fit">Oportunidades Elite</Link>
          <Link to="/promotions" className="text-gray-500 dark:text-gray-400 hover:text-gold-primary w-fit">Descontos da Banda</Link>
        </div>
      </div>
    </div>
    <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-gray-200 dark:border-white/5 flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-600 uppercase tracking-widest transition-colors">
      <p>© 2024 AngoLife by Su-Golden. Angola.</p>
      <div className="flex gap-4">
        <span className="material-symbols-outlined text-gold-primary/60 hover:text-gold-primary cursor-pointer transition-colors">public</span>
        <span className="material-symbols-outlined text-gold-primary/60 hover:text-gold-primary cursor-pointer transition-colors">share</span>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<LayoutProps> = ({ children, onAuthClick }) => {
  const location = useLocation();
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    // Check for interstitial on route change
    // We delay slightly to not block immediate navigation perception
    const timer = setTimeout(() => {
      if (PublicityService.shouldShowInterstitial()) {
        setShowInterstitial(true);
        PublicityService.recordInterstitialShown();
      }
    }, 2000); // 2-second delay after navigation

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-white">
      <Navbar onAuthClick={onAuthClick} />
      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-4 md:px-10 lg:px-20 py-8">
        {children}
      </main>
      <Footer />

      {/* Global Interstitial Ad */}
      <InterstitialAd
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
      />
    </div>
  );
};
