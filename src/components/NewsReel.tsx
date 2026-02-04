import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { NewsService } from '../services/NewsService';
import { Link } from 'react-router-dom';

export const NewsReel: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const data = await NewsService.getNews();
    setNews(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {[1,2,3].map(i => (
        <div key={i} className="min-w-[200px] h-[350px] bg-white/5 animate-pulse rounded-2xl"></div>
      ))}
    </div>
  );

  if (news.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 my-8">
      <div className="flex items-center justify-between border-b border-border-gold pb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-gold-primary">auto_stories</span> Novidades & Destaques
        </h3>
        <span className="text-xs text-gold-primary font-bold uppercase tracking-tighter animate-pulse">Live Feed</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {news.map((item) => (
          <Link to={`/news/${item.id}`} key={item.id} className="snap-center shrink-0 relative w-[220px] h-[380px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-gold-primary/20 transition-all border border-transparent hover:border-gold-primary/50">
            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                 style={{ backgroundImage: `url('${item.image_url}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-2 py-1 mb-2 text-[8px] font-black bg-gold-primary text-black uppercase tracking-widest rounded-sm">
                  Novo
                </span>
                <h4 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-md">
                  {item.title}
                </h4>
                <p className="text-gray-300 text-xs line-clamp-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-gold-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <span>Saber Mais</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
                <div className="h-[2px] w-0 bg-gold-primary group-hover:w-full transition-all duration-500 mt-2"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
