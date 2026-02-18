
export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  sendNativeNotification: (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // Cast options to any to avoid TS error: 'vibrate' does not exist in type 'NotificationOptions'
      const options: any = {
        body,
        icon: '/favicon.ico', // Fallback icon
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
      };
      new Notification(title, options);
    }
  },

  checkPermission: (): NotificationPermission => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  }
};
