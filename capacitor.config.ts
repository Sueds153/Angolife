import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.angolife.app',
    appName: 'AngoLife',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'https'
    }
};

export default config;
