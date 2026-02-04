import React, { useState, useEffect } from 'react';
import { ExchangeRate, JobListing, Promotion, PromotionCategory } from '../types';

import { CrawlerService } from '../services/CrawlerService';
import { JobService } from '../services/JobService';
import { PromotionService } from '../services/PromotionService';
import { useToast } from '../context/ToastContext';

interface AdminProps {
  rates: ExchangeRate[];
  onUpdate: (currency: string, rate: number) => void;
}

export const Admin: React.FC<AdminProps> = ({ rates, onUpdate }) => {
  const [updates, setUpdates] = useState<{ [key: string]: string }>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<JobListing[]>([]);
  const [pendingPromos, setPendingPromos] = useState<Promotion[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // States for manual posting
  const [showJobForm, setShowJobForm] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', company: '', location: '', type: 'Tempo Inteiro',
    sourceUrl: '', description: '', salary: '', email: '', phone: '', isElite: false
  });
  const [newPromo, setNewPromo] = useState({
    productName: '', price: '', store: '', location: '',
    description: '', userContact: '', category: 'Other' as PromotionCategory
  });

  const { addToast } = useToast();

  useEffect(() => {
    loadPendingJobs();
    loadPendingPromos();
  }, []);

  const loadPendingJobs = async () => {
    try {
      const jobs = await JobService.fetchPendingJobs();
      setPendingJobs(jobs);
    } catch (error) {
      addToast('Erro ao carregar vagas pendentes', 'error');
    }
  };

  const loadPendingPromos = async () => {
    try {
      const promos = await PromotionService.fetchPendingPromotions();
      setPendingPromos(promos);
    } catch (error) {
      addToast('Erro ao carregar promoções pendentes', 'error');
    }
  };

  const handleUpdate = async (currency: string) => {
    const val = parseFloat(updates[currency]);
    if (!isNaN(val)) {
      onUpdate(currency, val);
      setUpdates(prev => ({ ...prev, [currency]: '' })); // Clear input
      addToast('Taxa atualizada com sucesso!', 'success');
    }
  };

  const handleSyncJobs = async () => {
    setIsSyncing(true);
    addToast('Sincronizando todas as fontes (Vagas + Descontos)...', 'info');

    try {
      const jobCount = await CrawlerService.runAutoCrawler();
      const promoCount = await CrawlerService.runPromotionCrawler();
      addToast(`${jobCount} vagas e ${promoCount} descontos coletados!`, 'success');
      loadPendingJobs();
      loadPendingPromos();
    } catch (err: any) {
      addToast(`Erro na sincronização: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await JobService.approveJob(id);
    if (!error) {
      addToast('Vaga aprovada e publicada!', 'success');
      setPendingJobs(prev => prev.filter(j => j.id !== id));
    } else {
      addToast(`Erro ao aprovar vaga: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await JobService.deleteJob(id);
    if (!error) {
      addToast('Vaga removida.', 'info');
      setPendingJobs(prev => prev.filter(j => j.id !== id));
    } else {
      addToast(`Erro ao remover vaga: ${error.message}`, 'error');
    }
  };

  const handleApproveAll = async () => {
    if (pendingJobs.length === 0) return;
    setIsSyncing(true);
    let successCount = 0;

    for (const job of pendingJobs) {
      const { error } = await JobService.approveJob(job.id);
      if (!error) successCount++;
    }

    addToast(`${successCount} vagas aprovadas em massa!`, 'success');
    setPendingJobs([]);
    setIsSyncing(false);
  };

  const handleRejectAll = async () => {
    if (!window.confirm('Tem certeza que deseja descartar TODAS as vagas pendentes?')) return;
    setIsSyncing(true);
    for (const job of pendingJobs) {
      await JobService.deleteJob(job.id);
    }
    addToast('Todas as vagas pendentes foram removidas.', 'info');
    setPendingJobs([]);
    setIsSyncing(false);
  };

  const handleApprovePromo = async (id: string) => {
    const { error } = await PromotionService.approvePromotion(id);
    if (!error) {
      addToast('Promoção aprovada!', 'success');
      setPendingPromos(prev => prev.filter(p => p.id !== id));
    } else {
      addToast(`Erro ao aprovar: ${error.message}`, 'error');
    }
  };

  const handleDeletePromo = async (id: string) => {
    const { error } = await PromotionService.deletePromotion(id);
    if (!error) {
      addToast('Promoção descartada.', 'info');
      setPendingPromos(prev => prev.filter(p => p.id !== id));
    } else {
      addToast(`Erro ao remover: ${error.message}`, 'error');
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await JobService.addJob(newJob, 'published');
    if (!error) {
      addToast('Vaga publicada com sucesso!', 'success');
      setNewJob({ title: '', company: '', location: '', type: 'Tempo Inteiro', sourceUrl: '', description: '', salary: '', email: '', phone: '', isElite: false });
      setShowJobForm(false);
    } else {
      addToast('Erro ao publicar vaga: ' + error.message, 'error');
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await PromotionService.addPromotion({
      ...newPromo,
      image: 'https://picsum.photos/seed/' + Math.floor(Math.random() * 1000) + '/400/400'
    });
    if (!error) {
      addToast('Desconto publicado com sucesso!', 'success');
      setNewPromo({ productName: '', price: '', store: '', location: '', description: '', userContact: '', category: 'Other' });
      setShowPromoForm(false);
    } else {
      addToast('Erro ao publicar desconto: ' + error.message, 'error');
    }
  };

  const getSourceStyle = (source?: string) => {
    switch (source) {
      case 'LinkedIn': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'INEFOP': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Mirantes': return 'bg-gold-primary/10 text-gold-primary border-gold-primary/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Painel de <span className="text-gold-primary">Gestão</span></h1>
          <p className="text-gray-500">Controle total sobre taxas informais e moderação de conteúdos.</p>
        </div>
        <button
          onClick={handleSyncJobs}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isSyncing ? 'bg-gray-500 cursor-wait' : 'bg-white/10 text-gold-primary border border-gold-primary/30 hover:bg-gold-primary hover:text-black'}`}
        >
          <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Vagas (AI)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => { setShowJobForm(!showJobForm); setShowPromoForm(false); }}
          className="glass-card p-6 flex items-center justify-between group hover:border-gold-primary transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary">
              <span className="material-symbols-outlined">add_business</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Publicar Vaga Manual</h3>
              <p className="text-xs text-gray-500">Adicione uma oferta de emprego agora</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-gold-primary transition-colors">
            {showJobForm ? 'expand_less' : 'add'}
          </span>
        </button>

        <button
          onClick={() => { setShowPromoForm(!showPromoForm); setShowJobForm(false); }}
          className="glass-card p-6 flex items-center justify-between group hover:border-gold-primary transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary">
              <span className="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Publicar Desconto Manual</h3>
              <p className="text-xs text-gray-500">Partilhe uma promoção exclusiva</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-gold-primary transition-colors">
            {showPromoForm ? 'expand_less' : 'add'}
          </span>
        </button>
      </div>

      {showJobForm && (
        <section className="glass-card p-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gold-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">work</span> Nova Vaga de Emprego
          </h2>
          <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Título da Vaga</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="Ex: Engenheiro de Software" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Empresa</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="Ex: Unitel" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Localização</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="Ex: Luanda, Angola" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tipo de Contrato</label>
              <select className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                <option value="Tempo Inteiro">Tempo Inteiro</option>
                <option value="Contrato">Contrato</option>
                <option value="Remote">Remoto (Internacional)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Descrição da Função</label>
              <textarea required rows={4} className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} placeholder="Descreva os requisitos e responsabilidades..." />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Link Original (Se houver)</label>
              <input className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newJob.sourceUrl} onChange={e => setNewJob({ ...newJob, sourceUrl: e.target.value })} placeholder="https://..." />
            </div>
            <button type="submit" className="md:col-span-2 bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.01] transition-all">
              Publicar Vaga Agora
            </button>
          </form>
        </section>
      )}

      {showPromoForm && (
        <section className="glass-card p-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gold-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_basket</span> Novo Desconto Exclusivo
          </h2>
          <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Nome do Produto</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newPromo.productName} onChange={e => setNewPromo({ ...newPromo, productName: e.target.value })} placeholder="Ex: Smart TV 4K" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Preço em Promoção</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newPromo.price} onChange={e => setNewPromo({ ...newPromo, price: e.target.value })} placeholder="Ex: 150.000 AOA" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Loja / Vendedor</label>
              <input required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newPromo.store} onChange={e => setNewPromo({ ...newPromo, store: e.target.value })} placeholder="Ex: Kero Gika" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Categoria</label>
              <select className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                value={newPromo.category} onChange={e => setNewPromo({ ...newPromo, category: e.target.value as PromotionCategory })}>
                <option value="Tech">Tecnologia</option>
                <option value="Fashion">Moda</option>
                <option value="Auto">Automóveis</option>
                <option value="Home">Casa</option>
                <option value="Other">Outros</option>
              </select>
            </div>
            <button type="submit" className="md:col-span-2 bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.01] transition-all">
              Publicar Promoção Agora
            </button>
          </form>
        </section>
      )}

      {/* Moderation Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
            <span className="material-symbols-outlined">gavel</span> Moderação de Vagas
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-primary text-[10px]">{pendingJobs.length} Pendentes</span>
          </h2>
          {pendingJobs.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                Limpar Tudo
              </button>
              <button
                onClick={handleApproveAll}
                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Aprovar Tudo
              </button>
            </div>
          )}
        </div>

        {pendingJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingJobs.map(job => (
              <div key={job.id} className="glass-card flex flex-col group overflow-hidden border-l-4 border-l-gold-primary/30 hover:border-l-gold-primary transition-all">
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${getSourceStyle(job.source)}`}>
                      {job.source}
                    </span>
                    <p className="text-[10px] text-gray-500">{job.postedAt}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{job.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">corporate_fare</span> {job.company}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    className="text-[10px] text-gold-primary font-bold flex items-center gap-1 hover:underline self-start"
                  >
                    {expandedJobId === job.id ? 'Fechar Detalhes' : 'Ver Descrição'}
                    <span className="material-symbols-outlined text-xs">
                      {expandedJobId === job.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {expandedJobId === job.id && (
                    <div className="text-[10px] text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5 animate-fade-in max-h-32 overflow-y-auto no-scrollbar">
                      {job.description}
                    </div>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-2 border-t border-white/10">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="py-3 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-r border-white/10"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => handleApprove(job.id)}
                    className="py-3 text-[9px] font-black uppercase tracking-widest text-green-500/60 hover:text-green-500 hover:bg-green-500/5 transition-all"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 bg-white/5 transition-all">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-3xl">inbox</span>
            </div>
            <div>
              <p className="text-gray-400 font-bold">Fila de Moderação Vazia</p>
              <p className="text-xs text-gray-600 max-w-[200px] mt-1">Nenhuma vaga nova pendente de revisão no momento.</p>
            </div>
          </div>
        )}
      </section>

      {/* Promotions Moderation Section */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
          <span className="material-symbols-outlined">shopping_cart</span> Moderação de Descontos
          <span className="ml-2 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-primary text-[10px]">{pendingPromos.length} Pendentes</span>
        </h2>

        {pendingPromos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPromos.map(promo => (
              <div key={promo.id} className="glass-card flex flex-col group overflow-hidden border-l-4 border-l-gold-primary/30 hover:border-l-gold-primary transition-all">
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border bg-gold-primary/10 text-gold-primary border-gold-primary/20">
                      {promo.category || 'Promoção'}
                    </span>
                    <span className="text-[10px] font-bold text-gold-primary">{promo.price}</span>
                  </div>

                  <div className="flex gap-4">
                    <img src={promo.image} alt="" className="size-16 rounded-xl object-cover border border-white/10" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">{promo.productName}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">store</span> {promo.store}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 border-t border-white/10">
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="py-3 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-r border-white/10"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => handleApprovePromo(promo.id)}
                    className="py-3 text-[9px] font-black uppercase tracking-widest text-green-500/60 hover:text-green-500 hover:bg-green-500/5 transition-all"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 bg-white/5 transition-all">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-3xl">shopping_bag</span>
            </div>
            <div>
              <p className="text-gray-400 font-bold">Nenhum desconto aguardando revisão</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
            <span className="material-symbols-outlined">currency_exchange</span> Atualizar Taxas Informais
          </h2>
          {rates.map(rate => (
            <div key={rate.currency} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">{rate.currency} / AOA</h3>
                <span className="text-xs text-gray-500 uppercase">Actual: {rate.informal.toLocaleString('pt-AO')}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm flex-1 focus:ring-1 focus:ring-gold-primary outline-none"
                  placeholder="Nova taxa informal..."
                  value={updates[rate.currency] || ''}
                  onChange={e => setUpdates({ ...updates, [rate.currency]: e.target.value })}
                />
                <button
                  onClick={() => handleUpdate(rate.currency)}
                  className="bg-gold-gradient text-background-dark font-black px-6 rounded-xl hover:scale-105 transition-all text-xs uppercase"
                >
                  Salvar
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
            <span className="material-symbols-outlined">trending_up</span> Receita de Anúncios (Google Ads)
          </h2>
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <div className="size-20 rounded-full bg-gold-primary/10 flex items-center justify-center border border-gold-primary/20 mb-2">
              <span className="material-symbols-outlined text-gold-primary text-4xl">payments</span>
            </div>
            <p className="text-gray-400 text-sm">Ganhos Estimados do Mês</p>
            <h4 className="text-3xl font-black text-gray-900 dark:text-white">$ 1,420.50</h4>
            <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-gold-gradient h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] text-gold-dark uppercase tracking-widest font-bold">+12% em relação ao mês anterior</p>
          </div>
        </section>
      </div>

      <div className="glass-card p-8 rounded-2xl mt-8">
        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-border-gold pb-4">Actividade do Servidor</h3>
        <div className="flex flex-col gap-4 text-xs font-mono text-gray-500">
          <p className="flex justify-between"><span>[OK] Sincronização BNA completa</span> <span>09:42:01</span></p>
          <p className="flex justify-between"><span>[OK] Jobs Scraper finalizado: +12 novas vagas</span> <span>09:00:15</span></p>
          <p className="flex justify-between text-gold-primary"><span>[LOG] Admin atualizou taxa USD Informal para 1250.00</span> <span>08:15:33</span></p>
        </div>
      </div>
    </div>
  );
};
