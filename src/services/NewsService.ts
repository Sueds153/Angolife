import { supabase } from '../lib/supabase';
import { NewsItem } from '../types';

export const NewsService = {
  getNews: async (): Promise<NewsItem[]> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }

    return data || [];
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
  }
};
