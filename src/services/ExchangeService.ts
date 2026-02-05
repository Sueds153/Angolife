import { supabase } from '../lib/supabase';
import { ExchangeRate } from '../types';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_RATES: ExchangeRate[] = [
  { currency: 'USD', formal: 890.50, informal: 1250.00, trend: 'up', change: '+2.5%' },
  { currency: 'EUR', formal: 965.20, informal: 1340.00, trend: 'stable', change: '0.0%' }
];

export const ExchangeService = {
  getRates: async (): Promise<ExchangeRate[]> => {
    try {
      // 1. Fetch Official Rates (USD based)
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const apiData = await response.json();
      
      if (apiData.result !== 'success') throw new Error('API results failure');

      const usdToAoaOfficial = apiData.rates.AOA || 830; // Fallback to BNA rough value
      const eurToUsd = apiData.rates.EUR || 0.92;
      const eurToAoaOfficial = usdToAoaOfficial / eurToUsd;

      // 2. Fetch Informal Rates from DB
      const { data: dbData, error: dbError } = await supabase
        .from('exchange_rates')
        .select('*');

      if (dbError) throw dbError;

      const informalRatesMap = (dbData || []).reduce((acc: Record<string, number>, curr: { currency: string, informal_bid: number }) => {
        acc[curr.currency] = curr.informal_bid;
        return acc;
      }, {});

      // 3. Construct Final Object
      const rates = [
        {
          currency: 'USD',
          formal: Number(usdToAoaOfficial.toFixed(2)),
          informal: Number(informalRatesMap['USD'] || 1250),
          trend: 'up' as const,
          change: '+0.15%',
          lastUpdated: new Date().toISOString(),
          source: 'https://open.er-api.com/v6/latest/USD'
        },
        {
          currency: 'EUR',
          formal: Number(eurToAoaOfficial.toFixed(2)),
          informal: Number(informalRatesMap['EUR'] || 1340),
          trend: 'stable' as const,
          change: '0.00%',
          lastUpdated: new Date().toISOString(),
          source: 'https://open.er-api.com/v6/latest/USD'
        }
      ];

      console.log('%c[AUDITORIA DE DADOS] Conexão Real Estabelecida', 'color: #D4AF37; font-weight: bold;');
      console.table(rates.map(r => ({ Moeda: r.currency, Formal: r.formal, Fonte: r.source })));

      // Save to cache for offline mode
      await Preferences.set({
        key: 'exchange_rates_cache',
        value: JSON.stringify(rates)
      });

      return rates;
    } catch (err) {
      console.error('Exchange error:', err);
      
      // Try to load from cache if offline
      const { value } = await Preferences.get({ key: 'exchange_rates_cache' });
      if (value) {
        console.log('[OFFLINE] Carregando taxas do cache local');
        return JSON.parse(value);
      }

      return DEFAULT_RATES;
    }
  },

  updateInformalRate: async (currency: string, newRate: number): Promise<ExchangeRate[]> => {
    const { error } = await supabase
      .from('exchange_rates')
      .upsert({ currency, informal_bid: newRate }, { onConflict: 'currency' });

    if (error) {
      console.error('Error updating rate:', error);
    }

    return ExchangeService.getRates();
  }
};
