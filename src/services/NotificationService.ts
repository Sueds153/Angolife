import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

interface PermissionStatus {
  display?: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  receive?: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    try {
      const pushPerm = await PushNotifications.requestPermissions() as PermissionStatus;
      const localPerm = await LocalNotifications.requestPermissions() as PermissionStatus;
      
      const isPushGranted = pushPerm.display === 'granted' || pushPerm.receive === 'granted';
      const isLocalGranted = localPerm.display === 'granted';
      
      return !!(isPushGranted && isLocalGranted);
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
    try {
      // 1. Verificar se temos permissão
      const perm = await PushNotifications.checkPermissions();
      if (perm.receive !== 'granted') {
        const req = await PushNotifications.requestPermissions();
        if (req.receive !== 'granted') return;
      }

      // 2. Adicionar Listeners de forma limpa
      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration:', error.error);
      });

      // 3. Registrar de fato no APNS/FCM
      await PushNotifications.register();
    } catch (err) {
      console.error('Error registering push notifications:', err);
    }
  }
};
