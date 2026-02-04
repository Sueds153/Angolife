import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Promotion, PromotionCategory } from '../types';
import { BannerCard } from '../components/BannerCard';
import { PromotionService } from '../services/PromotionService';
import { useToast } from '../context/ToastContext';

interface PromotionsProps {
  promotions: Promotion[];
}

export const Promotions: React.FC<PromotionsProps> = ({ promotions }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PromotionCategory | 'All'>('All');
  const [newPromo, setNewPromo] = useState({
    productName: '',
    price: '',
    store: '',
    location: '',
    description: '',
    userContact: '',
    category: 'Other' as PromotionCategory
  });
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.productName || !newPromo.price) return;

    setIsSubmitting(true);
    try {
      const { error } = await PromotionService.addPromotion({
        ...newPromo,
        image: 'https://picsum.photos/seed/' + Math.random() + '/400/400',
        isVerified: false
      });

      if (error) throw error;

      addToast('Promoção enviada! Aguarde a aprovação do admin.', 'success');
      setNewPromo({ productName: '', price: '', store: '', location: '', description: '', userContact: '', category: 'Other' });
      setShowForm(false);
    } catch (err: any) {
      addToast('Erro ao enviar promoção: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white italic">Os Descontos <span className="text-gold-primary">da Banda</span></h1>
          <p className="text-gray-500 text-lg">Partilhe e encontre os melhores preços de Angola.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold-gradient text-background-dark font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest shadow-xl shadow-gold-primary/20 hover:scale-105 transition-transform"
        >
          {showForm ? 'Cancelar' : 'Partilhar Desconto'}
        </button>
      </div>

      {showForm && (
        <section className="bg-surface-dark border border-gold-primary/30 rounded-3xl p-8 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-primary">add_a_photo</span> Detalhes da Promoção
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Produto</label>
                <input
                  required
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="Ex: iPhone 15 Pro"
                  value={newPromo.productName}
                  onChange={e => setNewPromo({ ...newPromo, productName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Preço (AOA)</label>
                <input
                  required
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="Ex: 500.000"
                  value={newPromo.price}
                  onChange={e => setNewPromo({ ...newPromo, price: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Loja</label>
                <input
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="Ex: Unitel Store"
                  value={newPromo.store}
                  onChange={e => setNewPromo({ ...newPromo, store: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Localização</label>
                <input
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="Ex: Luanda, Talatona"
                  value={newPromo.location}
                  onChange={e => setNewPromo({ ...newPromo, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Seu Contacto (WhatsApp/Tel)</label>
                <input
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="+244 9XX XXX XXX"
                  value={newPromo.userContact}
                  onChange={e => setNewPromo({ ...newPromo, userContact: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Descrição Adicional</label>
                <input
                  className="bg-background-dark border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                  placeholder="Detalhes extras..."
                  value={newPromo.description}
                  onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Mídia (Foto/Vídeo)</label>
              <div className="border-2 border-dashed border-border-gold rounded-2xl h-40 flex flex-col items-center justify-center text-gray-600 hover:text-gold-primary hover:border-gold-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                <span className="text-xs font-bold">Arraste ou clique para enviar</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-gold-primary/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'A enviar...' : 'Publicar Agora'}
            </button>
          </form>
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(['All', 'Tech', 'Fashion', 'Beauty', 'Auto', 'Home', 'Other'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat
              ? 'bg-gold-primary text-black'
              : 'bg-white/5 text-gray-400 hover:text-gray-900 dark:text-white hover:bg-white/10'
              }`}
          >
            {cat === 'All' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {promotions
          .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
          .map(promo => (
            <div key={promo.id} className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:border-gold-primary/50 transition-all">
              <Link to={`/promotions/${promo.id}`} className="aspect-square bg-cover bg-center relative block overflow-hidden">
                <div className="absolute inset-0 bg-gold-primary/0 group-hover:bg-gold-primary/10 transition-all"></div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => { e.preventDefault(); /* Like logic */ }}
                    className="size-10 rounded-full glass-card flex items-center justify-center text-gray-900 dark:text-white hover:text-gold-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
                {promo.isVerified && (
                  <div className="absolute bottom-4 left-4 bg-gold-primary text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                    Verificado VIP
                  </div>
                )}
              </Link>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-gold-primary transition-colors truncate">{promo.productName}</h3>
                  <p className="text-gold-primary font-black text-xl">{promo.price}</p>
                </div>
                <div className="flex flex-col gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span className="truncate">{promo.store}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-gold-primary">location_on</span>
                    <span className="truncate">{promo.location}</span>
                  </div>
                </div>
                <Link to={`/promotions/${promo.id}`} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-center hover:bg-gold-primary hover:text-black hover:border-gold-primary transition-all">
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
      </div>

      <BannerCard type="banner" />
    </div>
  );
};
