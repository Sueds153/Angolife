import React, { useState, useEffect } from 'react';
import { ExchangeRate } from '../types';
import { BannerCard } from '../components/BannerCard';
import { useToast } from '../context/ToastContext';
import { NotificationService } from '../services/NotificationService';
import { RewardedAd } from '../components/ads/RewardedAd';
import { PublicityService } from '../services/PublicityService';
import { useAuth } from '../context/AuthContext';

interface ExchangeProps {
  rates: ExchangeRate[];
}

export const Exchange: React.FC<ExchangeProps> = ({ rates }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(rates[0]?.currency || 'USD');
  const [insight, setInsight] = useState<string>("Processando análise de mercado em tempo real...");
  const [showRewarded, setShowRewarded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pendingAlert, setPendingAlert] = useState(false);
  const { addToast } = useToast();

  const handleUnlockInsight = () => {
    const check = PublicityService.canShowRewarded();
    if (!check.can) {
      addToast(check.reason || 'Anúncio indisponível no momento.', 'info');
      return;
    }
    setPendingAlert(false); // Mode: Insight
    setShowRewarded(true);
  };

  const handleCreateAlert = async () => {
    const check = PublicityService.canShowRewarded();
    if (!check.can) {
      addToast(check.reason || 'Aguarde o intervalo entre anúncios.', 'info');
      return;
    }
    setPendingAlert(true);
    setShowRewarded(true);
  };

  const executeCreateAlert = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      addToast('Alerta de Câmbio Ativado! 🎉', 'success');
      NotificationService.sendNotification(
        'Monitor de Câmbio Ativo', 
        'Parabéns! Você será notificado quando as taxas mudarem.'
      );
    } else {
      addToast('Precisamos de permissão para enviar alertas.', 'error');
    }
  };

  const handleRewardEarned = () => {
    if (pendingAlert) {
        executeCreateAlert();
        setPendingAlert(false);
    } else {
        setIsUnlocked(true);
        addToast('Análise Completa Desbloqueada!', 'success');
    }
    PublicityService.recordRewardedShown();
  };

  useEffect(() => {
    // Mocking gemini service since file was removed
    setInsight("O diferencial cambial mantém-se estável esta semana, favorecendo compras no mercado formal para importadores.");
  }, [rates]);

  const currentRate = rates.find(r => r.currency === selectedCurrency);
  const formalResult = currentRate ? (parseFloat(amount || '0') * currentRate.formal) : 0;
  const informalResult = currentRate ? (parseFloat(amount || '0') * currentRate.informal) : 0;

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-gold-primary text-3xl">currency_exchange</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight italic">Monitor <span className="text-gold-primary">Cambial</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Actualizado em tempo real • Mercado Angolano</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column: Converter & Detailed Rates */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* CURRENCY CONVERTER - LUXURY EDITION */}
          <div className="glass-card rounded-3xl p-8 border border-gold-primary/20 bg-gradient-to-br from-surface-dark to-background-dark shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-9xl text-gold-primary">calculate</span>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
              <span className="w-10 h-[2px] bg-gold-primary"></span> Conversor de Moeda
            </h2>

            <div className="flex flex-col gap-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Amount */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-1">Valor a Converter</label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white dark:bg-background-dark/80 border border-border-gold rounded-2xl p-5 text-2xl font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-primary focus:border-gold-primary outline-none transition-all placeholder:text-gray-800"
                      placeholder="0.00"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="bg-gold-primary text-background-dark font-black rounded-lg border-none text-sm px-3 py-1 cursor-pointer focus:ring-0"
                      >
                        {rates.map(r => (
                          <option key={r.currency} value={r.currency}>{r.currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Arrow Icon in between on mobile or side on desktop */}
                <div className="flex items-center justify-center md:pt-6">
                  <div className="size-12 rounded-full border border-gold-primary/30 flex items-center justify-center text-gold-primary bg-gold-primary/5">
                    <span className="material-symbols-outlined text-2xl">sync_alt</span>
                  </div>
                </div>
              </div>

              {/* RESULTS GRID */}
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Formal Result */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 group hover:border-gold-primary/20 transition-all">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Valor Formal (BNA)</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{formalResult.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
                      <span className="text-sm text-gold-primary font-bold mb-1">AOA</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-green-500 uppercase">
                      <span className="material-symbols-outlined text-xs">verified</span> Taxa Oficial
                    </div>
                  </div>

                  {/* Informal Result */}
                  <div className="p-6 rounded-2xl bg-gold-primary/5 border border-gold-primary/20 flex flex-col gap-1 group hover:border-gold-primary/40 transition-all">
                    <span className="text-[10px] text-gold-primary uppercase font-black tracking-widest">Valor Informal (Kinguila)</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{informalResult.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
                      <span className="text-sm text-gold-primary font-bold mb-1">AOA</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-gold-primary uppercase tracking-tighter">
                      <span className="material-symbols-outlined text-xs">show_chart</span> Câmbio de Rua
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-gold-primary/20 animate-in fade-in zoom-in-95 duration-500">
                    <span className="material-symbols-outlined text-gold-primary text-4xl mb-3">lock</span>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Acesso Exclusivo</h4>
                    <p className="text-[10px] text-gray-300 mb-4 max-w-[200px]">Crie uma conta gratuita para converter valores e activar alertas reais.</p>
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))}
                      className="px-6 py-2.5 bg-gold-gradient text-background-dark text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-gold-primary/20 hover:scale-105 transition-transform"
                    >
                      Cadastrar Grátis
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Market Comparison */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-[2px] bg-gold-primary"></span> Mercados em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rates.map(rate => (
                <div key={rate.currency} className="glass-card rounded-2xl overflow-hidden group border border-border-gold">
                  <div className="bg-gold-primary/5 p-4 border-b border-border-gold flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-background-dark border border-gold-primary/30 flex items-center justify-center text-xs font-black text-gold-primary">
                        {rate.currency}
                      </div>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{rate.currency === 'USD' ? 'Dólar Americano' : 'Euro Europeu'}</span>
                    </div>
                    <span className={`material-symbols-outlined text-lg ${rate.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                      {rate.trend === 'up' ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Oficial BNA</span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">{rate.formal.toFixed(2)} <span className="text-[10px] font-normal text-gold-primary">AOA</span></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gold-primary font-black uppercase tracking-widest">Informal</span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">{rate.informal.toLocaleString('pt-AO')} <span className="text-[10px] font-normal text-gold-primary">AOA</span></span>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-gray-600 font-bold uppercase tracking-widest">Fonte: {rate.source?.replace('https://', '') || 'API Integrada'}</span>
                        <span className="text-gold-primary/60">{rate.lastUpdated ? new Date(rate.lastUpdated).toLocaleTimeString() : '--:--'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-600 font-bold">Variação: {rate.change}</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-gray-400 font-black uppercase tracking-widest">Spread: {((rate.informal / rate.formal - 1) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BannerCard type="banner" />
        </div>

        {/* Sidebar: Market Pulse & Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">

          {/* AI MARKET INSIGHT */}
          <div className="glass-card rounded-2xl p-8 border border-gold-primary/30 bg-gold-primary/5 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-gold-primary animate-pulse">auto_awesome</span>
              <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">PULSO DO MERCADO AI</h3>
            </div>
            
            {!isUnlocked ? (
              <div className="flex flex-col gap-4 items-center justify-center py-6 bg-black/20 rounded-xl border border-white/5 text-center px-4">
                <span className="material-symbols-outlined text-gold-primary/40 text-4xl mb-2">lock</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Análise Premium Bloqueada</p>
                <button 
                  onClick={handleUnlockInsight}
                  className="w-full py-3 bg-gold-gradient text-background-dark font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-gold-primary/20"
                >
                  🔓 Ver Análise Completa
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-gold-primary pl-4 py-1 mb-8 animate-in fade-in duration-700">
                "{insight}"
              </p>
            )}

            <RewardedAd 
              isOpen={showRewarded}
              onClose={() => setShowRewarded(false)}
              onReward={handleRewardEarned}
            />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase">
                <span>Pressão Informal</span>
                <span className="text-gold-primary">Alta</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold-gradient w-[78%]"></div>
              </div>

              <button
                onClick={handleCreateAlert}
                className="mt-4 w-full py-3 rounded-xl border border-gold-primary/30 hover:bg-gold-primary/10 text-gold-primary text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">notifications_active</span>
                Criar Alerta de Câmbio
              </button>
            </div>
          </div>

          {/* Informative Card */}
          <div className="glass-card rounded-2xl p-8 border border-border-gold">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Notas de Mercado</h4>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gold-primary text-xl">info</span>
                <p className="text-[11px] text-gray-500 leading-tight">As taxas informais são médias recolhidas nos principais pontos de Luanda (Mutamba, São Paulo, Rocha).</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gold-primary text-xl">history</span>
                <p className="text-[11px] text-gray-500 leading-tight">Actualizamos os valores do Kinguila a cada 2 horas durante o horário comercial.</p>
              </div>
            </div>
          </div>

          <BannerCard type="sidebar" />
        </div>
      </div>
    </div>
  );
};
