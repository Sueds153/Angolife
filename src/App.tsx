import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Promotions } from './pages/Promotions';
import { PromotionDetail } from './pages/PromotionDetail';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { AdminNews } from './pages/AdminNews';
import { Exchange } from './pages/Exchange';
import { AuthOverlay } from './components/AuthOverlay';
import { ProtectedRoute } from './components/ProtectedRoute'; // Added
import { ExchangeRate } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { ResetPassword } from './pages/ResetPassword';
import { ExchangeService } from './services/ExchangeService';
import { NotificationService } from './services/NotificationService';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { useToast } from './context/ToastContext';

const App: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    // Load initial rates only
    const loadData = async () => {
      const loadedRates = await ExchangeService.getRates();
      setRates(loadedRates);
    };
    loadData();

    // Native Initialization
    if (Capacitor.isNativePlatform()) {
      NotificationService.registerPush();
    }
  }, []);

  const updateInformalRate = async (currency: string, newRate: number) => {
    const updatedRates = await ExchangeService.updateInformalRate(currency, newRate);
    setRates(updatedRates);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent
          rates={rates}
          authMode={authMode}
          setAuthMode={setAuthMode}
          updateInformalRate={updateInformalRate}
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC<{
  rates: ExchangeRate[];
  authMode: 'login' | 'register' | null;
  setAuthMode: (mode: 'login' | 'register' | null) => void;
  updateInformalRate: (curr: string, val: number) => void;
}> = ({ rates, authMode, setAuthMode, updateInformalRate }) => {
  const { addToast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Network.addListener('networkStatusChange', status => {
        if (!status.connected) {
          addToast('Você está offline. O app funcionará com dados em cache.', 'info');
        } else {
          addToast('Conexão restabelecida. Atualizando dados...', 'success');
        }
      });
    }
  }, []);

  return (
    <ToastProvider>
      <FavoritesProvider>
        <Router>
          <Layout onAuthClick={(mode) => setAuthMode(mode)}>
            <Routes>
              <Route path="/" element={<Home rates={rates} />} />
              <Route path="/exchange" element={<Exchange rates={rates} />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
               <Route path="/promotions" element={
                <ProtectedRoute>
                  <Promotions />
                </ProtectedRoute>
              } />
              <Route path="/promotions/:id" element={
                <ProtectedRoute>
                  <PromotionDetail />
                </ProtectedRoute>
              } />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <Admin rates={rates} onUpdate={updateInformalRate} />
                </ProtectedRoute>
              } />

              <Route path="/admin/news" element={
                <ProtectedRoute adminOnly>
                  <AdminNews />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
          {authMode && <AuthOverlay mode={authMode} onClose={() => setAuthMode(null)} />}
        </Router>
      </FavoritesProvider>
    </ToastProvider>
  );
};

export default App;
