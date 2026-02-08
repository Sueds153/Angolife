import { supabase } from '../lib/supabase';

export const CrawlerService = {
    SOURCES: {
        LINKEDIN: 'LinkedIn',
        INEFOP: 'INEFOP',
        MIRANTES: 'Mirantes'
    },

    TARGET_URLS: [
        'https://www.jobartis.com',
        'https://www.linkedin.com/jobs/search?keywords=Angola&location=Angola',
        'https://www.emprego.co.ao',
        'https://www.inefop.ao',
        'https://www.google.com/search?q=vagas+emprego+angola+instagram'
    ],

    SHOP_URLS: [
        'https://www.ncrangola.com',
        'https://www.kero.ao',
        'https://www.shoprite.co.ao',
        'https://www.arreio.ao'
    ],

    /**
     * Helper to upsert job to database
     */
    async saveJob(job: any, url: string) {
        const sourceName = new URL(url).hostname.replace('www.', '');
        const { error } = await supabase
            .from('jobs')
            .upsert({
                title: job.title || 'Oportunidade',
                company: job.company || 'EmpresaAngola',
                location: job.location?.includes('Angola') ? job.location : `${job.location || 'Luanda'}, Angola`,
                type: job.type || 'Tempo Inteiro',
                source: sourceName,
                external_link: job.link || url,
                description: job.description || `Vaga verificada automaticamente em ${sourceName}.`,
                is_elite: false,
                status: 'published',
                created_at: new Date().toISOString()
            }, { onConflict: 'external_link' });

        return !error;
    },

    /**
     * Executes the AI Crawler via Edge Functions.
     */
    async runAutoCrawler() {
        console.log('Iniciando AI Crawler (Live Mode)...');
        let totalCount = 0;

        for (const url of this.TARGET_URLS) {
            try {
                const { data, error } = await supabase.functions.invoke('ai-scraper', {
                    body: { url, type: 'jobs' }
                });

                if (error || !data) continue;

                const jobs = Array.isArray(data) ? data : [];
                for (const job of jobs) {
                    if (await this.saveJob(job, url)) {
                        totalCount++;
                    }
                }
            } catch (err) {
                console.error(`Erro processando ${url}:`, err);
            }
        }
        return totalCount;
    },

    /**
     * Helper to upsert promotion to database
     */
    async savePromotion(item: any, url: string) {
        const { error } = await supabase
            .from('promotions')
            .upsert({
                product_name: item.productName || 'Produto em Destaque',
                price: item.price || 'Ver no Site',
                store: item.store || new URL(url).hostname.replace('www.', '').split('.')[0],
                location: item.location || 'Angola',
                image_url: 'https://placehold.co/400x400?text=Oferta',
                external_link: url,
                category: item.category || 'Other',
                status: 'pending',
                created_at: new Date().toISOString()
            }, { onConflict: 'external_link' });

        return !error;
    },

    /**
     * Busca promoções usando IA em sites de e-commerce angolanos.
     */
    async runPromotionCrawler() {
        console.log('Iniciando Promo Crawler (Supermercados)...');
        let totalCount = 0;

        for (const url of this.SHOP_URLS) {
            try {
                const { data, error } = await supabase.functions.invoke('ai-scraper', {
                    body: { url, type: 'promotions' }
                });

                if (error || !data) continue;

                const promos = Array.isArray(data) ? data : [];
                for (const item of promos) {
                    if (await this.savePromotion(item, url)) {
                        totalCount++;
                    }
                }
            } catch (err) {
                console.error('Erro crawler promo:', err);
            }
        }
        return totalCount;
    }
};


