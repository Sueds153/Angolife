import { supabase } from '../lib/supabase';
import { ExchangeRate } from '../types';

const DEFAULT_RATES: ExchangeRate[] = [
  { currency: 'USD', formal: 890.50, informal: 1250.00, trend: 'up', change: '+2.5%' },
  { currency: 'EUR', formal: 965.20, informal: 1340.00, trend: 'stable', change: '0.0%' }
];

export const ExchangeService = {
  getRates: async (): Promise<ExchangeRate[]> => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*');

    if (error || !data || data.length === 0) {
      console.warn('Using default rates due to DB error or empty table');
      return DEFAULT_RATES;
    }

    // Map DB to Frontend. DB has 'informal_bid', Frontend needs 'informal'
    // For 'formal', we might need to fetch from external API or store it too.
    // For demo, we assume 'formal' is constant or fetched elsewhere, OR we store it in DB (but schema showed informal_bid).
    // Let's assume we maintain structure.
    // Let's use informal_bid as informal.
    return data.map((r: { currency: string, informal_bid: number }) => ({
      currency: r.currency,
      formal: 900.00, // Hardcoded or fetched from another source as DB only has informal_bid in schema shown? 
      // Wait, schema showed: id, currency, informal_bid. 
      // Let's use informal_bid as informal.
      informal: Number(r.informal_bid),
      trend: 'stable', // DB doesn't track trend yet
      change: '0.0%'
    }));
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
