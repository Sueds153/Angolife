import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface RewardedAdProps {
    isOpen: boolean;
    onReward: () => void;
    onClose: () => void;
}

export const RewardedAd: React.FC<RewardedAdProps> = ({ isOpen, onReward, onClose }) => {
    const [watched, setWatched] = useState(false);
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        if (isOpen && !watched) {
            const duration = 30000; // 30 seconds - Optimized for Revenue (range 15-30s)
            const interval = 100;
            const steps = duration / interval;

            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setWatched(true);
                        return 100;
                    }
                    return prev + (100 / steps);
                });
            }, interval);

            return () => clearInterval(timer);
        }
    }, [isOpen, watched]);

    const handleClaim = () => {
        onReward();
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm bg-background-dark border border-gold-primary/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* AdMob Reward Header */}
                <div className="bg-surface-dark px-4 py-3 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                         <div className="size-6 rounded-full bg-gold-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gold-primary text-sm">lock_open</span>
                         </div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Conteúdo Premium</span>
                    </div>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col">
                    <div className="bg-black rounded-xl aspect-video relative overflow-hidden mb-6 border border-white/5 group shadow-inner">
                        <img src="https://picsum.photos/seed/reward/600/400" alt="Video" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-gold-primary/80 animate-pulse">play_circle</span>
                        </div>

                        {/* Progress Bar Label */}
                        <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-center text-[8px] font-bold text-white/50 uppercase tracking-widest">
                            <span>Sponsor Video</span>
                            <span>{Math.ceil(progress)}%</span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                            <div className="h-full bg-gold-gradient transition-all ease-linear" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 text-center mb-6">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                            {watched ? 'Acesso Liberado!' : 'Assista para Ver tudo'}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed px-4">
                            Sua visualização apoia o jornalismo independente em Angola.
                        </p>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={!watched}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${watched
                            ? 'bg-gold-gradient text-background-dark hover:scale-105 shadow-xl shadow-gold-primary/30'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        {watched ? 'Desbloquear Agora' : `Liberando em ${Math.ceil(30 * (1 - progress / 100))}s`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
