import {
  formatWeatherDailyObservation,
  formatWeatherDay,
  formatWeatherHour,
  formatWeatherHourRelative,
  weatherHourToDate,
} from './weather-time';

/**
 * Coverage for the weather timestamp contract between PointID and the UI.
 *
 * PointID hands WFNEWS a wall-clock string (YYYYMMDDHH / YYYYMMDD) that it has
 * already localised to a fixed UTC-8, with no daylight-savings shift ever
 * applied -- the Fire Weather Index Local Standard Time convention. The UI's
 * job is to recover the real instant from that fixed offset and then render it
 * in the viewer's own timezone, without naming the zone.
 *
 * The two failure modes these specs exist to prevent:
 *   - re-localising an already-local value (e.g. `new Date(y, m, d, h)`), which
 *     silently reinterprets it in the browser's zone; and
 *   - letting daylight savings leak into step 1, which moves a reading by an
 *     hour depending on the time of year it was taken.
 *
 * The output is built from date parts, so assertions are exact. The instants are
 * pinned to the vectors in the server's WeatherHourTests.java.
 */

/** Pacific: observes DST today, and is what most of BC is on. */
const VANCOUVER = 'America/Vancouver';
/** BC's Peace region: Mountain time, and already permanently off DST. */
const DAWSON_CREEK = 'America/Dawson_Creek';

const HOURS = 3600000;

describe('weatherHourToDate', () => {
  it('matches the server WeatherHour.toMillisEnd vectors', () => {
    // WeatherHourTests.testToMillisEnd: 2021-02-15T18:00:00-08:00
    expect(weatherHourToDate('2021021518').getTime()).toBe(1613440800000);
    // WeatherHourTests.testFromMillisAtMidnight
    expect(weatherHourToDate('2021021524').getTime()).toBe(1613462400000);
  });

  it('applies a fixed UTC-8 in and out of the historical DST window', () => {
    // The same numbered hour in February and in June must sit the same
    // distance from UTC. If DST ever leaks into this conversion, the June
    // reading drifts by an hour and the two expectations diverge.
    const winter = weatherHourToDate('2021021518');
    const summer = weatherHourToDate('2021061518');

    expect(winter.getTime() - Date.UTC(2021, 1, 15, 18)).toBe(8 * HOURS);
    expect(summer.getTime() - Date.UTC(2021, 5, 15, 18)).toBe(8 * HOURS);
  });

  it('holds the fixed offset for dates after permanent Pacific Time', () => {
    // Our side of the conversion is pinned to the source data's offset, so it
    // is unaffected by BC's permanent Pacific Time change. Only the display
    // zone moves, and that comes from the platform tz database.
    const afterChange = weatherHourToDate('2030071510');
    expect(afterChange.getTime() - Date.UTC(2030, 6, 15, 10)).toBe(8 * HOURS);
  });

  it('rolls hour 24 into midnight starting the next day', () => {
    // Never the nonexistent "24:00" the previous implementation printed.
    expect(weatherHourToDate('2021021524').toISOString()).toBe(
      '2021-02-16T08:00:00.000Z',
    );
  });

  it('crosses month and year boundaries via hour 24', () => {
    expect(weatherHourToDate('2020123124').toISOString()).toBe(
      '2021-01-01T08:00:00.000Z',
    );
  });

  it('returns null for malformed hourstamps', () => {
    // Mirrors the range checks in WeatherHourTests.testInvalid.
    expect(weatherHourToDate('2017010100')).toBeNull(); // hour 00
    expect(weatherHourToDate('2017010125')).toBeNull(); // hour 25
    expect(weatherHourToDate('2017130120')).toBeNull(); // month 13
    expect(weatherHourToDate('2017123220')).toBeNull(); // day 32
    expect(weatherHourToDate('201712322')).toBeNull(); // too short
    expect(weatherHourToDate('XXXXXXXXXX')).toBeNull();
    expect(weatherHourToDate(null)).toBeNull();
    expect(weatherHourToDate(undefined)).toBeNull();
  });
});

