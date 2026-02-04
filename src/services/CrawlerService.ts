import { supabase } from '../lib/supabase';

export const CrawlerService = {
    // Configurações das fontes solicitadas
    SOURCES: {
        LINKEDIN: 'LinkedIn',
        INEFOP: 'INEFOP',
        MIRANTES: 'Mirantes'
    },



    /**
     * Executes the AI Crawler via Edge Functions.
     * Scrapes real data from defined sources.
     */
    async runAutoCrawler() {
        console.log('Iniciando AI Crawler (Live Mode)...');
        let totalCount = 0;

        // Lista de URLs REAIS Ampliada
        // Nota: Instagram requer API oficial ou login, scraping direto é frequentemente bloqueado.
        // Adicionamos URLs de busca pública que a IA consegue ler.
        const TARGET_URLS = [
            'https://www.jobartis.com', 
            'https://www.linkedin.com/jobs/search?keywords=Angola&location=Angola',
            'https://www.emprego.co.ao',
            'https://www.inefop.ao', // Se houver página de listagem pública
            'https://www.google.com/search?q=vagas+emprego+angola+instagram' // Tentativa de achar posts indexados
        ];

        for (const url of TARGET_URLS) {
            try {
                const { data, error } = await supabase.functions.invoke('ai-scraper', {
                    body: { url, type: 'jobs' }
                });

                if (error || !data) continue;

                const jobs = Array.isArray(data) ? data : [];
                console.log(`Encontradas ${jobs.length} vagas em ${url}`);

                for (const job of jobs) {
                    // Refinamento de localização para garantir "Angola"
                    if (job.location && !job.location.toLowerCase().includes('angola')) {
                         job.location = job.location + ', Angola'; 
                    }

                    const { error: dbError } = await supabase
                        .from('jobs')
                        .upsert({
                            title: job.title || 'Oportunidade',
                            company: job.company || 'Empresa Angolana',
                            location: job.location || 'Luanda, Angola',
                            type: 'Tempo Inteiro',
                            source: new URL(url).hostname.replace('www.', ''),
                            external_link: job.link || url,
                            description: job.description || 'Vaga detectada via AI Crawler.',
                            is_elite: false,
                            status: 'pending',
                            created_at: new Date().toISOString()
                        }, { onConflict: 'external_link' });
                    
                    if (!dbError) totalCount++;
                }
            } catch (err) {
                console.error(`Erro processando ${url}:`, err);
            }
        }

        return totalCount;
    },

    /**
     * Busca promoções usando IA em sites de e-commerce angolanos ampliado.
     */
    async runPromotionCrawler() {
        console.log('Iniciando Promo Crawler (Supermercados)...');
        let totalCount = 0;

        const SHOP_URLS = [
            'https://www.ncrangola.com',
            'https://www.kero.ao',
            'https://www.shoprite.co.ao', // Validar se existe site com catálogo
            'https://www.arreio.ao' // Exemplo, se existir
        ];

        for (const url of SHOP_URLS) {
            try {
                const { data, error } = await supabase.functions.invoke('ai-scraper', {
                    body: { url, type: 'promotions' }
                });

                if (error || !data) continue;

                const promos = Array.isArray(data) ? data : [];
                
                for (const item of promos) {
                    const { error: dbError } = await supabase
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
                    
                    if (!dbError) totalCount++;
                }
            } catch (err) {
                console.error('Erro crawler promo:', err);
            }
        }

        return totalCount;
    }

};


