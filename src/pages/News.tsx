import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsService } from '../services/NewsService';
import { NewsItem } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

export const News: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { addToast } = useToast();

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        const data = await NewsService.getNews();
        setNews(data);
        setLoading(false);
    };

    const toggleFavorite = (e: React.MouseEvent, item: NewsItem) => {
        e.preventDefault();
        if (isFavorite(item.id)) {
            removeFavorite(item.id);
            addToast('Notícia removida dos favoritos', 'info');
        } else {
            addFavorite({
                id: item.id,
                type: 'news',
                title: item.title,
                image: item.image_url,
                companyOrDate: new Date().toLocaleDateString() // Approximate since NewsItem might not have date populated correctly in all mocks
            });
            addToast('Notícia salva!', 'success');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-6">
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Últimas Notícias</h1>
                    <p className="text-gray-400">Atualizações exclusivas do mercado angolano</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-2xl overflow-hidden aspect-[4/5] p-0 flex flex-col">
                            <Skeleton className="w-full h-1/2" />
                            <div className="p-6 flex flex-col gap-3 flex-1">
                                <Skeleton className="w-1/3 h-4" />
                                <Skeleton className="w-full h-8" />
                                <Skeleton className="w-full h-20" />
                            </div>
                        </div>
                    ))
                ) : (
                    news.map((item, index) => (
                        <Link
                            to={`/news/${item.id}`}
                            key={item.id}
                            className="group glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-gold-primary/10 transition-all duration-300 hover:-translate-y-1 block relative animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image */}
                            <div className="aspect-video w-full overflow-hidden relative">
                                <img
                                    src={item.image_url || 'https://via.placeholder.com/400'}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => toggleFavorite(e, item)}
                                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-gold-primary hover:text-black transition-colors z-10"
                                >
                                    <span className={`material-symbols-outlined text-xl ${isFavorite(item.id) ? 'fill-current text-gold-primary hover:text-black' : ''}`}>
                                        {isFavorite(item.id) ? 'bookmark' : 'bookmark_border'}
                                    </span>
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gold-primary bg-gold-primary/10 px-2 py-1 rounded-sm">
                                        {item.category || 'Luanda'}
                                    </span>
                                    <span className="text-xs text-gray-500">• {new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-gold-primary transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                                    {item.description || item.content?.substring(0, 100) + '...'}
                                </p>

                                <div className="flex items-center text-gold-primary text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                                    Ler matéria completa
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};
