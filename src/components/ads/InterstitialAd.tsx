import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface InterstitialAdProps {
    isOpen: boolean;
    onClose: () => void;
    timerDuration?: number; // seconds
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ isOpen, onClose, timerDuration = 5 }) => {
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCanClose(false);
            setTimeLeft(timerDuration);

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen, timerDuration]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm bg-background-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
                
                {/* Header AdMob Style */}
                <div className="w-full bg-surface-dark px-4 py-2 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-2">
                         <div className="size-5 rounded-sm bg-gold-primary flex items-center justify-center text-[8px] font-black text-black">Ad</div>
                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-left">Anúncio Google</span>
                    </div>
                </div>

                <div className="p-6 flex flex-col items-center text-center">
                    {/* Ad Content Placeholder */}
                    <div className="w-full bg-black/40 aspect-[4/5] mb-6 flex items-center justify-center rounded-xl border border-white/5 relative overflow-hidden group">
                        <img src="https://picsum.photos/seed/ango-prestige/600/800" alt="Ad" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="relative z-10 flex flex-col items-center p-4">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">AngoLife <span className="text-gold-primary">Prestige</span></h3>
                            <p className="text-xs text-gray-200 font-medium">Investimentos de Luxo em Luanda</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={!canClose}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${canClose
                                ? 'bg-gold-gradient text-background-dark hover:scale-105 shadow-xl shadow-gold-primary/30'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        {canClose ? 'Pular Anúncio' : `Fechar em ${timeLeft}s`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
