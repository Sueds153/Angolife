import React, { useEffect, useState } from 'react';
import { PublicityService } from '../services/PublicityService';
import { AdSpot } from '../types';

interface BannerCardProps {
  type: 'banner' | 'sidebar' | 'sponsored' | 'google-adsense';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const BannerCard: React.FC<BannerCardProps> = ({ type, className = "" }) => {
  const [internalAd, setInternalAd] = useState<AdSpot | null>(null);

  useEffect(() => {
    // Try to fetch an internal ad for this slot type
    const loadAd = async () => {
      // Map component types to DB locations if needed, or use type directly
      const ad = await PublicityService.fetchActiveAd(type);
      if (ad) setInternalAd(ad);
    };

    // Only fetch for banner and sidebar for now
    if (type === 'banner' || type === 'sidebar') {
      loadAd();
    }
  }, [type]);

  if (type === 'banner') {
    if (internalAd) {
      // Render Dynamic Internal Ad
      return (
        <a href={internalAd.cta} target="_blank" rel="noopener noreferrer"
          onClick={() => PublicityService.trackClick(internalAd.id)}
          className={`w-full bg-surface-dark rounded-2xl h-24 flex items-center justify-center border border-border-gold relative overflow-hidden group ${className}`}>
          <img src={internalAd.image} alt="Advertisement" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-1 right-2 text-[6px] text-white/50 uppercase">Patrocinado</span>
        </a>
      );
    }

    // Fallback / Placeholder
    return (
      <div className={`w-full bg-surface-dark rounded-2xl h-24 flex flex-col items-center justify-center border border-border-gold relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 bg-gold-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="absolute top-2 right-4 text-[8px] uppercase tracking-widest text-gold-primary/50 font-bold">Patrocinado</span>
        <p className="text-gold-primary/40 text-sm font-semibold tracking-wide italic">Publicidade Premium — 728x90</p>
        <p className="text-[10px] text-gray-700 mt-1">Sua marca aqui para investidores angolanos</p>
      </div>
    );
  }

  if (type === 'sidebar') {
    if (internalAd) {
      return (
        <a href={internalAd.cta} target="_blank" rel="noopener noreferrer"
          onClick={() => PublicityService.trackClick(internalAd.id)}
          className={`w-full aspect-[4/5] bg-surface-dark rounded-2xl flex flex-col items-center justify-center border border-border-gold relative overflow-hidden group shadow-inner ${className}`}>
          <img src={internalAd.image} alt="Ad" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
          <span className="absolute top-2 right-4 text-[8px] uppercase tracking-widest text-white/80 font-black bg-black/50 px-2 rounded">Ad</span>
        </a>
      );
    }
  }

  if (type === 'sponsored') {
    return (
      <div className={`relative w-full rounded-3xl overflow-hidden min-h-[260px] flex flex-col justify-end p-10 bg-cover bg-center border border-border-gold shadow-2xl ${className}`}
        style={{ backgroundImage: `linear-gradient(to top, rgba(10,10,10,0.95), transparent), url('https://picsum.photos/seed/ads/1200/600')` }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient"></div>
        <div className="relative z-10 max-w-xl">
          <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter leading-none">
            O Prestígio que o seu <span className="text-gold-primary">Negócio Merece</span>
          </h3>
          <p className="text-gray-300 text-sm mb-8 font-medium leading-relaxed">
            Alcance o topo do mercado angolano. Anuncie na rede exclusiva de empresários e investidores da AngoLife.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-gold-gradient text-background-dark font-black rounded-full text-xs uppercase tracking-widest shadow-xl shadow-gold-primary/20">
              Anunciar Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Google AdSense Implementation
  if (type === 'google-adsense') {
    return (
      <div className={`w-full bg-surface-dark/50 rounded-2xl flex flex-col items-center justify-center border border-border-gold/30 overflow-hidden p-4 min-h-[100px] ${className}`}>
        <p className="text-[10px] text-gray-600 uppercase mb-2">Publicidade</p>
        <div className="w-full h-full flex items-center justify-center bg-transparent">
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
          <script>
            (window.adsbygoogle = window.adsbygoogle || []).push({ });
          </script>
        </div>
      </div>
    );
  }


  return (
    <div className={`w-full aspect-[4/5] bg-surface-dark rounded-2xl flex flex-col items-center justify-center border border-border-gold relative overflow-hidden group shadow-inner p-6 text-center ${className}`}>
      <div className="absolute inset-0 bg-gold-primary/5 opacity-50"></div>
      <span className="absolute top-2 right-4 text-[8px] uppercase tracking-widest text-gold-primary/40 font-black">Ad Exclusiva</span>
      <span className="material-symbols-outlined text-gold-primary/30 text-4xl mb-4">campaign</span>
      <p className="text-gold-primary text-xs font-bold mb-3 italic">Curadoria AngoLife</p>
      <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">Premium Slot</p>
    </div>
  );
};
