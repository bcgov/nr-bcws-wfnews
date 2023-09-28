import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.bc.gov.WildfireInformation',
  appName: 'WFNEWS',
  webDir: 'dist/wfnews',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundRunner: {
      label: 'ca.bc.gov.WildfireInformation.background',
      src: 'background/background.js',
      event: 'submitOfflineRoF',
      repeat: true,
      interval: 10,
      autoStart: true,
    }
  }
};

export default config;
