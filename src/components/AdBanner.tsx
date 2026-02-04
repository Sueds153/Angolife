import React from 'react';

interface AdBannerProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  slotId?: string; // For future Google AdSense Slot ID
  dismissible?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ format = 'horizontal', className = '', slotId, dismissible = false }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const getDimensions = () => {
    switch (format) {
      case 'horizontal': return 'w-full h-[90px] md:h-[120px]'; // Leaderboard
      case 'rectangle': return 'w-[300px] h-[250px]'; // Medium Rectangle
      case 'vertical': return 'w-[160px] h-[600px]'; // Skyscraper
      default: return 'w-full h-auto';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className} animate-fade-in`}>
      <div className="w-full flex justify-center">
        <div className={`relative ${getDimensions()} bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden flex flex-col items-center justify-center`}>
          
          {/* Label & Close Button */}
          <div className="absolute top-0 right-0 z-10 flex">
            {dismissible && (
              <button 
                onClick={() => setIsVisible(false)}
                className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-bl-lg transition-colors"
                title="Fechar anúncio"
              >
                <span className="material-symbols-outlined text-[12px] font-bold">close</span>
              </button>
            )}
            <span className={`bg-gray-200 dark:bg-white/10 text-[9px] text-gray-500 dark:text-gray-200 px-2 py-0.5 ${dismissible ? '' : 'rounded-bl-lg'}`}>
              Publicidade
            </span>
          </div>

          {/* Placeholder Visuals (Remove this when pasting real Ad Code) */}
          <div className="flex flex-col items-center gap-2 opacity-50">
            <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-white/20">ads_click</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Google Ads Space</span>
            {slotId && <span className="text-[10px] text-gray-300 font-mono">{slotId}</span>}
          </div>

          {/* 
            TODO: PLACE GOOGLE ADSENSE CODE HERE 
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot={slotId}
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          */}
        </div>
      </div>
    </div>
  );
};
