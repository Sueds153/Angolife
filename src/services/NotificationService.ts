import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    try {
      const pushPerm = await PushNotifications.requestPermissions();
      const localPerm = await LocalNotifications.requestPermissions();
      return pushPerm.display === 'granted' && localPerm.display === 'granted';
    } catch (err) {
      console.error('Error requesting notification permissions:', err);
      return false;
    }
  },

  sendNotification: async (title: string, body?: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body: body || '',
            id: Math.floor(Math.random() * 10000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: [],
            extra: null
          }
        ]
      });
    } catch (err) {
      console.error('Error sending local notification:', err);
    }
  },

  registerPush: async () => {
    await PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    await PushNotifications.register();
  }
};
