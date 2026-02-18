
import React, { useEffect, useState } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { NewsArticle } from '../types';
import { ExternalLink, Calendar, AlertTriangle, Eye, Flame, Lock, ChevronRight, X, Clock, Zap, Newspaper, ArrowRight } from 'lucide-react';
import { RewardedAd } from '../components/AdOverlays';

interface NewsPageProps {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onRequestReward?: (callback: () => void) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ isAuthenticated, onRequireAuth, onRequestReward }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Logic for Ad every 3 clicks
  const [clickCount, setClickCount] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [pendingArticle, setPendingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await SupabaseService.getNews();
      setNews(data);
      setLoading(false);
    };
    loadNews();
  }, []);

  const handleArticleClick = (article: NewsArticle, index?: number) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Every 3rd click triggers the ad
    if (newCount % 3 === 0) {
      setPendingArticle(article);
      setShowRewardedAd(true);
    } else {
      setSelectedArticle(article);
    }
  };

  const handleAdComplete = () => {
    setShowRewardedAd(false);
    if (pendingArticle) {
      setSelectedArticle(pendingArticle);
      setPendingArticle(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  // Helper to determine styling based on category
  const getCategoryStyle = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('urgente') || cat.includes('alerta')) return 'bg-red-600 text-white animate-pulse';
    if (cat.includes('segredo') || cat.includes('bombástico')) return 'bg-purple-600 text-white';
    if (cat.includes('exclusivo')) return 'bg-brand-gold text-slate-900';
    return 'bg-slate-800 text-white';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-3xl font-black text-brand-gold uppercase tracking-tighter flex items-center gap-2">
           <Flame className="fill-brand-gold text-brand-gold" />
           News Secretas
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">O que ninguém lhe conta sobre Angola.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] gold-border-subtle animate-pulse h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <div 
             key={item.id} 
             onClick={() => handleArticleClick(item, index)}
             className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 group hover:border-brand-gold/50 transition-all cursor-pointer flex flex-col h-full"
          >
             <div className="h-48 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
               {item.imageUrl ? (
                 <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                   <Newspaper size={40} className="text-slate-600" />
                 </div>
               )}
               
               <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                 {item.category === 'BUSINESS' && (
                   <span className="bg-brand-gold text-brand-dark text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
                     Business
                   </span>
                 )}
                 {item.isSecret && (
                   <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
                     <Lock size={10} /> Segredo
                   </span>
                 )}
               </div>

               <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                 <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                   {item.source}
                 </span>
                 <span className="text-[10px] font-bold text-white/60 flex items-center gap-1">
                   <Clock size={10} /> Há 2h
                 </span>
               </div>
             </div>
             
             <div className="p-6 flex-1 flex flex-col">
               <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-brand-gold transition-colors line-clamp-3">
                 {item.title}
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                 {item.summary}
               </p>
               
               <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand-gold transition-colors mt-auto">
                 <span>Ler história</span>
                 <ArrowRight size={14} />
               </div>
             </div>
          </div>
        ))}
      </div>
      )}

      {/* REWARDED AD OVERLAY */}
      {showRewardedAd && (
        <RewardedAd 
          onReward={handleAdComplete} 
          onClose={() => {
             setShowRewardedAd(false);
             setPendingArticle(null);
          }} 
        />
      )}

      {/* FULL ARTICLE MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950 animate-fade-in overflow-y-auto">
           {/* Modal Header */}
           <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b gold-border-b-subtle px-6 py-4 flex justify-between items-center shadow-2xl">
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] flex items-center gap-2">
                 <Zap size={12} className="fill-brand-gold" /> Angolife Exclusive
              </span>
              <button 
                onClick={handleCloseModal}
                className="bg-white/10 p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                aria-label="Fechar Artigo"
              >
                <X size={20} />
              </button>
           </div>

           {/* Modal Content */}
           <div className="p-6 md:p-10 max-w-3xl mx-auto w-full pb-32">
              <div className="mb-8">
                 <span className={`inline-block mb-4 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg ${getCategoryStyle(selectedArticle.category)}`}>
                    {selectedArticle.category}
                 </span>
                 <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                    {selectedArticle.title}
                 </h1>
                 <div className="flex items-center gap-4 text-slate-400 border-y border-white/5 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <Eye size={14} /> Fonte: {selectedArticle.source}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <Calendar size={14} /> {selectedArticle.publishedAt}
                    </span>
                 </div>
              </div>

              <div className="prose prose-invert prose-lg max-w-none">
                 <p className="text-xl font-bold text-brand-gold mb-8 leading-relaxed border-l-4 border-brand-gold pl-6">
                    {selectedArticle.summary}
                 </p>
                 
                 <div className="text-slate-300 space-y-6 font-medium leading-loose text-lg">
                    {/* Simulated Full Content generation based on summary */}
                    <p>
                       Informações exclusivas obtidas pelo Angolife indicam movimentos estratégicos nos bastidores que podem alterar completamente o cenário atual. Fontes próximas confirmam que a situação descrita é apenas a ponta do iceberg.
                    </p>
                    <p>
                       "A maioria das pessoas não está a ver o que está por vir", afirmou um analista de mercado que preferiu não ser identificado. Os dados preliminares sugerem um impacto direto nas próximas 48 horas.
                    </p>
                    
                    <p>
                       Especialistas recomendam cautela e atenção redobrada. Se os rumores se confirmarem, estaremos diante de um dos maiores eventos do ano no setor. Continue a acompanhar o Angolife para atualizações em tempo real sobre este desenvolvimento.
                    </p>
                 </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/10">
                 <button 
                   onClick={() => window.open(selectedArticle.url, '_blank')}
                   className="w-full bg-white/5 hover:bg-brand-gold hover:text-slate-900 border border-brand-gold/30 text-brand-gold py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                 >
                    Ver Fonte Original <ExternalLink size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
