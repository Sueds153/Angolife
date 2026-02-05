import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.angolife.app',
    appName: 'AngoLife',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        cleartext: true,
        allowNavigation: [
            'open.er-api.com',
            '*.supabase.co'
        ]
    }
};

export default config;
