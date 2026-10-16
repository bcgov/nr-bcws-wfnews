import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ca.bc.gov.WildfireInformation",
  appName: "BC Wildfire",
  webDir: "dist/wfnews",
  server: {
    androidScheme: "https",
  },
  ios: {
    appendUserAgent: ' bc-wildfire-ios'
  },
  android: {
    appendUserAgent: ' bc-wildfire-android'
  }
};

export default config;
