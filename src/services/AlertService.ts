
export const AlertService = {
  saveAlert: (alert: { currency: string; threshold: number; type: string }) => {
    console.log('Alert saved:', alert);
    // TODO: Implement persistence (LocalStorage or Supabase)
    const existing = JSON.parse(localStorage.getItem('angolife_alerts') || '[]');
    existing.push(alert);
    localStorage.setItem('angolife_alerts', JSON.stringify(existing));
  },

  getAlerts: () => {
    return JSON.parse(localStorage.getItem('angolife_alerts') || '[]');
  },

  clearAlerts: () => {
    localStorage.removeItem('angolife_alerts');
  }
};