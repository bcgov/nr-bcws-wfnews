# BC Permanent Pacific Time (PCT, UTC-7): Impact Report for nr-bcws-wfnews

| | |
|---|---|
| **Prepared** | 2026-09-23 |
| **Repo state** | [bcgov/nr-bcws-wfnews](https://github.com/bcgov/nr-bcws-wfnews) `main` @ `cf8a31c` (2026-09-22) |
| **Deadline** | **Sunday 2026-11-01, 02:00 local (09:00 UTC)** |
| **Bottom line** | **The risk is much lower than in bcws-wfhr.** No zone is hard-coded to `America/Los_Angeles` or PST/PDT. The servers, database and Lambdas run in **UTC**. The ArcGIS layers store dates in UTC, and the weather code already pins its source offset. **Nothing on the server side fails on Nov 1.** The exposure is on the **public-facing side**: every time shown to the public is rendered with the viewer's browser or phone timezone data. That creates **two risks**: (1) stale devices will show times **one hour early**, labelled "PST"; (2) up-to-date devices will label BC times **"MST" or "GMT-7", not "PCT"**. |

---

## 1. What changed (same basis as the bcws-wfhr report)

- **Government rule.** BC stopped changing clocks after 2026-03-08. On **2026-11-01 clocks do not fall back.** BC stays on **UTC-7** all year, named *Pacific time (PCT)*. ([gov.bc.ca](https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time))
- **IANA tzdata 2026b** (2026-04-22) models `America/Vancouver` as permanent UTC-7 from 2026-11-01 02:00. The abbreviation is **`MST`**, not `PCT`, and may change in a later release. `America/Los_Angeles` keeps PST/PDT. ([tzdb NEWS](https://data.iana.org/time-zones/tzdb/NEWS))
- **Minimum versions with the rule:**

  | Runtime | Minimum version |
  |---|---|
  | JDK 21 | **21.0.12** |
  | JDK 8 | 8u501 |
  | PostgreSQL 15 | **15.18** (2026-05-14) |
  | Browsers and OS | any build carrying tzdata/ICU 2026b or later |

  **tzdata 2026a is not enough.**

**Demonstration of the device risk.** Node 22.22 in this session bundles tz **2025c**. It formats `2026-12-01T20:00Z` in `America/Vancouver` as **"12:00 p.m. PST"**. The correct value is **1:00 p.m. (UTC-7)**. Any browser, WebView or test runner with pre-2026b data will do the same.

---

## 2. Summary of findings

| # | Area | Severity | Fails on Nov 1? | Owner |
|---|---|---|---|---|
| N1 | Public time display depends entirely on the viewer's device tz data (web, iOS/Android WebView) | **High** (public safety info) | **Yes, on un-updated devices** | Client and comms |
| N2 | Zone label after Nov 1 will be "MST" / "GMT-7" (not "PCT") in `timeZoneName: 'short'` formatters | **Medium** (public confusion) | Yes, on updated devices | Client, product and comms |
| N3 | Weather hourstamps pinned to fixed UTC-8 (`GMT-8` in Java, `-8*60` in TS) | Low (correct) | No, **if upstream stays on LST** | Confirm with BCWS Predictive Services |
| N4 | Tomcat images `tomcat:10.1-jdk21` (floating tag). Legacy `openjdk18-openshift` and `jdk8u252` images | Low | No (JVMs run in UTC) | DevOps |
| N5 | RDS PostgreSQL 15: version set via GitHub variable `DB_POSTGRES_VERSION` (not visible in repo) | Low | No (UTC sessions, no tz-aware SQL) | DevOps |
| N6 | Implicit JVM default zone (Report of Fire timestamps, `QueryResource`, `toSimpleFormatDate`) | Low (latent) | No, **unless someone sets `TZ`** | Backend |
| N7 | Lambdas (Python 3.9 / Node 18) and ArcGIS Online queries | None | No (all GMT/UTC) | n/a |
| N8 | Pre-existing: `DEFAULT current_date` on `timestamp` audit columns | Low (unrelated) | No | Backend |

---

## 3. Areas of failure

### N1. Public-facing times rely on the viewer's device: HIGH

The API returns `java.util.Date` values (instants). The Angular/Ionic client formats them with the browser's local zone, and **no zone is pinned anywhere in the client**. Examples:

| File | Use |
|---|---|
| `src/app/utils/index.ts:611-633` | `convertToDateTimeTimeZone()`: "July 19, 2022 at 10:22 a.m. PST/PDT" style. Used for evacuation, ban and restriction "issued/updated" text |
| `src/app/utils/index.ts:644`, `:810` | time-only and date-only helpers |
| `src/app/services/wfnews-map.service/util.ts:109-129` | map popups (`timeZone: undefined`, `timeZoneName: 'short'`) |
| `public-incident-page.component.ts:78`, `incident-info-panel.component.ts:209,252,272`, `draggable-panel.component.ts:724`, `saved.component.ts:332`, dashboard widgets | `toLocale*String()` on incident dates |
| `src/app/utils/weather-time.ts` | weather hourstamps converted to the viewer's zone (`viewerTimeZone()`, line 36) |

(Paths are relative to `client/wfnews-war/src/main/angular/`.)

**Failure mode:** From Nov 1, a device without tzdata 2026b (older phones, unmanaged PCs, kiosk browsers, or old Android WebViews in the Capacitor app) shows **every time one hour earlier, labelled "PST"**. For example, an evacuation order issued at 3:00 p.m. PCT would display as "2:00 p.m. PST". Up-to-date devices are correct. Nothing in the repo can fix the device's own data. It is also a user-trust issue, because two people can see different times for the same order.

**Resolution options (a product decision):**

1. **Keep viewer-local rendering and do nothing in code.** Correct for updated devices. Pair it with a public notice ("Times are shown in your device's time zone") and the platform update guidance BC Gov is issuing.
2. **Pin authoritative BC times to BC.** For incident, evacuation and ban timestamps, format with `timeZone: 'America/Vancouver'` so every viewer (including out-of-province viewers) sees BC time. Stale devices still carry the old rule, so this doesn't fully fix the stale-device problem. For a *guaranteed* UTC-7 label, format with a fixed offset (`timeZone: 'Etc/GMT+7'` or `'-07:00'`) plus a literal "PT"/"PCT" suffix. That is safe **only because BC now has no DST**. Document it as intentional.
3. A mix: BC-pinned for official notices (order issued, stage of control) and viewer-local for "last updated X minutes ago".

**Recommendation:** Option 3. Centralize everything in `utils/index.ts` (a single `formatBcTime()`), and replace the scattered `toLocale*String()` calls. The existing `weather-time.ts` already takes an explicit `timeZone` parameter, so it can adopt the same helper.

### N2. The zone label won't say "PCT": MEDIUM

`timeZoneName: 'short'` asks the browser's CLDR/ICU for an abbreviation. After Nov 1, tzdb labels BC as `MST`. What browsers show depends on their CLDR version. Today, Yukon (also permanent UTC-7) renders as **"GMT-7"** in `en-CA` in this session's Node. BC times will likely show **"GMT-7" or "MST"**. "MST" is especially confusing on a BC wildfire site, because Peace River and Kootenay communities really are on Mountain time.

**Affected:**

- **User-visible labels:** `convertToDateTimeTimeZone()` (index.ts:620), the map `TIME_FORMAT` (util.ts:120), and `formatWeatherTimeOfDay`/`formatWeatherHour` in `weather-time.ts` (which document "PDT"/"PST" suffixes at lines 128, 158, 175, 225).
- **Copy with "PST" baked in:** Storybook stories (`evacuations-card.stories.ts:39,63,124`, `event-info.stories.ts:46`). These are demo only.

**Resolution:** Agree the public label with BCWS communications. The government uses "Pacific time (PCT)". Then render the time with `timeZoneName` omitted and append the agreed literal (for BC-pinned times), or map `America/Vancouver` + UTC-7 → "PT". **Add a unit test that pins `America/Vancouver` for a date after 2026-11-01** and asserts both the offset (UTC-7) and the label. It will also catch a stale Chrome in CI (see §4).

---

## 4. Areas of concern

### N3. Weather hourstamps: fixed UTC-8 source offset (correct, but confirm upstream)

- `server/wfss-pointid-api/.../weather/util/WeatherHour.java:32` and `WeatherDay.java:33` use `TimeZone.getTimeZone("GMT-8")`. The class comment says "always in Pacific Standard Time".
- `client/.../utils/weather-time.ts:17` sets `SOURCE_OFFSET_MINUTES = -8 * 60`, with an explicit comment not to change it when BC changes DST rules. `weather-time.spec.ts:56-62` already tests a post-change date (2030).

This is **correct and unaffected by tzdata**, as long as the Wildfire Weather database (PointID source) keeps recording in **Local Standard Time = UTC-8**. That is the fire-weather observation convention. It follows two things:

- The daily "noon LST" observation will display as **1:00 p.m. PCT all year**, instead of alternating between noon in winter and 1 p.m. in summer. Expect questions. The explanatory copy may need an update.
- **Action:** Get written confirmation from BCWS Predictive Services / WFWX that station hourstamps stay at UTC-8 after Nov 1 and are not re-based to UTC-7. If they re-base, change both constants at the same time, and branch by date so historical hourstamps keep UTC-8.

### N4. Container images and JVMs

- `tomcat:10.1-jdk21` (7 Dockerfiles: root, `client/`, `Dockerfile_client`, and the 4 server APIs) is a floating tag. GitHub-hosted builds pull it fresh, so any image built after the July 2026 JDK update gets 21.0.12+ with 2026b. **No ECS task sets `TZ`**, and no JVM sets `-Duser.timezone`, so all JVMs run in **UTC** and the BC rule doesn't affect server behaviour.
- **Action (hygiene):** Before Nov 1, rebuild and redeploy long-running images built before July 2026. Consider pinning a digest or a specific `10.1.x-jdk21-temurin` tag so builds are reproducible.
- `server/*/docker/base-openjdk18-openshift/Dockerfile` (3 files, legacy OpenShift, Java 8 era) and `performance-qa/Dockerfile` (`adoptopenjdk/openjdk8:jdk8u252`, 2020) are old. If they are still in use, they need replacing for tzdata and security reasons. Otherwise, delete them.
- **Do not introduce `TZ=America/Los_Angeles`** (the pattern that breaks bcws-wfhr). If a local zone is ever needed, use `America/Vancouver`, and only on a JDK with 2026b or later.

### N5. RDS PostgreSQL 15

`terraform/rds.tf` uses a `postgres15` parameter group with no `timezone` override (server = UTC). `engine_version` comes from `vars.DB_POSTGRES_VERSION` (`.github/workflows/terragrunt.yml:97`), so the version isn't visible in the repo. The SQL uses `now()`, `CURRENT_TIMESTAMP` and `INTERVAL 'N HOURS'` windows (`PublishedIncidentMapper.xml:371,467`, `StatisticsMapper.xml` "newFires24Hours" / "outFires7Days", `RoFFormMapper.xml:43,49,78`). These are pure instant arithmetic in a UTC session, with no `AT TIME ZONE` and no `timestamptz`, so **they are unaffected**.

**Action:** Check `DB_POSTGRES_VERSION` is **≥ 15.18** at the next maintenance window. That's for correctness if anyone later adds `AT TIME ZONE 'America/Vancouver'`, and PG 15 minors also carry security fixes.

### N6. Implicit default-zone code (latent)

These are correct while the JVM stays in UTC. They would silently shift if someone set a container `TZ`:

- `wfone-notifications-api/.../RecordServiceImpl.java:92-99` and `RecordRoFServiceImpl.java:186, 290-297, 576-580`: the Report of Fire `submittedTimestamp` is converted from epoch through `ZoneId.systemDefault()` into a `LocalDateTime` and stored in a `timestamp` column (so it's stored as UTC wall time today).
- `wfss-pointid-api/.../rest/model/QueryResource.java:7-14`: the response `timestamp` is `yyyy-MM-dd'T'HH:mm:ss` **without an offset**, in the JVM zone (UTC). API consumers may misread it as local time. That's a pre-existing ambiguity.
- `wfnews-api/.../PublicPublishedIncidentEndpointImpl.java:236-238`: the `from/toCreateDate` and `from/toDiscoveryDate` query parameters are parsed with no zone, so they're read as UTC. The web client doesn't send them, but external API users might assume Pacific time.

**Action (post-cutover, optional):** Make the zone explicit (`ZoneOffset.UTC`) in these spots. Add an offset (`XXX`) to the `QueryResource` timestamp format. Document that the API date parameters are UTC.

### N7. Lambdas, ArcGIS Online, schedules: no impact

- The four monitor Lambdas (`lambda/*-monitor/*/app.py`) compute `datetime.now(pytz.timezone('GMT'))` and query ArcGIS Online with GMT strings.
- The ArcGIS layers checked all declare `dateFieldsTimeReference = UTC, respectsDaylightSaving: false`: Evacuation Orders/Alerts, Bans & Prohibitions, and Active Fires. (Area Restrictions wasn't checked but is the same pattern.)
- EventBridge uses `rate()` schedules only. Quartz and `@Scheduled` jobs are interval-based (`withIntervalIn…`, `fixedRate`). **There is no wall-clock cron that could drift.**
- `python3.9` and `nodejs18.x` Lambda runtimes are past end of life. That's unrelated to the timezone change but worth tracking.

### N8. Pre-existing DB default (for awareness)

About 24 DDL columns such as `create_date timestamp NOT NULL DEFAULT current_date` (for example `APP_WFNEWS.PUBLISHED_INCIDENT_DETAIL.sql:53,55` and `CREATE.SITUATION_REPORT.sql:17,19`) store **midnight UTC of the current date**, not the current time. It isn't affected by PCT, but it is a latent data-quality bug. `CURRENT_TIMESTAMP` or `LOCALTIMESTAMP` was probably intended.

### Testing and CI

The Karma tests run in the headless Chrome that the Maven/npm build downloads. `weather-time.spec.ts` pins `America/Vancouver` but only asserts 2021 labels plus a post-change *offset* test that is zone-independent. **Add one display test for a date after 2026-11-01 in `America/Vancouver`**. It fails on a stale Chrome or ICU, which makes CI a tzdata canary. The mobile workflows (`android.yml`, `ios.yml`, `mobile-web-build.yml`) use Node 22. Make sure the Node build is a recent 22.x with ICU tz 2026b or later if any build-time date rendering is added.

---

## 5. Recommended actions and timeline

| When | Action | Findings |
|---|---|---|
| **This week** | Ask BCWS Predictive Services to confirm weather hourstamps stay at UTC-8. Ask BCWS communications to agree the public time label ("PT"/"PCT") and the pinned-vs-local rendering policy. | N1, N2, N3 |
| **By Oct 16** | Add a central `formatBcTime()` helper and move notice timestamps to it. Replace `timeZoneName: 'short'` with the agreed literal. Add a post-Nov-1 display test. Update weather copy for "1:00 p.m. PCT" daily observations. | N1, N2, N3 |
| **By Oct 23** | Rebuild and redeploy all Tomcat images (JDK ≥ 21.0.12). Confirm `DB_POSTGRES_VERSION` ≥ 15.18. Delete or replace the legacy openjdk18 and jdk8u252 images. | N4, N5 |
| **Before Oct 30** | Release the client (web plus iOS/Android store builds; allow for app review lead time). Publish user guidance on device updates. | N1 |
| **Nov 1–2** | Smoke test on an updated and a deliberately stale device/browser. Compare evacuation "issued" times with ArcGIS source values. | N1, N2 |
| **After cutover** | Make the zone explicit in the Java items in N6. Fix `DEFAULT current_date`. Upgrade Lambda runtimes. | N6, N7, N8 |

---

## 6. Method and scope

- Shallow clone of `main` @ `cf8a31c`. Static scan excluding `node_modules`, `ios/App/App/public` (built copy) and minified assets. Searched for zone IDs, fixed offsets, `TZ`/`user.timezone`, Java/JS date and zone APIs, `Intl`/`toLocale*`, SQL time functions, Dockerfile bases, Terraform ECS/RDS/Lambda/EventBridge, GitHub workflows, and Python Lambdas.
- Checked the public ArcGIS layer metadata (`dateFieldsTimeReference`) for three of the four monitored layers. Checked Node/ICU formatting behaviour in this session (tz 2025c).
- **Not verified:** the actual `DB_POSTGRES_VERSION` value and the deployed image digests (both held outside the repo). What the WFWX / PointID source does after Nov 1. The exact label each browser will render (it depends on its CLDR version).

**Sources:** [gov.bc.ca: Daylight saving time](https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time) · [IANA tzdb NEWS](https://data.iana.org/time-zones/tzdb/NEWS) · [JDK tzdata versions](https://www.oracle.com/java/technologies/tzdata-versions.html) · [PostgreSQL 15.18 release notes](https://www.postgresql.org/docs/release/15.18/) · [ArcGIS: Evacuation Orders and Alerts layer](https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0?f=json)
