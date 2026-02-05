import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { InterstitialAd } from './ads/InterstitialAd';
import { BannerCard } from './BannerCard';
import { PublicityService } from '../services/PublicityService';
import { User } from '@supabase/supabase-js';

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick: (mode: 'login' | 'register') => void;
}

import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';

const Navbar: React.FC<{ onAuthClick: (mode: 'login' | 'register') => void }> = ({ onAuthClick }) => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      AuthService.isAdmin(user).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  console.log('Navbar Render - User:', user?.email);

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
          {user && (
            <Link to="/profile" className={`text-sm font-bold px-3 py-1 rounded-md transition-all ${isActive('/profile') ? 'bg-gold-primary text-background-dark' : 'text-gold-primary hover:bg-gold-primary/10'}`}>
              MEU PERFIL
            </Link>
          )}
          {isAdmin && <Link to="/admin" className={`text-sm font-semibold transition-colors ${isActive('/admin') ? 'text-gold-primary' : 'text-gray-500 dark:text-gray-300 hover:text-gold-primary'}`}>Admin</Link>}
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
              <Link to="/profile" className="flex items-center gap-4 bg-gold-primary text-background-dark pl-5 pr-2 py-2 rounded-2xl shadow-xl hover:scale-105 transition-all group border-2 border-transparent hover:border-white/20">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Aceder Perfil</span>
                  <span className="text-xs font-black truncate max-w-[100px]">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-background-dark/20 flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl">account_circle</span>
                </div>
              </Link>
              <button
                onClick={signOut}
                className="size-11 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg"
                title="Sair"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
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

const Footer: React.FC<{ user: User | null, onAuthClick: (mode: 'login' | 'register') => void }> = ({ user, onAuthClick }) => (
  <footer className="bg-white dark:bg-[#050505] py-16 px-10 border-t border-border-gold mt-12 transition-colors duration-300">
    {!user && (
      <div className="max-w-[1280px] mx-auto mb-16 p-8 rounded-3xl bg-gold-primary/5 border border-gold-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-700">
        <div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Evolua sua carreira com o AngoLife</h4>
          <p className="text-gray-500 text-sm max-w-lg">Crie a sua conta gratuita hoje para aceder a oportunidades exclusivas e ferramentas financeiras avançadas.</p>
        </div>
        <button 
          onClick={() => onAuthClick('register')}
          className="px-10 py-4 bg-gold-gradient text-background-dark font-black rounded-xl uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-105 transition-transform shrink-0"
        >
          Cadastrar Grátis
        </button>
      </div>
    )}
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

const BottomNav: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl flex items-center justify-around px-4 z-50 shadow-2xl transition-all animate-in slide-in-from-bottom-10 duration-700">
      <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-gold-primary scale-110' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-xl">home</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
      </Link>
      <Link to="/exchange" className={`flex flex-col items-center gap-1 transition-all ${isActive('/exchange') ? 'text-gold-primary scale-110' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-xl">currency_exchange</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Câmbio</span>
      </Link>
      <Link to="/jobs" className={`flex flex-col items-center gap-1 transition-all ${isActive('/jobs') ? 'text-gold-primary scale-110' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-xl">work</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Vagas</span>
      </Link>
      <Link to="/news" className={`flex flex-col items-center gap-1 transition-all ${isActive('/news') ? 'text-gold-primary scale-110' : 'text-gray-400'}`}>
        <span className="material-symbols-outlined text-xl">newspaper</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Notícias</span>
      </Link>
      {isAdmin && (
        <Link to="/admin" className={`flex flex-col items-center gap-1 transition-all ${isActive('/admin') ? 'text-gold-primary scale-110' : 'text-gray-400'}`}>
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      )}
    </nav>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, onAuthClick }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    if (user) {
      AuthService.isAdmin(user).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-background-dark dark:text-white pb-[100px] md:pb-[120px]">
      <Navbar onAuthClick={onAuthClick} />
      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-4 md:px-10 lg:px-20 py-8">
        {children}
      </main>
      <Footer user={user} onAuthClick={onAuthClick} />
      
      <BottomNav isAdmin={isAdmin} />

      {/* Fixed Footer AdMob Banner */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
        <div className="max-w-[320px] md:max-w-[728px] mx-auto pointer-events-auto">
           <BannerCard type="banner" className="shadow-2xl border-gold-primary/30" />
        </div>
      </div>

      {/* Global Interstitial Ad */}
      <InterstitialAd
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
      />
    </div>
  );
};
