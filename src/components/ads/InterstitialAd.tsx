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
            <div className="relative w-full max-w-lg bg-surface-dark border border-border-gold rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8 text-center m-4">

                <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient"></div>

                {/* Ad Content Placeholder */}
                <div className="w-full bg-black/20 aspect-video mb-6 flex items-center justify-center rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <span className="material-symbols-outlined text-4xl text-gold-primary mb-2">stars</span>
                        <h3 className="text-xl font-bold text-white mb-1">Publicidade Premium</h3>
                        <p className="text-xs text-gray-400">Sua marca aqui em destaque</p>
                    </div>
                    {/* Google Ads Placeholder */}
                    <div className="absolute inset-0 opacity-10">
                        {/* <ins className="adsbygoogle" ... /> */}
                    </div>
                </div>

                <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                    Apoiamos o desenvolvimento angolano trazendo as melhores oportunidades até si.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={!canClose}
                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${canClose
                                ? 'bg-gold-gradient text-background-dark hover:scale-105 shadow-xl shadow-gold-primary/20'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        {canClose ? 'Fechar Publicidade' : `Aguarde ${timeLeft}s...`}
                    </button>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Advertisement</p>
                </div>
            </div>
        </div>,
        document.body
    );
};
