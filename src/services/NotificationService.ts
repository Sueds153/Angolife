import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    const pushPerm = await (PushNotifications as any).requestPermissions();
    const localPerm = await (LocalNotifications as any).requestPermissions();
    return pushPerm.display === 'granted' && localPerm.display === 'granted';
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
    await PushNotifications.addListener('registration', (token: { value: string }) => {
      console.log('Push registration success, token: ' + token.value);
    });

    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    await PushNotifications.register();
  }
};
