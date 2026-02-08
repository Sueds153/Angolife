import React, { useState } from 'react';
import { ExchangeRate } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminRatesProps {
  rates: ExchangeRate[];
  onUpdate: (currency: string, rate: number) => void;
}

export const AdminRates: React.FC<AdminRatesProps> = ({ rates, onUpdate }) => {
  const [updates, setUpdates] = useState<{ [key: string]: string }>({});
  const { addToast } = useToast();

  const handleUpdate = async (currency: string) => {
    const val = parseFloat(updates[currency]);
    if (!isNaN(val)) {
      onUpdate(currency, val);
      setUpdates(prev => ({ ...prev, [currency]: '' })); // Clear input
      addToast(`${currency} atualizado com sucesso!`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
          <span className="material-symbols-outlined">currency_exchange</span> Atualizar Taxas Informais
        </h2>
        {rates.map(rate => (
          <div key={rate.currency} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">{rate.currency} / AOA</h3>
              <span className="text-xs text-gray-500 uppercase">Actual: {rate.informal.toLocaleString('pt-AO')}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm flex-1 focus:ring-1 focus:ring-gold-primary outline-none"
                placeholder="Nova taxa informal..."
                value={updates[rate.currency] || ''}
                onChange={e => setUpdates({ ...updates, [rate.currency]: e.target.value })}
              />
              <button
                onClick={() => handleUpdate(rate.currency)}
                className="bg-gold-gradient text-background-dark font-black px-6 rounded-xl hover:scale-105 transition-all text-xs uppercase"
              >
                Salvar
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
          <span className="material-symbols-outlined">trending_up</span> Receita de Anúncios (Google Ads)
        </h2>
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
          <div className="size-20 rounded-full bg-gold-primary/10 flex items-center justify-center border border-gold-primary/20 mb-2">
            <span className="material-symbols-outlined text-gold-primary text-4xl">payments</span>
          </div>
          <p className="text-gray-400 text-sm">Ganhos Estimados do Mês</p>
          <h4 className="text-3xl font-black text-gray-900 dark:text-white">$ 1,420.50</h4>
          <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-gold-gradient h-full w-[65%]"></div>
          </div>
          <p className="text-[10px] text-gold-dark uppercase tracking-widest font-bold">+12% em relação ao mês anterior</p>
        </div>
      </section>
    </div>
  );
};
