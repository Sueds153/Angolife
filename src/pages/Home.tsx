import React, { useState, useEffect } from 'react';
import { ExchangeRate, JobListing, Promotion } from '../types';
import { Newsletter } from '../components/Newsletter';
import { BannerCard } from '../components/BannerCard';
import { Link } from 'react-router-dom';

interface HomeProps {
  rates: ExchangeRate[];
  jobs: JobListing[];
  promotions: Promotion[];
}

export const Home: React.FC<HomeProps> = ({ rates, jobs, promotions }) => {
  const [insight, setInsight] = useState<string>("Processando análise de mercado...");

  useEffect(() => {
    // Mocking gemini service if removed
    setInsight("Mercado favorável para investimento em moeda estrangeira.");
  }, [rates]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0">
        <div className="flex flex-col gap-4 sticky top-28">
          <div className="flex flex-col px-3 mb-2">
            <h1 className="text-gold-primary text-xs font-bold uppercase tracking-widest">Menu Principal</h1>
            <p className="text-gray-500 text-[10px]">Serviços Exclusivos</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-primary/10 text-gold-primary border border-gold-primary/20">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-bold">Dashboard</p>
            </div>
            <Link to="/jobs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-surface-dark hover:text-gold-primary rounded-xl cursor-pointer transition-all border border-transparent hover:border-border-gold">
              <span className="material-symbols-outlined">work</span>
              <p className="text-sm font-medium">Vagas de Luxo</p>
            </Link>
            <Link to="/promotions" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-surface-dark hover:text-gold-primary rounded-xl cursor-pointer transition-all border border-transparent hover:border-border-gold">
              <span className="material-symbols-outlined">stars</span>
              <p className="text-sm font-medium">Descontos Banda</p>
            </Link>
          </div>
          <BannerCard type="sidebar" className="mt-8" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <BannerCard type="banner" />

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Monitor de Câmbio <span className="text-gold-primary">Kwanza</span></h2>
              <p className="text-gold-dark/70 text-sm font-medium mt-1">Oficial BNA vs Mercado Informal</p>
            </div>
            <div className="flex items-center gap-2 text-gold-primary text-sm font-bold">
              <span className="size-2 bg-gold-primary rounded-full animate-pulse"></span> Em Directo
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rates.map((rate) => (
              <React.Fragment key={rate.currency}>
                <div className="glass-card flex flex-col gap-3 rounded-2xl p-6 shadow-xl relative group">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{rate.currency} Formal (BNA)</p>
                    <span className="text-gold-primary material-symbols-outlined">trending_up</span>
                  </div>
                  <p className="text-gray-900 dark:text-white text-3xl font-black">{rate.formal.toFixed(2)} <span className="text-xs text-gold-dark font-normal">AOA</span></p>
                  <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-bold bg-green-400/10 self-start px-2 py-1 rounded-full">
                    Estável
                  </div>
                </div>
                <div className="glass-card flex flex-col gap-3 rounded-2xl p-6 shadow-xl border-t-2 border-t-gold-primary bg-gold-primary/5">
                  <div className="flex justify-between items-start">
                    <p className="text-gold-primary text-xs font-bold uppercase tracking-wider">{rate.currency} Informal</p>
                    <span className="text-gold-primary material-symbols-outlined">analytics</span>
                  </div>
                  <p className="text-gray-900 dark:text-white text-3xl font-black">{rate.informal.toLocaleString('pt-AO')} <span className="text-xs text-gold-dark font-normal">AOA</span></p>
                  <div className="flex items-center gap-1.5 text-gold-primary text-[10px] font-bold bg-gold-primary/10 self-start px-2 py-1 rounded-full">
                    {rate.change} hoje
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-gold pb-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-gold-primary">workspace_premium</span> Oportunidades Elite
              </h3>
              <Link to="/jobs" className="text-xs text-gold-primary font-bold uppercase tracking-tighter">Ver Tudo</Link>
            </div>
            <div className="flex flex-col gap-3">
              {jobs.map((job, index) => (
                <Link
                  to={`/jobs/${job.id}`}
                  key={job.id}
                  className="flex items-center gap-4 p-4 glass-card rounded-2xl border-l-4 border-l-gold-primary hover:bg-gold-primary/5 transition-all cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center shrink-0 border border-gold-primary/20">
                    <span className="text-gold-primary material-symbols-outlined">business</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-gold-primary">{job.title}</h4>
                    <p className="text-xs text-gold-dark/60 font-medium">{job.company} • {job.location}</p>
                  </div>
                  <span className="material-symbols-outlined text-gold-primary/40 group-hover:text-gold-primary">chevron_right</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-gold pb-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-gold-primary">stars</span> Os Descontos da Banda
              </h3>
              <Link to="/promotions" className="text-xs text-gold-primary font-bold uppercase tracking-tighter">Explorar</Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {promotions.map((promo) => (
                <Link to={`/promotions/${promo.id}`} key={promo.id} className="flex gap-4 p-4 glass-card rounded-2xl group hover:border-gold-primary/40 transition-all">
                  <div className="size-24 rounded-xl bg-cover bg-center shrink-0 border border-border-gold" style={{ backgroundImage: `url('${promo.image}')` }}></div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-gold-primary">{promo.productName}</h4>
                        <span className="text-gold-primary font-black text-sm">{promo.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{promo.store}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] px-2 py-1 rounded bg-gold-primary text-background-dark font-black uppercase tracking-tighter">Verificado</span>
                      <div className="material-symbols-outlined text-gold-primary text-sm hover:scale-110">chat</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <Newsletter />
        <BannerCard type="sponsored" />
      </div>

      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
        <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-24 bg-gold-primary/10 rounded-full blur-2xl"></div>
          <h4 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="size-2 bg-gold-primary rounded-full"></span> Pulso do Mercado
          </h4>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Confiança Cambial</span>
                <span className="text-xs font-black text-gold-primary">94%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-gold-gradient h-full w-[94%]"></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gold-primary/5 border border-gold-primary/10">
              <p className="text-[10px] text-gold-primary font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_awesome</span> Insight AI
              </p>
              <p className="text-xs text-gray-400 italic leading-relaxed">"{insight}"</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
