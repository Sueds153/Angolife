import React, { useState, useEffect, useCallback } from 'react';
import { ExchangeRate, JobListing, Promotion } from '../types';
import { Link } from 'react-router-dom';

import { CrawlerService } from '../services/CrawlerService';
import { JobService } from '../services/JobService';
import { PromotionService } from '../services/PromotionService';
import { NewsService } from '../services/NewsService';
import { useToast } from '../context/ToastContext';

// Modular Components
import { AdminRates } from '../components/admin/AdminRates';
import { AdminJobs } from '../components/admin/AdminJobs';
import { AdminPromotions } from '../components/admin/AdminPromotions';

interface AdminProps {
  rates: ExchangeRate[];
  onUpdate: (currency: string, rate: number) => void;
}

export const Admin: React.FC<AdminProps> = ({ rates, onUpdate }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<JobListing[]>([]);
  const [pendingPromos, setPendingPromos] = useState<Promotion[]>([]);

  const { addToast } = useToast();

  const loadPendingJobs = useCallback(async () => {
    try {
      const jobs = await JobService.fetchPendingJobs();
      setPendingJobs(jobs);
    } catch {
      addToast('Erro ao carregar vagas pendentes', 'error');
    }
  }, [addToast]);

  const loadPendingPromos = useCallback(async () => {
    try {
      const promos = await PromotionService.fetchPendingPromotions();
      setPendingPromos(promos);
    } catch {
      addToast('Erro ao carregar promoções pendentes', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadPendingJobs();
    loadPendingPromos();
  }, [loadPendingJobs, loadPendingPromos]);

  const handleSyncJobs = async () => {
    setIsSyncing(true);
    addToast('Sincronizando todas as fontes (Vagas + Descontos)...', 'info');

    try {
      const jobCount = await CrawlerService.runAutoCrawler();
      const promoCount = await CrawlerService.runPromotionCrawler();
      addToast(`${jobCount} vagas e ${promoCount} descontos coletados!`, 'success');
      loadPendingJobs();
      loadPendingPromos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      addToast(`Erro na sincronização: ${message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncNews = async () => {
    setIsSyncing(true);
    addToast('Buscando notícias reais do mercado...', 'info');
    try {
      const count = await NewsService.syncRealNews();
      addToast(`${count} notícias atualizadas!`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      addToast(`Erro news sync: ${message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Painel de <span className="text-gold-primary">Gestão</span>
          </h1>
          <p className="text-gray-500">Controle total sobre taxas informais e moderação de conteúdos.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSyncJobs}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isSyncing ? 'bg-gray-500 cursor-wait' : 'bg-white/10 text-gold-primary border border-gold-primary/30 hover:bg-gold-primary hover:text-black'}`}
          >
            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Vagas (AI)'}
          </button>
          <button
            onClick={handleSyncNews}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isSyncing ? 'bg-gray-500 cursor-wait' : 'bg-gold-primary text-black border border-gold-primary/30 hover:bg-black hover:text-gold-primary'}`}
          >
            <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>newspaper</span>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Notícias'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/news"
          className="glass-card p-6 flex items-center justify-between group hover:border-gold-primary transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary">
              <span className="material-symbols-outlined">newspaper</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Gestão de Notícias</h3>
              <p className="text-xs text-gray-500">Publicar Reels e Notícias Económicas</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-gold-primary transition-colors">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Modularized Sections */}
      <AdminJobs
        pendingJobs={pendingJobs}
        loadPendingJobs={loadPendingJobs}
        isSyncing={isSyncing}
      />

      <AdminPromotions
        pendingPromos={pendingPromos}
        loadPendingPromos={loadPendingPromos}
      />

      <AdminRates
        rates={rates}
        onUpdate={onUpdate}
      />

      {/* Auditoria & Status (Keep as logic is simple) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-border-gold pb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-primary">analytics</span> Auditoria de Integridade
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-400">API de Câmbio (ER-API)</span>
              </div>
              <span className="text-[10px] text-green-500 font-black">ONLINE • 120ms</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-400">Bots de Vagas (AI-Scraper)</span>
              </div>
              <span className="text-[10px] text-green-500 font-black">PRONTO</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-gold-primary"></div>
                <span className="text-xs font-bold text-gray-400">Base de Dados (Supabase)</span>
              </div>
              <span className="text-[10px] text-gold-primary font-black">CONECTADO</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-border-gold pb-4">Actividade do Servidor</h3>
          <div className="flex flex-col gap-4 text-xs font-mono text-gray-500">
            <p className="flex justify-between"><span>[OK] Sincronização BNA completa</span> <span>09:42:01</span></p>
            <p className="flex justify-between text-green-500"><span>[FETCH] API de Câmbio retornou dados reais</span> <span>Actual</span></p>
            <p className="flex justify-between"><span>[OK] Jobs Scraper finalizado: +12 novas vagas</span> <span>09:00:15</span></p>
            <p className="flex justify-between text-gold-primary"><span>[LOG] Admin atualizou taxa USD Informal para 1250.00</span> <span>08:15:33</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
