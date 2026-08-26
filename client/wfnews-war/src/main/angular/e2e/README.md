# WFNEWS device tests

WebdriverIO with Appium. It drives the WFNEWS app on a real Android device or on
an emulator.

**Why Appium, and not Playwright or Cypress.** Android draws the location
permission dialog, not the WebView. A tool that lives inside the page cannot see
that dialog and cannot tap it. Appium works in two contexts: `NATIVE_APP` for
the Android dialog, and `WEBVIEW_ca.bc.gov.WildfireInformation` for the Angular
DOM.

These tests hold the design in
[LOCATION_AND_STARTUP_PLAN_STE.md](../../../../../LOCATION_AND_STARTUP_PLAN_STE.md),
so that a correction does not come back later. The defects they guard were
measured in
[PIXEL_XL_FINDINGS_STE.md](../../../../../PIXEL_XL_FINDINGS_STE.md).

| Test | What it holds |
|---|---|
| T1 | Nothing asks for the location at start |
| T9 | A banner screen shows a banner and never prompts |
| T10 | The map is quiet until the user taps find-me |
| T3 | A denied user is given a route to the settings |
| T4 | The position request ends when location services are off |
| T11 | Report of Fire prompts, and then uses the position |
| T6 | Approximate location only. Skipped below Android 12. |

There is a second suite. It drives the **Journeys** against a **Network Profile**
and writes a findings file. See "The Journeys" below.

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

## The Journeys

A **Journey** is one repeatable user workflow, from a **Cold start** to a result.
A **Network Profile** is one named set of network conditions. A **Network Run**
is every **Journey** against one **Network Profile**.

```bash
npm run test:network:all             # every profile, then the report
node scripts/run-network.mjs 3g 2g   # only these profiles
WFNEWS_NET_PROFILE=2g npm run test:network   # one profile, by hand
npm run report:network               # make the report again from the last numbers
```

The report goes to [NETWORK_FINDINGS_STE.md](../../../../../NETWORK_FINDINGS_STE.md).
A program writes it. Do not edit it by hand.

| Journey | What it does |
|---|---|
| `cold-start` | A **Cold start** to the landing screen |
| `map` | Opens the **Active Wildfire Map** and waits for the tiles |
| `list-to-incident` | Opens the wildfires list, then one **Public Incident Page** |
| `saved-location` | Reads the **Saved Locations**, then searches the **Gazetteer** |
| `report-of-fire` | Walks every page of the **Report of Fire** flow, and offline also submits |

| Network Profile | What it is |
|---|---|
| `wifi` | No limit. This is the **Baseline**. |
| `lte` | 4 Mbit/s down, 80 ms |
| `3g` | 1.6 Mbit/s down, 300 ms |
| `slow-3g` | 400 kbit/s down, 800 ms |
| `2g` | 240 kbit/s down, 1200 ms |
| `lossy` | Fast 3G, and 1 connection in 5 dies in the middle |
| `offline` | The Wi-Fi is off |

| Environment variable | Meaning |
|---|---|
| `WFNEWS_NET_PROFILE` | The **Network Profile** for one run. The default is `wifi`. |
| `WFNEWS_NET_REPEATS` | How many times to run each **Journey**. The default is 1. The report takes the median. |
| `WFNEWS_PROXY_PORT` | The port of the **Throttle Proxy**. The default is 8888. |
| `WFNEWS_NET_KEEP` | Set it to `1` to add to the last numbers instead of removing them. |
| `WFNEWS_NET_ONLY` | One **Journey** name, to run only that one. |
| `WFNEWS_ROF_SUBMIT` | `1` or `0`. It overrides the submit rule below. |

### What the proxy covers, and what it does not

The device sends its traffic to `127.0.0.1:8888`. `adb reverse` carries that port
to the workstation over USB. So the proxy needs no LAN address and no firewall
rule, and it does not read the traffic: HTTPS stays a `CONNECT` tunnel, and no
certificate is needed.

**The proxy covers the Payload only. `CapacitorHttp` ignores the Android system
proxy.** This was measured on the device: with the device proxy pointed at a port
where nothing was listening, an Angular `HttpClient` read failed and a
`CapacitorHttp` read still returned 200.

