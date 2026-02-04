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
            const duration = 30000; // 30 seconds "video"
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
            <div className="relative w-full max-w-sm bg-surface-dark border border-gold-primary/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 m-4">

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gold-primary">lock_open</span>
                        <span className="text-xs font-black text-white uppercase tracking-widest">Desbloquear Conteúdo</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="bg-black rounded-xl aspect-video relative overflow-hidden mb-6 border border-white/10 group">
                    {/* Simulating Video Ad */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gold-primary mb-2 animate-bounce">play_circle</span>
                        <p className="text-xs text-gray-400 font-medium">Assistindo Anúncio...</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gold-primary transition-all ease-linear" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-white text-center">
                        {watched ? 'Conteúdo Desbloqueado!' : 'Assista para liberar'}
                    </h3>
                    <p className="text-xs text-gray-400 text-center mb-4">
                        Este conteúdo premium é oferecido gratuitamente graças aos nossos patrocinadores.
                    </p>

                    <button
                        onClick={handleClaim}
                        disabled={!watched}
                        className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${watched
                            ? 'bg-gold-gradient text-background-dark hover:scale-105 shadow-xl shadow-gold-primary/20'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {watched ? 'Ver Conteúdo Agora' : `Aguarde... ${Math.ceil(30 * (1 - progress / 100))}s`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
