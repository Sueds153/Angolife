import { supabase } from './supabaseClient';
import { ExchangeRate, ProductDeal, Job, NewsArticle } from '../types';

export const SupabaseService = {
  // --- UTILS ---
  sanitize: (text: string): string => {
    if (!text) return '';
    // Remove tags HTML, espaços extras e caracteres suspeitos de SQL Injection simples
    return text
      .trim()
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/['";\\]/g, '');   // Remove caracteres de escape comuns
  },

  // --- EXCHANGE RATES ---
  getRates: async (): Promise<ExchangeRate[]> => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*');
    
    if (error) {
      console.error('Error fetching rates:', error);
      return [];
    }
    
    return data.map((r: any) => ({
      currency: r.currency,
      formalBuy: r.formal_buy,
      formalSell: r.formal_sell,
      informalBuy: r.informal_buy,
      informalSell: r.informal_sell,
      lastUpdated: r.last_updated
    }));
  },

  updateInformalRate: async (currency: 'USD' | 'EUR', buy: number, sell: number): Promise<void> => {
    const { error } = await supabase
      .from('exchange_rates')
      .update({ informal_buy: buy, informal_sell: sell, last_updated: new Date().toISOString() })
      .eq('currency', currency);

    if (error) console.error('Error updating rate:', error);
  },

  // --- DEALS ---
  getDeals: async (isAdmin: boolean = false): Promise<ProductDeal[]> => {
    let query = supabase.from('product_deals').select('*');
    
    if (!isAdmin) {
      query = query.eq('status', 'approved');
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
    
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      store: d.store,
      originalPrice: d.original_price,
      discountPrice: d.discount_price,
      location: d.location,
      description: d.description,
      imagePlaceholder: d.image_placeholder,
      status: d.status,
      submittedBy: d.submitted_by,
      createdAt: d.created_at
    }));
  },

  getPendingDeals: async (): Promise<ProductDeal[]> => {
    const { data, error } = await supabase
      .from('product_deals')
      .select('*')
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error fetching pending deals:', error);
      return [];
    }
    
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      store: d.store,
      originalPrice: d.original_price,
      discountPrice: d.discount_price,
      location: d.location,
      description: d.description,
      imagePlaceholder: d.image_placeholder,
      status: d.status,
      submittedBy: d.submitted_by,
      createdAt: d.created_at
    }));
  },

  submitDeal: async (deal: Omit<ProductDeal, 'id' | 'status' | 'createdAt'>): Promise<void> => {
    const { error } = await supabase
      .from('product_deals')
      .insert([{
        title: deal.title,
        store: deal.store,
        original_price: deal.originalPrice,
        discount_price: deal.discountPrice,
        location: deal.location,
        description: deal.description,
        image_placeholder: deal.imagePlaceholder,
        submitted_by: deal.submittedBy,
        status: 'pending'
      }]);

    if (error) console.error('Error submitting deal:', error);
  },

  approveDeal: async (id: string, isApproved: boolean): Promise<void> => {
    const status = isApproved ? 'approved' : 'rejected';
    const { error } = await supabase
      .from('product_deals')
      .update({ status })
      .eq('id', id);

    if (error) console.error('Error approving deal:', error);
  },

  // --- JOBS ---
  getJobs: async (isAdmin: boolean = false): Promise<Job[]> => {
    let query = supabase.from('jobs').select('*');
    if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data.map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type,
      salary: j.salary,
      description: j.description,
      postedAt: j.posted_at, 
      requirements: j.requirements || [],
      sourceUrl: j.source_url,
      applicationEmail: j.application_email,
      status: j.status
    }));
  },

  getPendingJobs: async (): Promise<Job[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending jobs:', error);
      return [];
    }

    return data.map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type,
      salary: j.salary,
      description: j.description,
      postedAt: j.posted_at,
      requirements: j.requirements || [],
      sourceUrl: j.source_url,
      applicationEmail: j.application_email,
      status: j.status
    }));
  },

  approveJob: async (id: string, isApproved: boolean): Promise<void> => {
    if (isApproved) {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'published' })
        .eq('id', id);
       if (error) console.error('Error approving job:', error);
    } else {
       // Delete if rejected or set to rejected? Mock said "Reject deletes it"
       const { error } = await supabase.from('jobs').delete().eq('id', id);
       if (error) console.error('Error rejecting job:', error);
    }
  },

  // --- NEWS ---
  getNews: async (isAdmin: boolean = false): Promise<NewsArticle[]> => {
    let query = supabase.from('news_articles').select('*');
    if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }

    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      url: n.url,
      category: n.category,
      publishedAt: n.published_at,
      status: n.status
    }));
  },

  getPendingNews: async (): Promise<NewsArticle[]> => {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending news:', error);
      return [];
    }

    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      url: n.url,
      category: n.category,
      publishedAt: n.published_at,
      status: n.status
    }));
  },

  approveNews: async (id: string, isApproved: boolean): Promise<void> => {
     if (isApproved) {
        const { error } = await supabase
          .from('news_articles')
          .update({ status: 'published' })
          .eq('id', id);
        if (error) console.error('Error approving news:', error);
     } else {
        const { error } = await supabase.from('news_articles').delete().eq('id', id);
        if (error) console.error('Error rejecting news:', error);
     }
  },

  // --- SIMULATION TRIGGERS (Keep them or make them call a Supabase Function?) ---
  // For now, we'll keep them as client-side inserts for demo
  triggerJobScraper: async (): Promise<number> => {
    // Simulate scraper adding jobs
    const newJobs = [
       {
          title: 'Técnico de Suporte IT (Demo)',
          company: 'NCR Angola',
          location: 'Luanda, Centro',
          type: 'Tempo Inteiro',
          salary: 'Confidencial',
          description: 'Manutenção de hardware e suporte ao cliente.',
          posted_at: new Date().toISOString(),
          requirements: ['Hardware', 'Redes', 'Atendimento'],
          source_url: 'https://ncr.ao/jobs',
          status: 'pending'
       },
       {
          title: 'Gerente Comercial (Demo)',
          company: 'Shoprite',
          location: 'Benguela',
          type: 'Tempo Inteiro',
          description: 'Gestão de equipas de vendas e análise de KPIs.',
          posted_at: new Date().toISOString(),
          requirements: ['Gestão', 'Vendas', 'Liderança'],
          status: 'pending'
       }
    ];

    const { error } = await supabase.from('jobs').insert(newJobs);
    if (error) {
       console.error('Error triggering job scraper:', error);
       return 0;
    }
    return newJobs.length;
  },

  triggerNewsScraper: async (): Promise<number> => {
     const newNews = [
        {
           title: 'Sonangol anuncia novas descobertas (Demo)',
           summary: 'Petrolífera nacional confirma reservas na Bacia do Kwanza.',
           source: 'Economia & Mercado',
           url: 'https://mercado.co.ao',
           category: 'Economia',
           published_at: new Date().toISOString(),
           status: 'pending'
        }
     ];
     
     const { error } = await supabase.from('news_articles').insert(newNews);
     if (error) {
        console.error('Error triggering news scraper:', error);
        return 0;
     }
     return newNews.length;
  },

  // --- STORAGE & UTILS ---
  uploadProof: async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('exchange-proofs')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading proof:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('exchange-proofs')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // --- ORDERS & REVIEWS ---
  createOrder: async (order: any): Promise<string | null> => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Erro de conexão segura. Por favor, recarregue a página.');
      }
      return null;
    }
    return data.id;
  },

  getUserOrders: async (email: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
    return data;
  }
};
