import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { UDID, deviceTag, ensureAndroidHome, isUnlocked } from './test/helpers/adb';

ensureAndroidHome();

const PKG = 'ca.bc.gov.WildfireInformation';
const APK = process.env.WFNEWS_APK || join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const CHROMEDRIVER = process.env.WFNEWS_CHROMEDRIVER || join(__dirname, '.chromedriver', 'chromedriver.exe');

export const config: WebdriverIO.Config = {
  runner: 'local',

  // The Journey suite is not here on purpose. It changes the device network, so it
  // needs its own command and its own Network Profile.
  specs: ['./test/specs/location-permission.e2e.ts', './test/specs/screens.e2e.ts'],
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:udid': UDID,
      'appium:appPackage': PKG,
      'appium:appActivity': '.MainActivity',

      // Must stay false. Appium grants every permission when this is true, the
      // Android dialog never appears, and every permission test passes for nothing.
      'appium:autoGrantPermissions': false,

      // Keep the installed build and manage state in the specs.
      'appium:noReset': true,
      ...(process.env.WFNEWS_INSTALL === '1' && existsSync(APK) ? { 'appium:app': APK } : {}),

      // The WebView on an old device is old, and the NRS network blocks the
      // autodownload. A pinned chromedriver wins when one is present.
      ...(existsSync(CHROMEDRIVER)
        ? { 'appium:chromedriverExecutable': CHROMEDRIVER }
        : { 'appium:chromedriverAutodownload': true }),
      'appium:showChromedriverLog': true,

      'appium:newCommandTimeout': 300,
      'appium:uiautomator2ServerLaunchTimeout': 120000,
      'appium:adbExecTimeout': 120000,
    },
  ],

  services: [
    [
      'appium',
      {
        args: {
          // chromedriver autodownload and adb shell are both gated features.
          allowInsecure: ['*:chromedriver_autodownload', '*:adb_shell'],
          log: './logs/appium.log',
        },
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],
  // The app needs minutes to draw on a 2016 device, so a short timeout only hides the
  // defect. The Report of Fire walk has 16 pages, and each one carries its own budget
  // on the `2g` Network Profile.
  mochaOpts: { ui: 'bdd', timeout: 1_800_000 },

  logLevel: 'warn',
  waitforTimeout: 30_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  outputDir: './logs',

  onPrepare() {
    if (!isUnlocked()) {
      throw new Error(
        'The device is locked. Android keeps app data encrypted until the first unlock, so no test can run. Unlock the device and try again.',
      );
    }
    process.env.WFNEWS_SHOT_DIR = join(__dirname, 'screenshots', deviceTag());
    mkdirSync(process.env.WFNEWS_SHOT_DIR, { recursive: true });
    console.log(`Device ${UDID}. Screenshots go to ${process.env.WFNEWS_SHOT_DIR}`);
  },
};
