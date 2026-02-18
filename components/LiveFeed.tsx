import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const names = ['André', 'Kieza', 'Mário', 'Delfina', 'Nkosi', 'Kiame', 'Nayara', 'Mauro', 'Jelson', 'Aura'];
const wallets = ['Binance', 'Wise', 'PayPal', 'Redotpay', 'Revolut'];
const amounts = [50, 100, 250, 500, 1000, 1500, 75, 120];

export const LiveFeed = () => {
  const [currentFeed, setCurrentFeed] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generateFeed = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const wallet = wallets[Math.floor(Math.random() * wallets.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const currency = Math.random() > 0.5 ? 'USD' : 'EUR';
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const bank = ['BAI', 'BFA', 'Atlântico'][Math.floor(Math.random() * 3)];
      
      setCurrentFeed({ name, wallet, amount, currency, type, bank });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const interval = setInterval(() => {
      generateFeed();
    }, 45000 + Math.random() * 15000);

    // Initial feed after a short delay
    const initialTimeout = setTimeout(generateFeed, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!currentFeed) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border gold-border-subtle flex items-center gap-4 max-w-xs">
        <div className={`p-2 rounded-full animate-pulse ${currentFeed.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-brand-gold/20 text-brand-gold'}`}>
          <Activity size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">FEED AO VIVO</p>
          <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
            {currentFeed.type === 'buy' ? (
              <>🔥 <span className="text-brand-gold">{currentFeed.name}</span> acabou de receber <span className="text-green-500">{currentFeed.amount} {currentFeed.currency}</span> na <span className="font-black underline">{currentFeed.wallet}</span>.</>
            ) : (
              <>✅ <span className="text-brand-gold">{currentFeed.name}</span> acabou de vender <span className="text-brand-gold">${currentFeed.amount}</span> e recebeu os Kwanzas no <span className="font-black underline">{currentFeed.bank}</span>.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
