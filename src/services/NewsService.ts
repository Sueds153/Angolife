import { supabase } from '../lib/supabase';
import { NewsItem } from '../types';

export const NewsService = {
  fetchNews: async (page = 1, limit = 12): Promise<NewsItem[]> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }

    return data || [];
  },

  getNews: async (): Promise<NewsItem[]> => {
    return await NewsService.fetchNews(1, 100); // Legacy compatibility
  },

  getNewsById: async (id: string): Promise<NewsItem | null> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching news details:', error);
      return null;
    }

    return data;
  },

  addNews: async (news: Omit<NewsItem, 'id' | 'created_at'>): Promise<NewsItem | null> => {
    const { data, error } = await supabase
      .from('news')
      .insert([news])
      .select()
      .single();

    if (error) {
      console.error('Error adding news:', error);
      return null;
    }

    return data;
  },

  deleteNews: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting news:', error);
      return false;
    }
    return true;
  },

  syncRealNews: async (): Promise<number> => {
    console.log('Iniciando sincronização de notícias reais...');
    let count = 0;
    
    // Lista de fontes de notícias angolanas indexáveis
    const NEWS_SOURCES = [
      { name: 'Economia & Mercado', url: 'https://www.economiaemercado.co.ao' },
      { name: 'Jornal de Angola', url: 'https://www.jornaldeangola.ao' }
    ];

    for (const source of NEWS_SOURCES) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-scraper', {
          body: { url: source.url, type: 'news' }
        });

        if (error || !data) continue;

        const items = Array.isArray(data) ? data : [];
        for (const item of items) {
          const { error: dbError } = await supabase
            .from('news')
            .upsert({
              title: item.title,
              description: item.description || item.content?.substring(0, 150),
              content: item.content || item.description,
              image_url: item.image_url || 'https://placehold.co/800x400?text=AngoLife+News',
              category: 'Economia',
              status: 'published',
              created_at: new Date().toISOString()
            }, { onConflict: 'title' });
          
          if (!dbError) count++;
        }
      } catch (err) {
        console.error(`Erro ao sincronizar notícias de ${source.name}:`, err);
      }
    }
    return count;
  }
};
