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
      label: 'wfnews.background.task',
      src: 'src/background.js',
      event: 'submitOfflineRoF',
      repeat: true,
      interval: 600,
      autoStart: true,
    }
  }
};

export default config;
