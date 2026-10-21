/**
 * Weather timestamp handling for WFNEWS.
 *
 * PointID returns weather timestamps ("YYYYMMDDHH" or "YYYYMMDD") in fixed
 * UTC-8 (PST) year-round without Daylight Saving Time adjustments.
 *
 * Formatting workflow:
 * 1. Convert the UTC-8 wall-clock string to an absolute UTC Date object.
 * 2. Format the Date object into the user's local timezone (with explicit zone abbreviation).
 */

/**
 * PointID hourstamps are recorded in fixed UTC-8 (PST) year-round.
 * Do not change this offset even if BC changes Daylight Saving Time rules;
 * this reflects the raw data source, not the display timezone.
 */
const SOURCE_OFFSET_MINUTES = -8 * 60;

const MILLIS_PER_MINUTE = 60000;
const MILLIS_PER_DAY = 86400000;

const HOURSTAMP_PATTERN = /^\d{10}$/;
const DAYSTAMP_PATTERN = /^\d{8}$/;

/**
 * Daily observations are taken at noon (12:00) Local Standard Time.
 */
const DAILY_OBSERVATION_HOUR = 12;

const LOCALE = 'en-CA';

/**
 * Returns the browser's local IANA timezone (e.g., "America/Vancouver"), falling back to "UTC".
 * Formatters accept an explicit timezone parameter to allow pinning timezones during testing.
 */
function viewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function parseHourstamp(
  hourstamp: string,
): { day: number; hour: number; month: number; year: number } | null {
  if (!hourstamp || !HOURSTAMP_PATTERN.test(hourstamp)) {
    return null;
  }

  const year = parseInt(hourstamp.substring(0, 4), 10);
  const month = parseInt(hourstamp.substring(4, 6), 10);
  const day = parseInt(hourstamp.substring(6, 8), 10);
  const hour = parseInt(hourstamp.substring(8, 10), 10);

  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }
  // Hourstamps use 01..24, where 24 represents midnight ending the day.
  if (hour < 1 || hour > 24) {
    return null;
  }

  return { day, hour, month, year };
}

/**
 * Converts a "YYYYMMDDHH" hourstamp (fixed UTC-8) into a JavaScript Date object (UTC instant).
 */
export function weatherHourToDate(hourstamp: string): Date | null {
  const parts = parseHourstamp(hourstamp);
  if (!parts) {
    return null;
  }

  const wallClock = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
  );

  return new Date(wallClock - SOURCE_OFFSET_MINUTES * MILLIS_PER_MINUTE);
}

/**
 * Converts a "YYYYMMDD" daystamp (noon Local Standard Time) into a JavaScript Date object.
 */
function weatherDayToDate(daystamp: string): Date | null {
  if (!daystamp || !DAYSTAMP_PATTERN.test(daystamp)) {
    return null;
  }
  return weatherHourToDate(
    daystamp + String(DAILY_OBSERVATION_HOUR).padStart(2, '0'),
  );
}

function partsOf(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): (type: string) => string {
  const parts = new Intl.DateTimeFormat(LOCALE, options).formatToParts(date);
  return (type: string) => parts.find((part) => part.type === type)?.value ?? '';
}

/**
 * Returns a date string formatted as "YYYY-MM-DD" for calendar comparison.
 */
function calendarDayIn(date: Date, timeZone: string): string {
  const lookup = partsOf(date, {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  });
  return `${lookup('year')}-${lookup('month')}-${lookup('day')}`;
}

/**
 * Calculates calendar days between today and the target date (0 = today, 1 = yesterday).
 */
function daysBeforeToday(date: Date, now: Date, timeZone: string): number {
  const then = Date.parse(`${calendarDayIn(date, timeZone)}T00:00:00Z`);
  const today = Date.parse(`${calendarDayIn(now, timeZone)}T00:00:00Z`);
  return Math.round((today - then) / MILLIS_PER_DAY);
}

/**
 * Formats time of day with an explicit timezone suffix (e.g., "3:00 p.m. PDT").
 */
export function formatWeatherTimeOfDay(
  date: Date,
  timeZone: string = viewerTimeZone(),
): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

/**
 * Formats a date as a full calendar date (e.g., "August 10, 2026").
 */
export function formatWeatherDate(
  date: Date,
  timeZone: string = viewerTimeZone(),
): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    timeZone,
    year: 'numeric',
  }).format(date);
}

/**
 * Formats an hourstamp into a full date and time string (e.g., "August 10, 2026 at 3:00 p.m. PDT").
 */
export function formatWeatherHour(
  hourstamp: string,
  timeZone: string = viewerTimeZone(),
): string {
  const date = weatherHourToDate(hourstamp);
  if (!date) {
    return '';
  }
  return (
    `${formatWeatherDate(date, timeZone)} at ` +
    `${formatWeatherTimeOfDay(date, timeZone)}`
  );
}

/**
 * Formats an hourstamp relative to today (e.g., "Today at 3:00 p.m. PDT", "Yesterday at 11:00 p.m. PDT").
 * Falls back to full date format if older than yesterday or in the future.
 */
export function formatWeatherHourRelative(
  hourstamp: string,
  now: Date = new Date(),
  timeZone: string = viewerTimeZone(),
): string {
  const date = weatherHourToDate(hourstamp);
  if (!date) {
    return '';
  }

  const time = formatWeatherTimeOfDay(date, timeZone);
  switch (daysBeforeToday(date, now, timeZone)) {
    case 0:
      return `Today at ${time}`;
    case 1:
      return `Yesterday at ${time}`;
    default:
      return `${formatWeatherDate(date, timeZone)} at ${time}`;
  }
}

/**
 * Formats a daystamp "YYYYMMDD" directly as a calendar date (e.g., "August 10, 2026").
 * Rendered without timezone conversion to prevent date shifts across timezone boundaries.
 */
export function formatWeatherDay(daystamp: string): string {
  if (!daystamp || !DAYSTAMP_PATTERN.test(daystamp)) {
    return '';
  }

  const year = parseInt(daystamp.substring(0, 4), 10);
  const month = parseInt(daystamp.substring(4, 6), 10);
  const day = parseInt(daystamp.substring(6, 8), 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return '';
  }

  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Formats the daily observation timestamp (noon LST) into local time (e.g., "August 10, 2026 at 1:00 p.m. PDT").
 */
export function formatWeatherDailyObservation(
  daystamp: string,
  timeZone: string = viewerTimeZone(),
): string {
  const date = weatherDayToDate(daystamp);
  if (!date) {
    return '';
  }
  return (
    `${formatWeatherDate(date, timeZone)} at ` +
    `${formatWeatherTimeOfDay(date, timeZone)}`
  );
}

