# WFNEWS device tests

WebdriverIO with Appium. It drives the WFNEWS app on a real Android device or on
an emulator.

**Why Appium, and not Playwright or Cypress.** Android draws the location
permission dialog, not the WebView. A tool that lives inside the page cannot see
that dialog and cannot tap it. Appium works in two contexts: `NATIVE_APP` for
the Android dialog, and `WEBVIEW_ca.bc.gov.WildfireInformation` for the Angular
DOM.

These tests hold the findings in
[PIXEL_XL_FINDINGS_STE.md](../../../../../PIXEL_XL_FINDINGS_STE.md), so that a
correction does not come back later.

---

## Run the tests

The device must be **unlocked**. Android keeps app data encrypted until the
first unlock after a restart, so no test can run before that.

```bash
cd client/wfnews-war/src/main/angular/e2e
npm install
npm test                      # everything
npm run test:permissions      # the location permission tests only
npm run test:screens          # go to each screen and take a screenshot
```

The app must already be installed. To build and install it, see section 6 of
[CONTEXT.md](../../../../../CONTEXT.md).

| Environment variable | Meaning |
|---|---|
| `WFNEWS_UDID` | The device serial. Needed only when more than one device is attached. |
| `ANDROID_HOME` | The Android SDK. The suite finds the default Windows location on its own. |
| `ADB` | A full path to `adb`, if it is not in the SDK. |
| `WFNEWS_APK` | An APK to install at the start of the session. |
| `WFNEWS_INSTALL` | Set it to `1` to install `WFNEWS_APK` first. |

---

## What each file does

| File | What it holds |
|---|---|
| `wdio.conf.ts` | The capabilities and the Appium server settings |
| `test/specs/location-permission.e2e.ts` | T1 to T6 of the findings file |
| `test/specs/screens.e2e.ts` | One named screenshot for each screen |
| `test/helpers/adb.ts` | Device state that Appium does not control, such as the Location setting |
| `test/helpers/app.ts` | The context switch, the permission changes and the app restart |
| `test/helpers/permission-dialog.ts` | The Android dialog, across Android releases |

---

## Two traps

### `autoGrantPermissions` must stay `false`

Appium gives the app every permission when this capability is `true`. Then the
Android dialog never comes up, each permission test passes, and each one proves
nothing. This is the usual way to get a permission suite that tests nothing.

### The chromedriver must agree with the WebView

A test that reads the Angular DOM needs a chromedriver that agrees with the
WebView on the device. **The automatic download does not work here.** Appium
reports:

```
No Chromedriver found that can automate Chrome '151.0.7922'
```

So the suite uses a chromedriver in `.chromedriver/` when one is present, and
only then falls back to the automatic download. That directory is not committed.

To get the correct one, first read the WebView version on the device:

```bash
adb shell dumpsys webviewupdate | grep "Current WebView package"
# Current WebView package (name, version): (com.google.android.webview, 151.0.7922.84)
```

Then take the newest chromedriver with the same **major** version. An exact
match is not published for every WebView build. For 151:

```bash
curl -s https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_151
# 151.0.7922.138
curl -Lo cd.zip https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.138/win64/chromedriver-win64.zip
unzip -j cd.zip chromedriver-win64/chromedriver.exe -d .chromedriver
```

Or set `WFNEWS_CHROMEDRIVER` to a path of your own.

If the network blocks the download, the permission tests still operate. They are
native, and they do not enter the WebView.

---

## Screenshots

The suite writes to `screenshots/<model>-<size>-<density>dpi/`. **The folder name
holds the device on purpose.** A screenshot from a Pixel XL at 1440x2560 must
never be compared against an emulator image.

There is no baseline comparison yet. That is a decision, and not an omission: a
baseline made now would hold a screen that is already wrong. Add
`@wdio/visual-service` after the defects in the findings file are corrected.

---

## Prove that the suite can fail

A green suite that tests nothing is worse than no suite. To prove that the tests
work, comment out the `tap('deny')` line in T2 and run it again. The test must
go red.
