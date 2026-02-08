import React, { useState } from 'react';
import { Promotion, PromotionCategory } from '../../types';
import { PromotionService } from '../../services/PromotionService';
import { useToast } from '../../context/ToastContext';

interface AdminPromotionsProps {
    pendingPromos: Promotion[];
    loadPendingPromos: () => void;
}

export const AdminPromotions: React.FC<AdminPromotionsProps> = ({ pendingPromos, loadPendingPromos }) => {
    const [showPromoForm, setShowPromoForm] = useState(false);
    const [newPromo, setNewPromo] = useState({
        productName: '', price: '', store: '', location: '',
        description: '', userContact: '', category: 'Other' as PromotionCategory
    });
    const { addToast } = useToast();

    const handleApprovePromo = async (id: string) => {
        const { error } = await PromotionService.approvePromotion(id);
        if (!error) {
            addToast('Promoção aprovada!', 'success');
            loadPendingPromos();
        } else {
            addToast(`Erro ao aprovar: ${error.message}`, 'error');
        }
    };

    const handleDeletePromo = async (id: string) => {
        const { error } = await PromotionService.deletePromotion(id);
        if (!error) {
            addToast('Promoção descartada.', 'info');
            loadPendingPromos();
        } else {
            addToast(`Erro ao remover: ${error.message}`, 'error');
        }
    };

    const handleAddPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await PromotionService.addPromotion({
            ...newPromo,
            image: 'https://picsum.photos/seed/' + Math.floor(Math.random() * 1000) + '/400/400'
        });
        if (!error) {
            addToast('Desconto publicado com sucesso!', 'success');
            setNewPromo({ productName: '', price: '', store: '', location: '', description: '', userContact: '', category: 'Other' });
            setShowPromoForm(false);
        } else {
            addToast('Erro ao publicar desconto: ' + error.message, 'error');
        }
    };

    return (
        <div className="flex flex-col gap-12">
            <button
                onClick={() => setShowPromoForm(!showPromoForm)}
                className="glass-card p-6 flex items-center justify-between group hover:border-gold-primary transition-all text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary">
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Publicar Desconto Manual</h3>
                        <p className="text-xs text-gray-500">Partilhe uma promoção exclusiva</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-gold-primary transition-colors">
                    {showPromoForm ? 'expand_less' : 'add'}
                </span>
            </button>

            {showPromoForm && (
                <section className="glass-card p-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-gold-primary mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined">shopping_basket</span> Novo Desconto Exclusivo
                    </h2>
                    <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="promoTitle" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Nome do Produto</label>
                            <input id="promoTitle" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newPromo.productName} onChange={e => setNewPromo({ ...newPromo, productName: e.target.value })} placeholder="Ex: Smart TV 4K" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="promoPrice" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Preço em Promoção</label>
                            <input id="promoPrice" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newPromo.price} onChange={e => setNewPromo({ ...newPromo, price: e.target.value })} placeholder="Ex: 150.000 AOA" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="promoStore" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Loja / Vendedor</label>
                            <input id="promoStore" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newPromo.store} onChange={e => setNewPromo({ ...newPromo, store: e.target.value })} placeholder="Ex: Kero Gika" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="promoCategory" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Categoria</label>
                            <select id="promoCategory" className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newPromo.category} onChange={e => setNewPromo({ ...newPromo, category: e.target.value as PromotionCategory })}>
                                <option value="Tech">Tecnologia</option>
                                <option value="Fashion">Moda</option>
                                <option value="Auto">Automóveis</option>
                                <option value="Home">Casa</option>
                                <option value="Other">Outros</option>
                            </select>
                        </div>
                        <button type="submit" className="md:col-span-2 bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.01] transition-all">
                            Publicar Promoção Agora
                        </button>
                    </form>
                </section>
            )}

            {/* Promotions Moderation Section */}
            <section className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">shopping_cart</span> Moderação de Descontos
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-primary text-[10px]">{pendingPromos.length} Pendentes</span>
                </h2>

                {pendingPromos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingPromos.map(promo => (
                            <div key={promo.id} className="glass-card flex flex-col group overflow-hidden border-l-4 border-l-gold-primary/30 hover:border-l-gold-primary transition-all">
                                <div className="p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border bg-gold-primary/10 text-gold-primary border-gold-primary/20">
                                            {promo.category || 'Promoção'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gold-primary">{promo.price}</span>
                                    </div>

                                    <div className="flex gap-4">
                                        <img src={promo.image} alt="" className="size-16 rounded-xl object-cover border border-white/10" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">{promo.productName}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">store</span> {promo.store}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 border-t border-white/10">
                                    <button
                                        onClick={() => handleDeletePromo(promo.id)}
                                        className="py-3 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-r border-white/10"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        onClick={() => handleApprovePromo(promo.id)}
                                        className="py-3 text-[9px] font-black uppercase tracking-widest text-green-500/60 hover:text-green-500 hover:bg-green-500/5 transition-all"
                                    >
                                        Aprovar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 bg-white/5 transition-all">
                        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-600 text-3xl">shopping_bag</span>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold">Nenhum desconto aguardando revisão</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
