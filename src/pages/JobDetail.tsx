
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JobListing } from '../types';
import { BannerCard } from '../components/BannerCard';
import { JobService } from '../services/JobService';
import { RewardedAd } from '../components/ads/RewardedAd';
import { PublicityService } from '../services/PublicityService';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

export const JobDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState<JobListing[]>([]);
  const [showRewarded, setShowRewarded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(false);
  const { addToast } = useToast();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = () => {
    if (!job) return;
    if (isFavorite(job.id)) {
      removeFavorite(job.id);
      addToast('Vaga removida dos favoritos', 'info');
    } else {
      addFavorite({
        id: job.id,
        type: 'job',
        title: job.title,
        image: job.image,
        companyOrDate: job.company
      });
      addToast('Vaga salva nos favoritos!', 'success');
    }
  };

  const handleReport = () => {
    addToast('Denúncia enviada! Analisaremos em breve. 🛡️', 'info');
  };

  const handleApplyClick = () => {
    const check = PublicityService.canShowRewarded();
    if (!check.can) {
      addToast(check.reason || 'Intervalo entre anúncios obrigatório.', 'info');
      // Even if blocked, let them see contacts if already unlocked
      if (!isUnlocked) return;
    }
    setPendingApplication(true);
    setShowRewarded(true);
  };

  const handleUnlockContacts = () => {
    const check = PublicityService.canShowRewarded();
    if (!check.can) {
       addToast(check.reason || 'Aguarde o intervalo.', 'info');
       return;
    }
    setPendingApplication(false); // Mode: Unlock Contacts
    setShowRewarded(true);
  };

  const executeApplication = () => {
    addToast('Candidatura Prioritária Enviada! 🚀', 'success');
    // Here we would normally redirect to apply link or open email
    if (job?.sourceUrl) {
        window.open(job.sourceUrl, '_blank');
    } else if (job?.email) {
        window.location.href = `mailto:${job.email}?subject=Candidatura: ${job.title}`;
    }
  };

  const handleRewardEarned = () => {
    if (pendingApplication) {
        executeApplication();
        setPendingApplication(false);
    } else {
        setIsUnlocked(true);
        addToast('Contactos Desbloqueados!', 'success');
    }
    PublicityService.recordRewardedShown();
  };

  useEffect(() => {
    const loadJob = async () => {
        if (!id) return;
        setLoading(true);
        const fetchedJob = await JobService.getJobById(id);
        setJob(fetchedJob);
        
        // Fetch related jobs (mock logic: just latest for now, real app would filter)
        const latest = await JobService.getLatestJobs(4);
        setRelatedJobs(latest.filter(j => j.id !== id));
        
        setLoading(false);
    };
    loadJob();
  }, [id]);

  if (loading) return (
      <div className="flex justify-center items-center min-h-[60vh] text-gold-primary">
        <span className="material-symbols-outlined animate-spin text-6xl">progress_activity</span>
      </div>
  );

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="size-24 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6 animate-pulse">
        <span className="material-symbols-outlined text-5xl text-gold-primary">search_off</span>
      </div>
      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">Vaga Não Encontrada</h2>
      <p className="text-gray-400 max-w-md mb-8">Esta oportunidade pode ter expirado ou o link está incorrecto.</p>
      <Link to="/jobs" className="px-8 py-3 bg-gold-gradient text-background-dark font-black rounded-full uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-105 transition-transform">
        Voltar às Vagas
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/jobs" className="flex items-center gap-2 text-gray-500 hover:text-gold-primary transition-colors text-xs font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Voltar à Lista
        </Link>
        <div className="flex gap-4">
           <button 
            onClick={handleReport}
            className="text-gray-500 hover:text-gold-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
           >
            <span className="material-symbols-outlined text-sm">flag</span> Reportar
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Job Header Card - LinkedIn Style */}
          <div className="glass-card rounded-2xl overflow-hidden border border-border-gold bg-surface-dark/40 shadow-2xl">
            {/* Cover Image Placeholder */}
            <div className="h-40 w-full bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: `url('${job.image}')` }}></div>
            
            <div className="px-8 pb-8 -mt-12 relative z-10">
              <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                <div className="size-28 rounded-2xl bg-surface-dark border-4 border-background-dark flex items-center justify-center shrink-0 shadow-2xl">
                  <span className="material-symbols-outlined text-6xl text-gold-primary" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
                  <button 
                    onClick={handleApplyClick}
                    className="flex-1 md:flex-none px-10 h-14 bg-gold-gradient text-background-dark font-black rounded-full uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    🚀 Candidatura VIP
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`px-5 h-14 border transition-all rounded-full flex items-center justify-center ${isFavorite(job.id) ? 'bg-gold-primary text-black border-gold-primary' : 'border-gold-primary/40 text-gold-primary hover:bg-gold-primary/10'}`}
                  >
                    <span className={`material-symbols-outlined ${isFavorite(job.id) ? 'fill-current' : ''}`}>
                      {isFavorite(job.id) ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-4xl font-black text-white leading-tight">{job.title}</h1>
                  {job.isElite && (
                    <span className="px-2 py-0.5 rounded-md bg-gold-primary/20 text-gold-primary text-[9px] font-black uppercase tracking-widest border border-gold-primary/30">
                      Vaga Premium
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-gray-400 font-medium">
                  <span className="text-gold-primary font-black hover:underline cursor-pointer uppercase tracking-tight">{job.company}</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-gold-primary">location_on</span> {job.location}
                  </span>
                  <span className="text-gray-700 font-black">•</span>
                  <span className="text-gray-500">{job.postedAt}</span>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-border-gold">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-gold-primary">work</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{job.type}</p>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Contrato</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-gold-primary">monetization_on</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{job.salary || 'A Negociar'}</p>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Remuneração</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-gold-primary">verified</span>
                  </div>
                  <div>
                    <p className="text-green-500 text-sm font-bold flex items-center gap-1">
                      <span className="size-1.5 bg-green-500 rounded-full"></span> Aberta
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Verificação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description & Application Section */}
          {!user ? (
            <div className="glass-card rounded-2xl p-10 border border-gold-primary/30 bg-gold-primary/5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="absolute -right-20 -top-20 size-64 bg-gold-primary/10 rounded-full blur-3xl"></div>
               <div className="size-20 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6 border border-gold-primary/20">
                  <span className="material-symbols-outlined text-4xl text-gold-primary">lock_person</span>
               </div>
               <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Conteúdo Exclusivo</h2>
               <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                 Para visualizar a descrição completa, requisitos e canais de candidatura desta vaga, você precisa estar autenticado na plataforma.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))}
                    className="px-10 py-4 bg-gold-gradient text-background-dark font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-105 transition-all"
                  >
                    🚀 Criar Conta Grátis
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                    className="px-10 py-4 border border-gold-primary/40 text-gold-primary font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gold-primary/10 transition-all"
                  >
                    Entrar
                  </button>
               </div>
               <p className="mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Junte-se a +50,000 profissionais em Angola</p>
            </div>
          ) : (
            <>
              {/* Job Description Card */}
              <div className="glass-card rounded-2xl p-10 border border-border-gold bg-surface-dark/40 shadow-lg">
                <h2 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-10 h-[2px] bg-gold-primary"></span> Descrição Detalhada
                </h2>
                
                <div className="prose prose-invert max-w-none text-gray-400 space-y-8 text-[16px] leading-relaxed">
                  <p>
                    A <strong>{job.company}</strong> é uma instituição líder no mercado e procura um profissional de alto impacto para assumir o cargo de <strong>{job.title}</strong> em {job.location}.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white text-base font-black mb-4 uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold-primary text-xl">assignment_turned_in</span> Responsabilidades Chave:
                    </h3>
                    <ul className="list-none p-0 space-y-4">
                      {[
                        "Liderança estratégica da equipa local para atingir objectivos de crescimento.",
                        "Implementação de normas internacionais adaptadas ao contexto Angolano.",
                        "Supervisão de projectos críticos e reporte directo à administração sénior.",
                        "Mentoria e desenvolvimento de talentos internos da organização."
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="text-gold-primary font-black mt-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white text-base font-black mb-4 uppercase tracking-wider">Qualificações Necessárias:</h3>
                    <ul className="list-none p-0 space-y-4">
                      {[
                        "Mestrado ou MBA em áreas correlatas ao cargo.",
                        "Mínimo de 8-10 anos de experiência comprovada em cargos de gestão.",
                        "Domínio avançado de Inglês e Português (falado e escrito).",
                        "Forte networking no mercado nacional de {job.title.split(' ')[0]}."
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="text-gold-primary font-black mt-1">
                            <span className="material-symbols-outlined text-sm">stars</span>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* LINHA DE TALENTO */}
              <div className="glass-card rounded-2xl p-10 border border-gold-primary/30 bg-gold-primary/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <span className="material-symbols-outlined text-9xl text-gold-primary">headset_mic</span>
                </div>

                <div className="relative z-10">
                  <h2 className="text-xs font-black text-gray-500 mb-8 uppercase tracking-[0.4em] flex items-center gap-4">
                    LINHA DE TALENTO <span className="flex-1 h-[1px] bg-border-gold"></span>
                  </h2>

                  {!isUnlocked ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-black/40 rounded-2xl border border-gold-primary/20 text-center px-8 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gold-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="size-20 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-4xl text-gold-primary">lock</span>
                       </div>
                       <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Contactos Premium</h3>
                       <p className="text-sm text-gray-500 mb-10 max-w-sm">Assista a um breve anúncio para desbloquear o e-mail e telefone directo deste recrutador.</p>
                       
                       <button 
                          onClick={handleUnlockContacts}
                          className="px-12 py-4 bg-gold-gradient text-background-dark font-black rounded-xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold-primary/20 hover:scale-105 active:scale-95 transition-all"
                       >
                         🔓 Ver Contactos Agora
                       </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-1">Candidatura por Email</span>
                        <a href={`mailto:${job.email}`} className="group flex items-center gap-5 p-5 rounded-2xl bg-background-dark/80 border border-border-gold hover:border-gold-primary hover:shadow-lg hover:shadow-gold-primary/5 transition-all">
                          <div className="size-14 rounded-xl bg-gold-primary text-background-dark flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <span className="material-symbols-outlined font-black text-3xl">mail</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Enviar CV para:</span>
                            <span className="text-base text-white font-black truncate group-hover:text-gold-primary transition-colors">{job.email}</span>
                          </div>
                        </a>
                      </div>

                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-1">Contacto Directo</span>
                        <a href={`tel:${job.phone}`} className="group flex items-center gap-5 p-5 rounded-2xl bg-background-dark/80 border border-border-gold hover:border-gold-primary hover:shadow-lg hover:shadow-gold-primary/5 transition-all">
                          <div className="size-14 rounded-xl bg-gold-primary text-background-dark flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <span className="material-symbols-outlined font-black text-3xl">call</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Telefone Directo:</span>
                            <span className="text-lg text-white font-black group-hover:text-gold-primary transition-colors">{job.phone}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}

                  <RewardedAd 
                    isOpen={showRewarded}
                    onClose={() => setShowRewarded(false)}
                    onReward={handleRewardEarned}
                  />

                  <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-gold-primary text-3xl">security</span>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      <strong>Aviso de Segurança:</strong> A AngoLife & Su-Golden Lda nunca solicitam pagamentos para processos de recrutamento. Denuncie qualquer actividade suspeita através do botão "Reportar".
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <BannerCard type="sponsored" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
          
          <div className="glass-card rounded-2xl p-8 border border-border-gold bg-surface-dark/40 shadow-lg">
            <h3 className="text-xs font-black text-gray-500 mb-8 uppercase tracking-[0.2em] border-b border-border-gold pb-4">A Entidade</h3>
            <div className="flex items-center gap-4 mb-6">
               <div className="size-16 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-gold-primary material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                </div>
                <div>
                   <h4 className="text-white font-black text-xl leading-tight">{job.company}</h4>
                   <p className="text-[10px] text-gold-primary uppercase font-black tracking-widest mt-1">Sector Certificado</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Referência nacional no mercado angolano, reconhecida pela excelência em gestão de capital humano e inovação contínua.
            </p>
            <button className="w-full py-4 border-2 border-gold-primary/40 text-gold-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-primary hover:text-background-dark hover:border-gold-primary transition-all shadow-lg hover:shadow-gold-primary/20">
              Ver Perfil da Empresa
            </button>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-border-gold bg-surface-dark/40 shadow-lg">
            <h4 className="text-xs font-black text-gray-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="size-2 bg-gold-primary rounded-full animate-pulse"></span> VAGAS SEMELHANTES
            </h4>
            <div className="flex flex-col gap-6">
              {relatedJobs.slice(0, 3).map(other => (
                <Link key={other.id} to={`/jobs/${other.id}`} className="flex items-center gap-4 group">
                  <div className="size-12 rounded-xl bg-gold-primary/5 flex items-center justify-center shrink-0 border border-border-gold group-hover:border-gold-primary transition-all">
                    <span className="text-gold-primary/60 material-symbols-outlined text-2xl group-hover:text-gold-primary transition-colors">work</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-white truncate group-hover:text-gold-primary transition-colors uppercase tracking-tight">{other.title}</h5>
                    <p className="text-[10px] text-gray-500 font-bold uppercase truncate tracking-tighter mt-0.5">{other.company}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/jobs" className="mt-8 block text-center text-gold-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline decoration-gold-primary underline-offset-8 transition-all">
              EXPLORAR TODA A LISTA
            </Link>
          </div>

          <BannerCard type="sidebar" />
        </div>
      </div>
    </div>
  );
};
