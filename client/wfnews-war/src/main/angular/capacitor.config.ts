import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.bc.gov.WildfireInformation',
  appName: 'WFNEWS',
  webDir: 'dist/wfnews',
  server: {
    androidScheme: 'https'
  }
};

export default config;
