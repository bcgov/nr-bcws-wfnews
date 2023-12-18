import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ca.bc.gov.WildfireInformation",
  appName: "BC Wildfire",
  webDir: "dist/wfnews",
  server: {
    androidScheme: "https",
  },
};

export default config;
