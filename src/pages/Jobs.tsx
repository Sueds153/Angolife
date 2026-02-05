import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JobListing } from '../types';
import { BannerCard } from '../components/BannerCard';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

import { JobService } from '../services/JobService';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minSalary, setMinSalary] = useState(0);
  const [onlyElite, setOnlyElite] = useState(false);
  const [onlyRemote, setOnlyRemote] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToast } = useToast();

  useEffect(() => {
    loadJobs(1);
  }, []);

  const loadJobs = async (pageNum: number) => {
    setLoading(true);
    const newJobs = await JobService.fetchJobs(pageNum, 10);
    
    if (newJobs.length < 10) {
      setHasMore(false);
    }

    if (pageNum === 1) {
      setJobs(newJobs);
    } else {
      setJobs(prev => [...prev, ...newJobs]);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadJobs(nextPage);
  };

  const toggleFavorite = (job: JobListing) => {
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

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by salary
    const val = j.salaryValue || 0;
    const matchesSalary = val >= minSalary;

    // Filter by Elite status
    const matchesElite = !onlyElite || j.isElite;

    // Filter by Remote status (checking tags or title for 'Remote' or 'Híbrido' since we don't have a remote flag in type yet)
    const matchesRemote = !onlyRemote || 
      j.location.toLowerCase().includes('remoto') || 
      j.type.toLowerCase().includes('remoto') ||
      j.title.toLowerCase().includes('remoto');

    return matchesSearch && matchesSalary && matchesElite && matchesRemote;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">Elite <span className="text-gold-primary">Careers</span></h1>
          <p className="text-gray-500 text-lg">As posições mais exclusivas do mercado angolano em um só lugar.</p>
        </div>
        <div className="flex w-full max-w-md items-stretch rounded-xl h-12 border border-border-gold bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
          <div className="text-gold-primary/40 flex items-center justify-center pl-4">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="flex w-full bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 px-4 text-sm"
            placeholder="Pesquisar por cargo ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <div className="p-6 rounded-2xl glass-card">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest">Filtros Elite</h3>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={onlyElite}
                  onChange={(e) => setOnlyElite(e.target.checked)}
                  className="size-4 rounded border-border-gold bg-transparent text-gold-primary focus:ring-offset-background-dark" 
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gold-primary">Só Vagas Elite</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={onlyRemote}
                  onChange={(e) => setOnlyRemote(e.target.checked)}
                  className="size-4 rounded border-border-gold bg-transparent text-gold-primary focus:ring-offset-background-dark" 
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gold-primary">Trabalho Remoto</span>
              </label>

              <div className="pt-4 border-t border-white/5">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Salário Mínimo</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full accent-gold-primary h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gold-primary font-mono text-xs font-bold text-right">
                    {minSalary > 0 ? `> ${minSalary.toLocaleString('pt-AO')} Kz` : 'Qualquer valor'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <BannerCard type="sidebar" />
        </aside>

        <section className="lg:col-span-9 flex flex-col gap-4">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="group flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-2xl glass-card p-6 hover:border-gold-primary/50 transition-all shadow-xl relative overflow-hidden">
              {job.isElite && <div className="absolute top-0 left-0 w-1 h-full bg-gold-primary"></div>}
              <div className="flex flex-[2] flex-col justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    {job.isElite && <span className="px-2 py-0.5 rounded bg-gold-primary text-black text-[10px] font-bold uppercase tracking-wider">Membro Elite</span>}
                    <p className="text-gray-500 text-xs font-medium">{job.postedAt}</p>
                  </div>
                  <h3 className="text-gray-900 dark:text-white text-xl font-extrabold group-hover:text-gold-primary transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-sm">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-base">corporate_fare</span> {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-gold-primary">location_on</span> {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-gold-primary font-bold">
                      {job.salary}
                    </span>
                    {job.source && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        Via {job.source}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {job.sourceUrl ? (
                      <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="relative group/tooltip">
                        <div className="flex items-center justify-center rounded-full h-10 px-6 bg-gold-gradient text-background-dark font-bold text-sm gap-2 hover:scale-105 transition-all">
                          <span>Candidatar-se</span>
                          <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </div>
                      </a>
                    ) : (
                      <Link to={`/jobs/${job.id}`} className="relative group/tooltip">
                        <div className="flex items-center justify-center rounded-full h-10 px-6 bg-gold-gradient text-background-dark font-bold text-sm gap-2 hover:scale-105 transition-all">
                          <span>Ver Detalhes</span>
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="relative group/tooltip">
                    <button
                      onClick={() => toggleFavorite(job)}
                      className={`flex items-center justify-center rounded-full h-10 w-10 border border-border-gold transition-colors ${isFavorite(job.id) ? 'bg-gold-primary text-black' : 'bg-white/5 text-gray-900 dark:text-white hover:text-gold-primary'}`}
                    >
                      <span className={`material-symbols-outlined ${isFavorite(job.id) ? 'fill-current' : ''}`}>
                        {isFavorite(job.id) ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-surface-dark border border-gold-primary/30 text-gold-primary text-[10px] font-bold uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                      {isFavorite(job.id) ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-48 h-32 bg-cover bg-center rounded-xl border border-border-gold opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all cursor-pointer"
                onClick={() => window.location.hash = `/jobs/${job.id}`}
                style={{ backgroundImage: `url('${job.image}')` }}></div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 dark:text-gray-400 italic">
              Nenhuma vaga encontrada para os critérios selecionados.
            </div>
          )}

          <BannerCard type="banner" className="mt-8" />
          
          {hasMore && !loading && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleLoadMore}
                className="bg-gold-gradient text-background-dark font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-105 transition-transform"
              >
                Carregar Mais Vagas
              </button>
            </div>
          )}
          {loading && (
             <div className="flex justify-center mt-8 text-gold-primary">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
             </div>
          )}
        </section>
      </div>
    </div>
  );
};