describe('formatWeatherHour', () => {
  it('renders a winter reading in Pacific standard time', () => {
    expect(formatWeatherHour('2021021518', VANCOUVER)).toBe(
      '2021-02-15 at 6:00 pm',
    );
  });

  it('advances a summer reading by an hour for Pacific daylight time', () => {
    // The hourstamp reads 18 because it is recorded in fixed PST. A viewer in
    // Vancouver in June is on PDT, where that instant is 19:00. Showing "18:00"
    // here -- as the UI used to -- is the off-by-one-hour bug this guards.
    expect(formatWeatherHour('2021061518', VANCOUVER)).toBe(
      '2021-06-15 at 7:00 pm',
    );
  });

  it('renders in Mountain time for the Peace region, year round', () => {
    // Dawson Creek sits on MST permanently, so both readings land at 19:00.
    expect(formatWeatherHour('2021021518', DAWSON_CREEK)).toBe(
      '2021-02-15 at 7:00 pm',
    );
    expect(formatWeatherHour('2021061518', DAWSON_CREEK)).toBe(
      '2021-06-15 at 7:00 pm',
    );
  });

  it('shows hour 24 as midnight on the following day', () => {
    expect(formatWeatherHour('2021021524', VANCOUVER)).toBe(
      '2021-02-16 at 12:00 am',
    );
  });

  it('never names a timezone or writes "a.m."/"p.m."', () => {
    // Ruled 2026-10-15 (WFNEWS-2971): the acronym is wrong for most BC devices.
    for (const stamp of ['2021021518', '2021061518', '2021021524']) {
      for (const zone of [VANCOUVER, DAWSON_CREEK]) {
        const formatted = formatWeatherHour(stamp, zone);
        expect(formatted).not.toMatch(/\b[PM][SD]T\b/);
        expect(formatted).not.toMatch(/[ap]\.m\./);
      }
    }
  });

  it('returns an empty string rather than throwing on bad input', () => {
    expect(formatWeatherHour(null, VANCOUVER)).toBe('');
    expect(formatWeatherHour('nonsense', VANCOUVER)).toBe('');
  });
});

describe('formatWeatherHourRelative', () => {
  it('says "Today" for a reading on the viewer\'s current calendar day', () => {
    const now = new Date('2021-02-15T22:00:00Z'); // 14:00 PST, same day
    expect(formatWeatherHourRelative('2021021512', now, VANCOUVER)).toBe(
      'Today at 12:00 pm',
    );
  });

  it('says "Yesterday" for last night\'s reading seen after midnight', () => {
    // The previous implementation compared elapsed milliseconds, so a reading
    // 1.5 hours old that had crossed midnight still read "Today".
    const now = new Date('2021-02-16T08:30:00Z'); // 00:30 PST on the 16th
    expect(formatWeatherHourRelative('2021021523', now, VANCOUVER)).toBe(
      'Yesterday at 11:00 pm',
    );
  });

  it('decides the calendar day in the viewer\'s zone, not the source zone', () => {
    // 23:00 PST on the 15th is already 00:00 MST on the 16th in the Peace
    // region, so the same reading is "today" there and "yesterday" in Vancouver.
    const now = new Date('2021-02-16T08:30:00Z');

    expect(formatWeatherHourRelative('2021021523', now, VANCOUVER)).toContain(
      'Yesterday at',
    );
    expect(
      formatWeatherHourRelative('2021021523', now, DAWSON_CREEK),
    ).toContain('Today at');
  });

  it('falls back to the absolute form for older readings', () => {
    const now = new Date('2021-02-20T20:00:00Z');
    expect(formatWeatherHourRelative('2021021518', now, VANCOUVER)).toBe(
      '2021-02-15 at 6:00 pm',
    );
  });

  it('does not call a future reading "Today"', () => {
    // Math.abs() on the elapsed difference used to make future readings relative.
    const now = new Date('2021-02-10T20:00:00Z');
    expect(formatWeatherHourRelative('2021021518', now, VANCOUVER)).toBe(
      '2021-02-15 at 6:00 pm',
    );
  });

  it('returns an empty string rather than throwing on bad input', () => {
    expect(formatWeatherHourRelative(null, new Date(), VANCOUVER)).toBe('');
  });
});

describe('formatWeatherDay', () => {
  it('renders the fire-weather day as written', () => {
    // A daystamp labels a day, not an instant, so it must not be shifted into
    // the neighbouring date for viewers east or west of the source zone.
    expect(formatWeatherDay('20231205')).toBe('December 5, 2023');
    expect(formatWeatherDay('20210101')).toBe('January 1, 2021');
  });

  it('returns an empty string rather than throwing on bad input', () => {
    expect(formatWeatherDay('2023120')).toBe('');
    expect(formatWeatherDay(null)).toBe('');
  });
});

describe('formatWeatherDailyObservation', () => {
  it('reports the noon Local Standard Time reading in the viewer zone', () => {
    // Noon PST is 13:00 during Pacific daylight time.
    expect(formatWeatherDailyObservation('20210615', VANCOUVER)).toBe(
      '2021-06-15 at 1:00 pm',
    );
    expect(formatWeatherDailyObservation('20210215', VANCOUVER)).toBe(
      '2021-02-15 at 12:00 pm',
    );
  });

  it('anchors the reading to noon in the source zone, not the viewer zone', () => {
    // Noon fixed-UTC-8 is 20:00 UTC whatever the viewer is on, so the same
    // daystamp is a single instant that each zone then labels differently.
    expect(formatWeatherDailyObservation('20210215', 'UTC')).toBe(
      '2021-02-15 at 8:00 pm',
    );
  });

  it('returns an empty string rather than throwing on bad input', () => {
    expect(formatWeatherDailyObservation('2021021', VANCOUVER)).toBe('');
    expect(formatWeatherDailyObservation(null, VANCOUVER)).toBe('');
  });
});
