import { WeatherStationConditions } from '@app/services/point-id.service';
import { getCurrentCondition } from './index';

// PointID fills a slot for every hour, newest first; an unobserved hour has no temp.
function station(...temps: number[]): WeatherStationConditions {
  return {
    hourly: temps.map((temp, i) => ({ hour: `20260715${12 - i}`, temp })),
  } as WeatherStationConditions;
}

describe('getCurrentCondition', () => {
  it('returns the newest hour when it has a reading', () => {
    expect(getCurrentCondition(station(21, 20)).hour).toBe('2026071512');
  });

  it('skips hours with no reading', () => {
    expect(getCurrentCondition(station(null, null, 19)).temp).toBe(19);
  });

  it('skips hours where temp is missing', () => {
    expect(getCurrentCondition(station(undefined, 18)).temp).toBe(18);
  });

  it('treats 0 degrees as a reading', () => {
    expect(getCurrentCondition(station(0, 0, 5)).hour).toBe('2026071512');
  });

  it('returns undefined when no hour has a reading', () => {
    expect(getCurrentCondition(station(null, null))).toBeUndefined();
  });

  it('returns undefined with no station or no hours', () => {
    expect(getCurrentCondition(undefined)).toBeUndefined();
    expect(getCurrentCondition({} as WeatherStationConditions)).toBeUndefined();
  });
});
