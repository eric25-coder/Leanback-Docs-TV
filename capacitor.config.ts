import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.erico.leanbackdocstv',
  appName: 'Leanback Docs TV',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
