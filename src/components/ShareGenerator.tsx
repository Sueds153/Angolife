import React, {  useRef } from 'react';
import { toPng } from 'html-to-image';
import { ExchangeRate } from '../types';

interface ShareGeneratorProps {
  rates: ExchangeRate[];
  onClose: () => void;
}

export const ShareGenerator: React.FC<ShareGeneratorProps> = ({ rates, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);

  const dollar = rates.find(r => r.currency === 'USD') || { formal: 0, informal: 0 };
  const euro = rates.find(r => r.currency === 'EUR') || { formal: 0, informal: 0 };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);

    try {
      // 1. Generate Image
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      
      // 2. Convert to File
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'angolife-cambio.png', { type: 'image/png' });

      // 3. Share or Download
      if (navigator.share) {
        await navigator.share({
          title: 'Câmbio de Hoje - AngoLife',
          text: 'Confira as taxas de hoje no AngoLife!',
          files: [file],
        });
      } else {
        // Fallback for Desktop: Download
        const link = document.createElement('a');
        link.download = 'angolife-cambio.png';
        link.href = dataUrl;
        link.click();
      }
      onClose();
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback if sharing fails (e.g. permission denied)
      alert('Não foi possível abrir o menu de partilha. A imagem será baixada.');
      const link = document.createElement('a');
      link.download = 'angolife-cambio.png';
      link.href = await toPng(cardRef.current, { cacheBust: true });
      link.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col gap-6 max-h-[90vh] overflow-y-auto w-full max-w-sm">
        
        {/* Header */}
        <div className="flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Pré-visualizar Status</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* The Card to Capture */}
        <div className="flex justify-center">
            <div 
              ref={cardRef}
              className="w-[320px] h-[568px] bg-[#050505] relative overflow-hidden flex flex-col items-center justify-between py-10 px-6 shadow-2xl border border-gold-primary/20"
              style={{ fontFamily: 'Playfair Display, serif' }} // Ensure font serves
            >
              {/* Background Decor */}
              <div className="absolute inset-0 bg-gold-gradient opacity-5" style={{ background: 'radial-gradient(circle at center, #D4AF37 0%, transparent 70%)' }}></div>
              <div className="absolute top-0 w-full h-1 bg-gold-gradient"></div>
              <div className="absolute bottom-0 w-full h-1 bg-gold-gradient"></div>
              <img src="/official_emblem.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 opacity-[0.03] grayscale" />

              {/* Branding */}
              <div className="flex flex-col items-center gap-2 z-10">
                 <div className="flex flex-col items-center leading-none">
                    <span className="text-gold-primary text-[8px] font-sans font-black uppercase tracking-[0.3em]">su-golden</span>
                    <div className="h-[1px] w-full bg-gold-primary mt-0.5"></div>
                 </div>
                 <h2 className="text-white text-3xl font-bold tracking-tight">
                    ANGO<span className="text-gold-primary">LIFE</span>
                 </h2>
                 <p className="text-gray-500 text-[10px] font-sans uppercase tracking-widest mt-1">Monitor Cambial</p>
              </div>

              {/* Date */}
              <div className="z-10 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                 <p className="text-gray-300 text-xs font-sans font-medium">{new Date().toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>

              {/* Rates */}
              <div className="flex flex-col gap-6 w-full z-10 mt-4">
                 {/* USD */}
                 <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-gold-primary/20 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🇺🇸</span>
                        <span className="text-gold-primary font-bold text-lg">Dólar (USD)</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                           <span className="text-[9px] text-gray-300 font-sans uppercase tracking-widest">Informal (Rua)</span>
                           <span className="text-3xl font-black text-white">{dollar.informal.toLocaleString('pt-AO')} <span className="text-xs text-gold-primary">kz</span></span>
                       </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] text-gray-300 font-sans uppercase tracking-widest">Banco</span>
                           <span className="text-lg font-bold text-gray-200">{dollar.formal.toFixed(0)} <span className="text-[9px]">kz</span></span>
                        </div>
                    </div>
                 </div>

                 {/* EUR */}
                 <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🇪🇺</span>
                        <span className="text-white font-bold text-lg">Euro (EUR)</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                           <span className="text-[9px] text-gray-300 font-sans uppercase tracking-widest">Informal (Rua)</span>
                           <span className="text-3xl font-black text-white">{euro.informal.toLocaleString('pt-AO')} <span className="text-xs text-white/50">kz</span></span>
                       </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] text-gray-300 font-sans uppercase tracking-widest">Banco</span>
                           <span className="text-lg font-bold text-gray-200">{euro.formal.toFixed(0)} <span className="text-[9px]">kz</span></span>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Footer CTA */}
              <div className="flex flex-col items-center gap-2 z-10 w-full mt-4">
                 <div className="w-12 h-1 bg-gold-primary rounded-full mb-2"></div>
                 <p className="text-gray-400 text-[10px] font-sans text-center max-w-[200px]">
                    Baixe o App <strong className="text-gold-primary">AngoLife</strong> para alertas em tempo real.
                 </p>
                 <div className="bg-white text-black px-4 py-1.5 rounded-lg font-sans font-bold text-xs mt-2 uppercase tracking-wide">
                    Disponível no Android
                 </div>
              </div>

            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleShare}
            disabled={loading}
            className="w-full py-4 bg-gold-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors shadow-lg shadow-gold-primary/20 flex items-center justify-center gap-2"
        >
            {loading ? (
                <span className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                   <span className="material-symbols-outlined">share</span>
                   Partilhar no Status
                </>
            )}
        </button>

      </div>
    </div>
  );
};
