import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Promotions } from './pages/Promotions';
import { PromotionDetail } from './pages/PromotionDetail';
import { Admin } from './pages/Admin';
import { Exchange } from './pages/Exchange';
import { AuthOverlay } from './components/AuthOverlay';
import { ExchangeRate, JobListing, Promotion } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { News } from '@/pages/News';
import { NewsDetail } from '@/pages/NewsDetail';
import { ResetPassword } from './pages/ResetPassword';
import { AuthService } from './services/AuthService';
import { ExchangeService } from './services/ExchangeService';
import { JobService } from './services/JobService';
import { PromotionService } from './services/PromotionService';

const App: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const loadedRates = await ExchangeService.getRates();
      setRates(loadedRates);

      const loadedJobs = await JobService.fetchJobs();
      setJobs(loadedJobs);

      const loadedPromos = await PromotionService.fetchPromotions();
      setPromotions(loadedPromos);
    };
    loadData();
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
          jobs={jobs}
          promotions={promotions}
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
  jobs: JobListing[];
  promotions: Promotion[];
  authMode: 'login' | 'register' | null;
  setAuthMode: (mode: 'login' | 'register' | null) => void;
  updateInformalRate: (curr: string, val: number) => void;
}> = ({ rates, jobs, promotions, authMode, setAuthMode, updateInformalRate }) => {
  const { user, loading } = useAuth();

  return (
    <ToastProvider>
      <FavoritesProvider>
        <Router>
          <Layout onAuthClick={(mode) => setAuthMode(mode)}>
            <Routes>
              <Route path="/" element={<Home rates={rates} jobs={jobs.slice(0, 3)} promotions={promotions.slice(0, 2)} />} />
              <Route path="/exchange" element={<Exchange rates={rates} />} />
              <Route path="/jobs" element={<Jobs jobs={jobs} />} />
              <Route path="/jobs/:id" element={<JobDetail jobs={jobs} />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/promotions" element={<Promotions promotions={promotions} />} />
              <Route path="/promotions/:id" element={<PromotionDetail promotions={promotions} />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={
                !loading && AuthService.isAdmin(user) ? (
                  <Admin rates={rates} onUpdate={updateInformalRate} />
                ) : (
                  <Home rates={rates} jobs={jobs.slice(0, 3)} promotions={promotions.slice(0, 2)} />
                )
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
