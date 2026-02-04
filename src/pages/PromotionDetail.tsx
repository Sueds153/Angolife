
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Promotion } from '../types';
import { BannerCard } from '../components/BannerCard';

interface PromotionDetailProps {
  promotions: Promotion[];
}

export const PromotionDetail: React.FC<PromotionDetailProps> = ({ promotions }) => {
  const { id } = useParams();
  const promo = promotions.find(p => p.id === id);

  if (!promo) return (
    <div className="flex flex-col items-center justify-center py-20 text-white">
      <h2 className="text-2xl font-bold">Desconto não encontrado</h2>
      <Link to="/promotions" className="mt-4 text-gold-primary font-bold uppercase tracking-widest text-xs">Voltar aos Descontos</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 flex flex-col gap-8">
        <Link to="/promotions" className="flex items-center gap-2 text-gray-500 hover:text-gold-primary transition-colors text-xs font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Voltar aos Descontos
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
          <div className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url('${promo.image}')` }}></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black text-white">{promo.productName}</h1>
                <p className="text-gold-primary text-2xl font-black mt-1">{promo.price}</p>
              </div>
              {promo.isVerified && (
                <div className="px-4 py-1.5 bg-gold-primary text-background-dark text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-gold-primary/20">
                  Verificado VIP
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y border-border-gold mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold-primary">storefront</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Loja</span>
                  <span className="text-sm text-white font-bold">{promo.store}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold-primary">location_on</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Local</span>
                  <span className="text-sm text-white font-bold">{promo.location}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed mb-8">
              Este produto está disponível com este valor promocional por tempo limitado. 
              A Su-Golden Lda recomenda verificar a disponibilidade de stock directamente na loja {promo.store} em {promo.location}.
            </p>

            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-gold-gradient text-background-dark font-black rounded-xl uppercase tracking-widest shadow-xl shadow-gold-primary/20">
                Contactar Loja
              </button>
              <button className="flex items-center justify-center size-14 border border-border-gold rounded-xl text-white hover:text-gold-primary transition-colors">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:col-span-5 flex flex-col gap-8">
        <div className="glass-card rounded-3xl p-8">
          <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-primary">forum</span> Conversa sobre o Preço
          </h4>
          <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto no-scrollbar mb-6">
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-gold-primary/20 shrink-0 border border-gold-primary/10"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white font-black uppercase tracking-widest">António L.</span>
                <p className="text-xs text-gray-400 bg-white/5 p-3 rounded-2xl rounded-tl-none">Confirmado! Estive lá ontem e o preço é real. Atendimento premium.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-blue-500/20 shrink-0 border border-blue-500/10"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white font-black uppercase tracking-widest">Sílvia M.</span>
                <p className="text-xs text-gray-400 bg-white/5 p-3 rounded-2xl rounded-tl-none">Ainda têm stock do Titanium?</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-white/5 border border-border-gold rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-gold-primary outline-none"
              placeholder="Escreva algo..."
            />
            <button className="size-11 bg-gold-gradient text-background-dark rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
        <BannerCard type="banner" />
      </aside>
    </div>
  );
};
