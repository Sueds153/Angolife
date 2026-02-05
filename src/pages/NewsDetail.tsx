import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsService } from '../services/NewsService';
import { NewsItem } from '../types';
import { RewardedAd } from '../components/ads/RewardedAd';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const NewsDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToast } = useToast();

  const toggleFavorite = () => {
    if (!news) return;
    if (isFavorite(news.id)) {
      removeFavorite(news.id);
      addToast('Notícia removida dos favoritos', 'info');
    } else {
      addFavorite({
        id: news.id,
        type: 'news',
        title: news.title,
        image: news.image_url,
        companyOrDate: new Date(news.created_at || '').toLocaleDateString()
      });
      addToast('Notícia salva nos favoritos!', 'success');
    }
  };

  useEffect(() => {
    if (id) {
      loadNews(id);
    }
  }, [id]);

  const loadNews = async (newsId: string) => {
    const data = await NewsService.getNewsById(newsId);
    setNews(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="size-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!news) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-bold text-gray-400">Notícia não encontrada</h2>
      <Link to="/" className="text-gold-primary hover:underline">Voltar para Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gold-primary">Home</Link>
        <span>/</span>
        <span className="text-gold-primary font-bold">Notícias</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Vertical Image (Cinema Style) */}
        <div className="sticky top-24 h-fit">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gold-primary/20 aspect-[9/16] bg-black">
            <img
              src={news.image_url}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black bg-gold-primary text-black uppercase tracking-widest rounded-sm">
                Destaque
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                {news.title}
              </h1>

              <button 
                onClick={toggleFavorite}
                className={`mt-4 size-12 rounded-2xl flex items-center justify-center transition-all border ${isFavorite(news.id) ? 'bg-gold-primary text-black border-gold-primary' : 'bg-white/10 text-white border-white/20 hover:border-gold-primary hover:text-gold-primary'}`}
              >
                <span className={`material-symbols-outlined ${isFavorite(news.id) ? 'fill-current' : ''}`}>
                  {isFavorite(news.id) ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Content & Ad Gate */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 text-sm text-gray-400 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-primary text-lg">calendar_today</span>
              <span>{new Date(news.created_at || new Date()).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-primary text-lg">visibility</span>
              <span>Visualização Exclusiva</span>
            </div>
          </div>

          <div className="relative">
            {/* Text Content */}
            <div className={`prose dark:prose-invert prose-lg text-gray-700 dark:text-gray-300 leading-relaxed ${!user || !isUnlocked ? 'blur-sm select-none opacity-50 h-[300px] overflow-hidden' : ''}`}>
              <p className="whitespace-pre-wrap">{news.content || news.description}</p>
              <p className="mt-4 font-bold text-gold-primary">AngoLife Luxury Edition - Informação em primeira mão.</p>
            </div>

            {!user ? (
               <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                 <div className="glass-card w-full max-w-sm rounded-3xl p-8 border border-gold-primary/30 bg-gold-primary/5 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                    <div className="size-16 rounded-full bg-gold-primary/10 flex items-center justify-center mb-4">
                       <span className="material-symbols-outlined text-3xl text-gold-primary">person_add</span>
                    </div>
                    <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Leitura Exclusiva</h4>
                    <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
                      Faça login ou cadastre-se para desbloquear esta notícia e aceder a todo o conteúdo premium do AngoLife.
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                       <button 
                         onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))}
                         className="w-full py-3 bg-gold-gradient text-background-dark text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-gold-primary/20 hover:scale-105 transition-transform"
                       >
                         Criar Conta Grátis
                       </button>
                       <button 
                         onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                         className="w-full py-3 border border-gold-primary/40 text-gold-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold-primary/10 transition-all"
                       >
                         Já tenho conta
                       </button>
                    </div>
                 </div>
               </div>
            ) : (
              <>
                <RewardedAd
                  isOpen={!isUnlocked}
                  onReward={() => setIsUnlocked(true)}
                  onClose={() => { }} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
