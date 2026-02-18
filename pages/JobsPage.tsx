
import React, { useEffect, useState } from 'react';
import { MapPin, Building, Clock, Search, X, CheckCircle2, Award, Mail, ChevronRight } from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { Job } from '../types';
import { ShareButton } from '../components/ShareButton';

interface JobsPageProps {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onRequestReward?: (callback: () => void) => void;
  onShowInterstitial?: (callback: () => void) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ isAuthenticated, onRequireAuth, onRequestReward, onShowInterstitial }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [viewCount, setViewCount] = useState<number>(() => {
    return Number(sessionStorage.getItem('jobs_view_count')) || 0;
  });

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const data = await GeminiService.fetchJobs();
      setJobs(data);
      setLoading(false);
    };
    loadJobs();
  }, []);

  const handleOpenDetails = (job: Job) => {
    if (!isAuthenticated) {
      if (onShowInterstitial) {
        onShowInterstitial(() => onRequireAuth());
      } else {
        onRequireAuth();
      }
      return;
    }

    const newCount = viewCount + 1;
    setViewCount(newCount);
    sessionStorage.setItem('jobs_view_count', newCount.toString());

    if (newCount > 3 && onRequestReward) {
      onRequestReward(() => setSelectedJob(job));
    } else {
      setSelectedJob(job);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-orange-500 tracking-tight uppercase">Vagas de Emprego</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-1">Conectando talentos às maiores empresas de Angola.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cargo ou empresa..."
            className="w-full pl-10 pr-4 py-3.5 border border-orange-500/20 bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500/20 text-orange-500 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3.5 text-orange-500" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
             <div key={i} className="bg-white dark:bg-slate-900 h-32 rounded-3xl animate-pulse gold-border-subtle"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} onClick={() => handleOpenDetails(job)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col h-full hover:shadow-md">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
                   {job.company.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">{job.title}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{job.company}</p>
                 </div>
               </div>
                {/* Salary removed as per request */}
             </div>
             
             <div className="flex flex-wrap gap-2 mb-4 flex-1">
               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                 <MapPin size={12} />
                 {job.location}
               </div>
               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                 <Clock size={12} />
                 {job.type}
               </div>
             </div>
             
             <div className="pt-4 border-t border-orange-500/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Há 2 dias</span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 group-hover:text-orange-500 flex items-center gap-1 transition-colors">
                  Ver detalhes <ChevronRight size={14} />
                </span>
             </div>
          </div>
        ))}
      </div>
      )}

      {/* LINKEDIN STYLE TERMINAL DETAILS */}
      {selectedJob && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full md:h-auto md:rounded-[3rem] shadow-2xl border border-orange-500/20 relative overflow-hidden flex flex-col">
            
            {/* Header Cover */}
            <div className="h-32 md:h-56 bg-gradient-to-r from-slate-950 to-slate-800 relative shrink-0">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 z-30 bg-black/50 text-white p-3 rounded-full hover:bg-orange-500 transition-all backdrop-blur-md"
                aria-label="Fechar Detalhes"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 md:pb-12 -mt-10 relative z-10">
               <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                  <div className="w-24 h-24 md:w-40 md:h-40 bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-2xl flex items-center justify-center text-orange-500 border-4 md:border-8 border-orange-500/20 shrink-0">
                    <Building size={48} />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl md:text-5xl font-black text-orange-500 leading-none">{selectedJob.title}</h3>
                      <CheckCircle2 size={24} className="text-blue-500 hidden md:block" fill="currentColor" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-300 font-black uppercase text-[10px] md:text-sm tracking-[0.2em]">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 border-b border-orange-500/10 pb-2">Sobre a Vaga</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                        {selectedJob.description}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-orange-500/10 pb-2">Requisitos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedJob.requirements?.map((req, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-orange-500/20">
                             <Award className="text-orange-500 shrink-0" size={16} />
                             <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{req}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-slate-900 dark:bg-orange-500 p-8 rounded-[2.5rem] shadow-2xl text-white dark:text-slate-950">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Candidatura Oficial</h4>
                        <div className="space-y-4">
                           <div className="p-4 bg-white/10 dark:bg-black/10 rounded-2xl border border-white/5">
                              <span className="block text-[8px] font-black uppercase opacity-60 mb-1">E-mail para Envio:</span>
                              <span className="text-sm md:text-base font-black break-all">{selectedJob.applicationEmail}</span>
                           </div>
                           <button 
                             onClick={() => window.open(`mailto:${selectedJob.applicationEmail}?subject=Candidatura: ${selectedJob.title}`, '_blank')}
                             className="w-full bg-orange-500 dark:bg-slate-950 text-white dark:text-orange-500 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                             <Mail size={18} /> Candidatar-se
                           </button>
                        </div>
                     </div>
                     
                     <div className="hidden md:block p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border gold-border-subtle">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Dicas Angolife</p>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                          "Destaque o seu percurso profissional e anexe sempre o CV em formato PDF para garantir a leitura do RH."
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t gold-border-t-subtle z-[40] flex gap-3">
               <button 
                 onClick={() => window.open(`mailto:${selectedJob.applicationEmail}`, '_blank')}
                 className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
               >
                 Candidatar Agora
               </button>
               <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl">
                 <ShareButton title={selectedJob.title} text={selectedJob.description} />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
