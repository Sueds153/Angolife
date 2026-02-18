
import React, { useEffect, useState } from 'react';
import { Plus, ShoppingBag, MapPin, X, Camera, FileUp } from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { GeminiService } from '../services/gemini';
import { ProductDeal } from '../types';
import { ShareButton } from '../components/ShareButton';

interface DealsPageProps {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({ isAuthenticated, onRequireAuth }) => {
  const [deals, setDeals] = useState<ProductDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', store: '', storeNumber: '', originalPrice: 0, discountPrice: 0, location: '', description: '',
  });

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const [aiDeals, dbDeals] = await Promise.all([
          GeminiService.fetchDeals(),
          SupabaseService.getDeals(false)
        ]);
        setDeals([...aiDeals, ...dbDeals]);
      } catch (e) {
        const dbDeals = await SupabaseService.getDeals(false);
        setDeals(dbDeals);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleOpenModal = () => {
    if (!isAuthenticated) onRequireAuth();
    else setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await SupabaseService.submitDeal({
      ...formData,
      description: formData.description || `Oferta imperdível de ${formData.title}`,
      originalPrice: formData.originalPrice || formData.discountPrice * 1.2, // Mock original price if not provided
      submittedBy: 'guest', 
      imagePlaceholder: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80`
    });
    setIsModalOpen(false);
    setFormData({ title: '', store: '', storeNumber: '', originalPrice: 0, discountPrice: 0, location: '', description: '' });
    alert("Promoção enviada para análise!");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1">
        <h2 className="text-3xl font-black text-brand-gold uppercase tracking-tighter">Descontos</h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Preços reais encontrados em Luanda</p>
      </div>

      {/* FAB - POSICIONADO ACIMA DA TAB BAR E DO ANÚNCIO */}
      <button 
        onClick={handleOpenModal}
        className="fixed bottom-36 right-6 z-[90] bg-brand-gold text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 active:scale-90 transition-all animate-bounce-subtle"
        aria-label="Publicar nova oferta"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="bg-slate-100 dark:bg-slate-900 h-64 rounded-[2rem] animate-pulse"></div>)}
        </div>
      ) : (
        <div className="relative">
          {!isAuthenticated && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md rounded-[2rem] p-6 text-center animate-fade-in h-96 mt-10">
              <div className="bg-brand-gold p-4 rounded-full shadow-lg mb-4 text-white">
                <ShoppingBag size={32} />
              </div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl mb-2">Ofertas Exclusivas</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-6 max-w-[250px]">
                Crie uma conta gratuita para ver os preços secretos das melhores lojas de Luanda.
              </p>
              <button 
                onClick={onRequireAuth}
                className="bg-slate-900 dark:bg-brand-gold text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Entrar / Criar Conta
              </button>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${!isAuthenticated ? 'blur-md select-none pointer-events-none opacity-50 overflow-hidden max-h-[600px]' : ''}`}>
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-white/5 group hover:shadow-xl transition-all">
               <div className="h-48 overflow-hidden relative">
                 <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                   -{Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}%
                 </div>

               </div>
               <div className="p-4">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                     S
                   </div>
                   <span className="text-xs text-slate-500 font-bold">{deal.store}</span>
                 </div>
                 <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-3 line-clamp-2 min-h-[2.5em]">{deal.title}</h3>
                 
                 <div className="flex items-end justify-between">
                   <div>
                     <p className="text-xs text-slate-400 line-through font-medium">{deal.originalPrice.toLocaleString()} Kz</p>
                     <p className="text-lg font-black text-brand-gold">{deal.discountPrice.toLocaleString()} <span className="text-xs">Kz</span></p>
                   </div>
                   <button 
                     className="bg-brand-dark dark:bg-slate-800 text-white p-2 rounded-xl hover:bg-brand-gold transition-colors shadow-lg"
                     aria-label="Ver detalhes da oferta"
                   >
                     <Plus size={18} />
                   </button>
                 </div>
               </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE PUBLICAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col animate-fade-in">
           <div className="px-6 py-10 flex justify-between items-center border-b gold-border-b-subtle">
             <div className="flex items-center gap-3 text-brand-gold font-black uppercase text-lg">
                <Camera size={24} /> <span>Publicar Oferta</span>
             </div>
             <button onClick={() => setIsModalOpen(false)} className="text-white bg-white/10 p-2 rounded-full" aria-label="Fechar"><X size={24} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
             <form id="deal-form" onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</label>
                  <input 
                    required 
                    className="w-full bg-white/5 border gold-border-subtle rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-brand-gold" 
                    placeholder="Inserir produto..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    aria-label="Nome do Produto"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loja</label>
                  <input 
                    required 
                    className="w-full bg-white/5 border gold-border-subtle rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-brand-gold" 
                    placeholder="Inserir loja..."
                    value={formData.store}
                    onChange={(e) => setFormData({...formData, store: e.target.value})}
                    aria-label="Nome da Loja"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Localização</label>
                  <input 
                    required 
                    className="w-full bg-white/5 border gold-border-subtle rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-brand-gold" 
                    placeholder="Inserir localização..."
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    aria-label="Localização da Loja"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Número de Telefone da Loja (Opcional)</label>
                  <input 
                    className="w-full bg-white/5 border gold-border-subtle rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-brand-gold" 
                    placeholder="Inserir contacto..."
                    value={formData.storeNumber}
                    onChange={(e) => setFormData({...formData, storeNumber: e.target.value})}
                    aria-label="Telefone da Loja"
                  />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço em Kwanzas</label>
                   <input 
                     required 
                     type="number" 
                     className="w-full bg-white/5 border gold-border-subtle rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-brand-gold" 
                     placeholder="Ex: 5000"
                     value={formData.discountPrice || ''}
                     onChange={(e) => setFormData({...formData, discountPrice: Number(e.target.value)})}
                     aria-label="Preço em Kwanzas"
                   />
                </div>
                
                <div className="w-full h-40 border-2 border-dashed gold-border-subtle rounded-2xl flex flex-col items-center justify-center bg-white/5">
                   <FileUp size={30} className="text-slate-600 mb-2" />
                   <span className="text-[10px] font-black text-slate-600 uppercase">Toque para carregar foto</span>
                </div>
             </form>
           </div>

           <div className="p-6 bg-slate-950/95 backdrop-blur-xl border-t gold-border-t-subtle">
             <button form="deal-form" type="submit" className="w-full bg-brand-gold text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                ENVIAR AGORA
             </button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
