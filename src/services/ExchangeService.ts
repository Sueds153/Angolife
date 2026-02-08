import { supabase } from '../lib/supabase';
import { ExchangeRate } from '../types';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_RATES: ExchangeRate[] = [
  { currency: 'USD', formal: 918.70, informal: 1280.00, trend: 'up', change: '+2.5%' },
  { currency: 'EUR', formal: 995.30, informal: 1390.00, trend: 'stable', change: '0.0%' }
];

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas

// Validação de taxas para detectar dados incorretos
const isValidRate = (rate: number, currency: string): boolean => {
  if (currency === 'USD' && (rate < 850 || rate > 1000)) {
    console.warn(`[ExchangeService] Taxa suspeita para USD: ${rate}`);
    return false;
  }
  if (currency === 'EUR' && (rate < 950 || rate > 1100)) {
    console.warn(`[ExchangeService] Taxa suspeita para EUR: ${rate}`);
    return false;
  }
  return true;
};

export const ExchangeService = {
  getRates: async (): Promise<ExchangeRate[]> => {
    try {
      // Verificar cache primeiro
      const { value: cacheValue } = await Preferences.get({ key: 'exchange_rates_cache' });
      if (cacheValue) {
        const cached = JSON.parse(cacheValue);
        const cacheAge = Date.now() - new Date(cached.timestamp || 0).getTime();
        if (cacheAge < CACHE_DURATION) {
          console.log(`[ExchangeService] Usando cache (${Math.round(cacheAge / 60000)}min atrás)`);
          return cached.rates;
        }
      }

      // Fonte 1: CurrencyBeacon (5000 req/mês, hourly updates - MAIS PRECISA)
      try {
        const apiKey = import.meta.env.VITE_CURRENCYBEACON_API_KEY;
        if (apiKey) {
          const res = await fetch(`https://api.currencybeacon.com/v1/latest?api_key=${apiKey}&base=USD&symbols=AOA,EUR`);
          const data = await res.json();
          
          if (data.response && data.rates) {
            const usdToAoa = data.rates.AOA;
            const eurRate = data.rates.EUR;
            const eurToAoa = usdToAoa / eurRate;

            if (isValidRate(usdToAoa, 'USD') && isValidRate(eurToAoa, 'EUR')) {
              const rates = await ExchangeService.buildRates(usdToAoa, eurToAoa, 'CurrencyBeacon (bank-grade)');
              await Preferences.set({
                key: 'exchange_rates_cache',
                value: JSON.stringify({ rates, timestamp: new Date().toISOString() })
              });
              console.log('%c[API PRIMARY] CurrencyBeacon ✅ (Hourly)', 'color: #00FF00; font-weight: bold');
              return rates;
            }
          }
        }
      } catch (err) {
        console.warn('[ExchangeService] Falha na API Primary (CurrencyBeacon):', err);
      }

      // Fonte 2: ExchangeRate-API.com (1500 req/mês, daily updates)
      try {
        const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;
        if (apiKey) {
          const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
          const data = await res.json();
          
          if (data.result === 'success') {
            const usdToAoa = data.conversion_rates.AOA;
            const eurRate = data.conversion_rates.EUR;
            const eurToAoa = usdToAoa / eurRate;

            if (isValidRate(usdToAoa, 'USD') && isValidRate(eurToAoa, 'EUR')) {
              const rates = await ExchangeService.buildRates(usdToAoa, eurToAoa, 'ExchangeRate-API.com');
              await Preferences.set({
                key: 'exchange_rates_cache',
                value: JSON.stringify({ rates, timestamp: new Date().toISOString() })
              });
              console.log('%c[API SECONDARY] ExchangeRate-API.com ✅', 'color: green; font-weight: bold');
              return rates;
            }
          }
        }
      } catch (err) {
        console.warn('[ExchangeService] Falha na API Secondary:', err);
      }

      // Fonte 3: Exchangerate.host (ilimitado, backup robusto)
      try {
        const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=AOA,EUR');
        const data = await res.json();
        
        if (data.success && data.rates) {
          const usdToAoa = data.rates.AOA;
          const eurRate = data.rates.EUR;
          const eurToAoa = usdToAoa / eurRate;

          if (isValidRate(usdToAoa, 'USD') && isValidRate(eurToAoa, 'EUR')) {
            const rates = await ExchangeService.buildRates(usdToAoa, eurToAoa, 'Exchangerate.host');
            await Preferences.set({
              key: 'exchange_rates_cache',
              value: JSON.stringify({ rates, timestamp: new Date().toISOString() })
            });
            console.log('%c[API TERTIARY] Exchangerate.host ✅', 'color: orange; font-weight: bold');
            return rates;
          }
        }
      } catch (err) {
        console.warn('[ExchangeService] Falha na API Tertiary:', err);
      }

      // Fonte 4: Open.er-api.com (ilimitado, menos preciso)
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        
        if (data.result === 'success') {
          const usdToAoa = data.rates.AOA || 918;
          const eurRate = data.rates.EUR || 0.92;
          const eurToAoa = usdToAoa / eurRate;

          const rates = await ExchangeService.buildRates(usdToAoa, eurToAoa, 'Open.er-api.com (fallback)');
          await Preferences.set({
            key: 'exchange_rates_cache',
            value: JSON.stringify({ rates, timestamp: new Date().toISOString() })
          });
          console.log('%c[API QUATERNARY] Open.er-api.com ⚠️', 'color: yellow; font-weight: bold');
          return rates;
        }
      } catch (err) {
        console.warn('[ExchangeService] Falha na API Quaternary:', err);
      }

      throw new Error('Todas as APIs falharam');
    } catch (err) {
      console.error('[ExchangeService] Erro crítico:', err);
      
      // Fallback 1: Cache antigo
      try {
        const { value } = await Preferences.get({ key: 'exchange_rates_cache' });
        if (value) {
          console.log('%c[OFFLINE] Usando cache antigo', 'color: red');
          return JSON.parse(value).rates as ExchangeRate[];
        }
      } catch (cacheErr) {
        console.error('[ExchangeService] Cache read error:', cacheErr);
      }

      // Fallback 2: Database
      try {
        const { data: dbData } = await supabase.from('exchange_rates').select('*');
        if (dbData && dbData.length > 0) {
          console.log('%c[RECOVERY] Usando DB', 'color: red');
          return DEFAULT_RATES.map(def => {
            const dbMatch = dbData.find(d => d.currency === def.currency);
            return dbMatch ? { ...def, informal: dbMatch.informal_bid } : def;
          });
        }
      } catch (dbErr) {
        console.error('[ExchangeService] DB recovery failed:', dbErr);
      }

      // Fallback 3: Valores padrão
      console.log('%c[CRITICAL] Usando valores hardcoded', 'color: red; font-weight: bold');
      return DEFAULT_RATES;
    }
  },

  buildRates: async (usdToAoa: number, eurToAoa: number, source: string): Promise<ExchangeRate[]> => {
    // Buscar taxas informais do DB
    const { data: dbData } = await supabase.from('exchange_rates').select('*');
    const informalMap = (dbData || []).reduce((acc: Record<string, number>, curr: { currency: string, informal_bid: number }) => {
      acc[curr.currency] = curr.informal_bid;
      return acc;
    }, {} as Record<string, number>);

    const rates = [
      {
        currency: 'USD',
        formal: Number(usdToAoa.toFixed(2)),
        informal: Number(informalMap['USD'] || Math.round(usdToAoa * 1.40)), // Estimativa: +40%
        trend: 'up' as const,
        change: '+0.15%',
        lastUpdated: new Date().toISOString(),
        source
      },
      {
        currency: 'EUR',
        formal: Number(eurToAoa.toFixed(2)),
        informal: Number(informalMap['EUR'] || Math.round(eurToAoa * 1.40)),
        trend: 'stable' as const,
        change: '0.00%',
        lastUpdated: new Date().toISOString(),
        source
      }
    ];

    console.table(rates.map(r => ({ Moeda: r.currency, Formal: r.formal, Informal: r.informal, Fonte: r.source })));
    return rates;
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
