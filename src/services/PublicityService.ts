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

  // Check if an interstitial should be shown (e.g. based on frequency capping)
  shouldShowInterstitial: (): boolean => {
    // Simple logic: 30% chance for demo purposes, or check a timestamp in localStorage
    const lastShown = localStorage.getItem('last_interstitial');
    if (lastShown) {
      const diff = Date.now() - parseInt(lastShown);
      if (diff < 1000 * 60 * 5) return false; // Cooldown 5 mins
    }
    return Math.random() < 0.3; // 30% chance navigate
  },

  recordInterstitialShown: () => {
    localStorage.setItem('last_interstitial', Date.now().toString());
  }
};
