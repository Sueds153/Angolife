import { supabase } from '../lib/supabase';
import { AdSpot } from '../types';

export const PublicityService = {
  // Fetch an active ad for a specific location (banner, sidebar, etc)
  fetchActiveAd: async (location: string): Promise<AdSpot | null> => {
    // In a real scenario, we might want to rotate ads randomly
    // For now, we fetch the first active one for the location
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('active', true)
      .eq('location', location)
      .limit(1);

    if (error) {
      console.error('Error fetching ad:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const ad = data[0];
    return {
      id: ad.id,
      title: 'Sponsored', // Default title or add column
      description: '',
      image: ad.image,
      cta: ad.link || '#'
    };
  },

  trackClick: async (id: string) => {
    // Increment logs
    await supabase.rpc('increment_ad_click', { ad_id: id });
  },

  // --- FREQUENCY CAPPING LOGIC ---

  // Interstitials: 1 every 2-3 mins, max 3-4 per session
  shouldShowInterstitial: (): boolean => {
    const sessionCount = parseInt(sessionStorage.getItem('ad_session_interstitial_count') || '0');
    if (sessionCount >= 4) return false; // Max 4 per session

    const lastShown = localStorage.getItem('last_interstitial_time');
    if (lastShown) {
      const diff = Date.now() - parseInt(lastShown);
      const interval = 1000 * 60 * 2.5; // 2.5 minutes average
      if (diff < interval) return false;
    }

    return true;
  },

  recordInterstitialShown: () => {
    localStorage.setItem('last_interstitial_time', Date.now().toString());
    const sessionCount = parseInt(sessionStorage.getItem('ad_session_interstitial_count') || '0');
    sessionStorage.setItem('ad_session_interstitial_count', (sessionCount + 1).toString());
  },

  // Rewarded: Max 4/day, interval min 9 mins
  canShowRewarded: (): { can: boolean; reason?: string } => {
    const today = new Date().toDateString();
    const dailyData = JSON.parse(localStorage.getItem('ad_rewarded_daily_limit') || '{"date": "", "count": 0}');
    
    if (dailyData.date === today && dailyData.count >= 4) {
      return { can: false, reason: 'Limite diário de recompensas atingido (4/dia).' };
    }

    const lastShown = localStorage.getItem('last_rewarded_time');
    if (lastShown) {
      const diff = Date.now() - parseInt(lastShown);
      const minInterval = 1000 * 60 * 9; // 9 minutes
      if (diff < minInterval) {
        const remaining = Math.ceil((minInterval - diff) / 1000 / 60);
        return { can: false, reason: `Próxima recompensa disponível em ${remaining} min.` };
      }
    }

    return { can: true };
  },

  recordRewardedShown: () => {
    localStorage.setItem('last_rewarded_time', Date.now().toString());
    
    const today = new Date().toDateString();
    let dailyData = JSON.parse(localStorage.getItem('ad_rewarded_daily_limit') || '{"date": "", "count": 0}');
    
    if (dailyData.date !== today) {
      dailyData = { date: today, count: 1 };
    } else {
      dailyData.count += 1;
    }
    
    localStorage.setItem('ad_rewarded_daily_limit', JSON.stringify(dailyData));
  }
};