So these three services are **not shaped and not counted** by any
**Network Profile** except `offline`:

- `notification.service.ts` — the **Saved Location** reads
- `wf-map.service.ts` — the **Active Wildfire Map**
- `common-utility.service.ts`

`offline` is the exception because it turns the Wi-Fi off, which stops every
path.

**To measure the DEX code path there are two ways.** Use the `offline` profile,
or use the diagnostics screen in the app: ten taps on the version label on the
More screen, then "Run the native test". That screen measures natively, so it
sees the path that `CapacitorHttp` uses. A workstation proxy cannot.

An earlier version of this file said the proxy covered both paths. It does not.

### These tests do not go red for a slow screen

This is a measurement suite, like `screens.e2e.ts`. A slow screen is the
measurement, not a fault of the suite. A red run would stop the **Network Run**
and lose the other **Network Profiles**. A test goes red only when the harness
is broken: no session, no WebView, or a device that will not take the
**Network Profile**.

### The Journeys stop before a write, with one exception

`saved-location` searches the **Gazetteer**, and it does not save. A save makes a
real **Saved Location** row, and this suite runs many times.

`report-of-fire` submits on the `offline` **Network Profile**, and on no other.
**The Report of Fire flow must work with no network, and the submit is the last
page of it.** Offline the report is kept on the device and nothing is sent, so
the walk reads it back out of Ionic Storage to prove that the offline path ran,
and then clears the app data **while the Wi-Fi is still off**. A stored report
syncs by itself when the network returns, so the order is not a detail.

With a network the submit is off, because it would make a real
**Report of Fire**. `WFNEWS_ROF_SUBMIT=1` turns it on, and `0` turns it off.

The callback question is answered "No", so the flow never opens the contact page.
A test must not put a person's name and telephone number into a report.

---

## What each file does

| File | What it holds |
|---|---|
| `wdio.conf.ts` | The capabilities and the Appium server settings |
| `test/specs/location-permission.e2e.ts` | The banner-or-prompt rule, and the states behind it |
| `test/specs/screens.e2e.ts` | One named screenshot for each screen |
| `test/helpers/adb.ts` | Device state that Appium does not control, such as the Location setting |
| `test/helpers/app.ts` | The context switch, the permission changes and the app restart |
| `test/helpers/permission-dialog.ts` | The Android dialog, across Android releases |
| `test/specs/network-journeys.e2e.ts` | The **Journeys**, against one **Network Profile** |
| `test/helpers/network.ts` | The **Network Profiles**, and the device wiring |
| `test/helpers/throttle-proxy.ts` | The **Throttle Proxy** |
| `test/helpers/journey.ts` | The **Journey** measurement and the JSON record |
| `test/helpers/rof.ts` | Reads one **Report of Fire** page, answers it, and reads the stored report |
| `scripts/run-network.mjs` | One **Network Run** for each **Network Profile** |
| `scripts/network-report.mjs` | Makes `NETWORK_FINDINGS_STE.md` from the records |

---

## Three traps

### A dead proxy leaves the phone with no network

The device proxy setting stays after the test program stops. If the
**Throttle Proxy** is not running, the phone points at a program that is not
there, and then nothing on it reaches the network. The suite removes the setting
on exit, and also on Ctrl-C. If a run dies in a way that no handler catches, put
it back by hand:

```bash
adb shell settings put global http_proxy :0
adb shell settings delete global http_proxy
adb reverse --remove-all
adb shell svc wifi enable
```

The `offline` **Network Profile** removes the proxy **before** it turns the Wi-Fi
off, and the order is not a detail. `adb reverse` works over USB. A device with
the Wi-Fi off and the proxy still set would keep a working network, and the
offline test would pass and prove nothing.

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
work, comment out the `tap('deny')` line in T11 and run it again. The test must
go red.

For the **Journeys**, comment out the `captureLocationOffline()` call in
`rof-complex-question-page.component.ts`, build, and run the `offline`
**Network Profile**. The report must then say that the stored **Report of Fire**
holds `[0, 0]`.
