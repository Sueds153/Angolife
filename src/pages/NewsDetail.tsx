import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsService } from '../services/NewsService';
import { NewsItem } from '../types';
import { RewardedAd } from '../components/ads/RewardedAd';

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

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
            <div className={`prose dark:prose-invert prose-lg text-gray-700 dark:text-gray-300 leading-relaxed ${!isUnlocked ? 'blur-sm select-none opacity-50 h-[300px] overflow-hidden' : ''}`}>
              <p className="whitespace-pre-wrap">{news.description}</p>
              {/* Simulated extra content for demo */}
              <p className="mt-4">Informação exclusiva sobre os rumos da economia angolana e oportunidades de investimento de alto padrão.</p>
            </div>

            {/* Ad Gate Overlay uses RewardedAd Component */}
            <RewardedAd
              isOpen={!isUnlocked}
              onReward={() => setIsUnlocked(true)}
              onClose={() => { }} // Can't close without watching
            />

            {/* Content Blur Placeholder - kept for visual indication behind modal if needed, 
                 but RewardedAd is a portal so it covers everything. 
                 We keep the blurred text visible underneath. */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                {/* The RewardedAd component handles the modal */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
