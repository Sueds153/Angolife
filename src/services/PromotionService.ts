import { supabase } from '../lib/supabase';
import { Promotion } from '../types';

export const PromotionService = {
    // Buscar todas as promoções publicadas com paginação
    fetchPromotions: async (page = 1, limit = 10): Promise<Promotion[]> => {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching promotions:', error);
            return [];
        }

        return (data || []).map(PromotionService.mapPromotion);
    },

    // Buscar últimas promoções para a Home
    getLatestPromotions: async (limit = 2): Promise<Promotion[]> => {
        return await PromotionService.fetchPromotions(1, limit);
    },

    // Buscar promoção por ID
    getPromotionById: async (id: string): Promise<Promotion | null> => {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return PromotionService.mapPromotion(data);
    },

    // Buscar promoções aguardando moderação
    fetchPendingPromotions: async (): Promise<Promotion[]> => {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending promotions:', error);
            return [];
        }

        return (data || []).map(PromotionService.mapPromotion);
    },

    // Adicionar nova promoção (pelo usuário)
    addPromotion: async (promo: Omit<Promotion, 'id' | 'status'>) => {
        return await supabase
            .from('promotions')
            .insert([{
                product_name: promo.productName,
                price: promo.price,
                store: promo.store,
                location: promo.location,
                image_url: promo.image,
                description: promo.description,
                user_contact: promo.userContact,
                category: promo.category,
                status: 'pending' // Submissões de usuários também moderadas
            }]);
    },

    // Aprovar uma promoção
    approvePromotion: async (id: string) => {
        return await supabase
            .from('promotions')
            .update({ status: 'published' })
            .eq('id', id);
    },

    // Eliminar uma promoção (rejeitar)
    deletePromotion: async (id: string) => {
        return await supabase
            .from('promotions')
            .delete()
            .eq('id', id);
    },

    // Mapear dados do banco para o tipo do Frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapPromotion: (p: any): Promotion => ({
        id: p.id,
        productName: p.product_name || p.productName || 'Sem nome',
        price: p.price || 'Preço sob consulta',
        store: p.store || 'Loja Local',
        location: p.location || 'Angola',
        image: p.image_url || p.image || 'https://via.placeholder.com/300',
        isVerified: p.is_verified,
        description: p.description,
        userContact: p.user_contact,
        submittedBy: p.submitted_by,
        category: p.category,
        status: p.status,
        sourceUrl: p.external_link || p.sourceUrl
    })
};
