import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'wfnews.nrs.gov.bc.ca',
  appName: 'Wildfire News',
  webDir: 'dist/wfnews',
  server: {
    androidScheme: 'https'
  }
};

export default config;
