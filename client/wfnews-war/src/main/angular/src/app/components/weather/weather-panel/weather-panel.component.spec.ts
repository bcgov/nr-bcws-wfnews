import { ChangeDetectorRef } from '@angular/core';
import { WeatherPanelComponent } from './weather-panel.component';

describe('WeatherPanelComponent.setWeatherStation', () => {
  let panel: WeatherPanelComponent;

  beforeEach(() => {
    panel = new WeatherPanelComponent({
      detectChanges: () => {},
    } as unknown as ChangeDetectorRef);
  });

  it('shows the hour the mobile card shows', () => {
    const validHour = { hour: '2026071510', temp: 12 };
    panel.setWeatherStation({
      validHour,
      hourly: [{ hour: '2026071512', temp: 14 }],
    });
    expect(panel.hourly).toBe(validHour);
  });

  it('reads "temp", the field PointID sends', () => {
    panel.setWeatherStation({
      hourly: [
        { hour: '2026071512', temp: 14 },
        { hour: '2026071511', temp: 13 },
      ],
    });
    expect(panel.hourly.hour).toBe('2026071512');
  });

  it('skips the newest hours when they have no reading', () => {
    panel.setWeatherStation({
      hourly: [
        { hour: '2026071512', temp: null },
        { hour: '2026071511', temp: null },
        { hour: '2026071510', temp: 9 },
      ],
    });
    expect(panel.hourly.hour).toBe('2026071510');
  });

  it('shows an hour of 0 degrees', () => {
    panel.setWeatherStation({
      hourly: [
        { hour: '2026071512', temp: 0 },
        { hour: '2026071511', temp: 0 },
      ],
    });
    expect(panel.hourly.hour).toBe('2026071512');
  });

  it('shows no hour when none has a reading', () => {
    panel.setWeatherStation({
      hourly: [{ hour: '2026071512', temp: null }],
    });
    expect(panel.hourly).toBeUndefined();
  });
});
