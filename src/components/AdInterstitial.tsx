import React, { useEffect, useState } from 'react';

interface AdInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({ isOpen, onClose }) => {
  const [canClose, setCanClose] = useState(false);
  const [timer, setTimer] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      setTimer(5);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center p-6 border border-white/10">
        
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-gray-400 border border-gray-600 px-2 py-0.5 rounded">
                ADS
            </span>
            {canClose ? (
                <button 
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            ) : (
                <span className="text-xs text-gray-500 font-mono">Fechar em {timer}s</span>
            )}
        </div>

        {/* Ad Content Placeholder */}
        <div className="w-full aspect-square bg-gray-100 dark:bg-black/50 rounded-lg flex flex-col items-center justify-center mb-6 border border-dashed border-gray-700">
             <span className="material-symbols-outlined text-5xl text-gray-600 mb-2">savings</span>
             <h3 className="text-gray-400 font-bold mb-1">Anúncio Intersticial</h3>
             <p className="text-gray-600 text-xs text-center max-w-[200px]">Este espaço exibirá ofertas em tela cheia sem interromper a navegação.</p>
        </div>

        {/* Action Button (Fake Ad Link) */}
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm">
            Ver Oferta
        </button>

      </div>
    </div>
  );
};
