import {
  expandTimes,
  MAX_FRAMES,
  parsePeriod,
  timeDimensionFor,
} from './wms-time-dimension';

const parse = (xml: string) =>
  new DOMParser().parseFromString(xml, 'text/xml');

describe('parsePeriod', () => {
  it('reads hours', () => {
    expect(parsePeriod('PT1H')).toBe(3600 * 1000);
  });

  it('reads minutes and seconds', () => {
    expect(parsePeriod('PT30M')).toBe(1800 * 1000);
    expect(parsePeriod('PT45S')).toBe(45 * 1000);
  });

  it('reads days', () => {
    expect(parsePeriod('P1D')).toBe(86400 * 1000);
  });

  it('adds the parts together', () => {
    expect(parsePeriod('P1DT2H30M')).toBe((86400 + 7200 + 1800) * 1000);
  });

  it('returns zero for something it cannot read', () => {
    expect(parsePeriod('P1Y')).toBe(0);
    expect(parsePeriod('every hour')).toBe(0);
    expect(parsePeriod('')).toBe(0);
  });
});

describe('expandTimes', () => {
  it('reads a comma list of instants', () => {
    const t = expandTimes(
      '2026-09-04T00:00:00Z,2026-09-04T01:00:00Z,2026-09-04T02:00:00Z',
    );
    expect(t.length).toBe(3);
    expect(new Date(t[0]).toISOString()).toBe('2026-09-04T00:00:00.000Z');
  });

  it('expands start/end/period into frames', () => {
    const t = expandTimes('2026-09-04T00:00:00Z/2026-09-04T03:00:00Z/PT1H');
    expect(t.length).toBe(4);
    expect(new Date(t[3]).toISOString()).toBe('2026-09-04T03:00:00.000Z');
  });

  it('returns frames oldest first', () => {
    const t = expandTimes('2026-09-04T02:00:00Z,2026-09-04T00:00:00Z');
    expect(t[0]).toBeLessThan(t[1]);
  });

  it('caps a range that would otherwise never end', () => {
    // A one-second period across a year.
    const t = expandTimes('2026-01-01T00:00:00Z/2027-01-01T00:00:00Z/PT1S');
    expect(t.length).toBe(MAX_FRAMES);
  });

  it('skips a range with a period it cannot read', () => {
    expect(expandTimes('2026-09-04T00:00:00Z/2026-09-04T03:00:00Z/P1Y')).toEqual(
      [],
    );
  });

  it('survives empty and junk input', () => {
    expect(expandTimes('')).toEqual([]);
    expect(expandTimes('not a time')).toEqual([]);
    expect(expandTimes(null as unknown as string)).toEqual([]);
  });
});

describe('timeDimensionFor', () => {
  // Two layers, each with its own time dimension, as GeoMet publishes.
  const CAPS = `<?xml version="1.0"?>
    <WMS_Capabilities>
      <Capability>
        <Layer>
          <Layer>
            <Name>OTHER.LAYER</Name>
            <Dimension name="time">2020-01-01T00:00:00Z</Dimension>
          </Layer>
          <Layer>
            <Name>RAQDPS-FW.SFC_PM2.5-DIFF</Name>
            <Dimension name="time">2026-09-04T00:00:00Z/2026-09-04T02:00:00Z/PT1H</Dimension>
          </Layer>
        </Layer>
      </Capability>
    </WMS_Capabilities>`;

  it('takes the dimension of the layer asked for, not the first one', () => {
    const el = timeDimensionFor(parse(CAPS), 'RAQDPS-FW.SFC_PM2.5-DIFF');
    expect(el.textContent).toContain('2026-09-04T00:00:00Z');
  });

  it('falls back to the first dimension when the layer is not named', () => {
    const el = timeDimensionFor(parse(CAPS));
    expect(el.textContent).toContain('2020-01-01T00:00:00Z');
  });

  it('falls back when the named layer is not in the document', () => {
    const el = timeDimensionFor(parse(CAPS), 'NOT.PRESENT');
    expect(el.textContent).toContain('2020-01-01T00:00:00Z');
  });

  it('reads the 1.1.1 Extent form as well as 1.3.0 Dimension', () => {
    const xml = `<?xml version="1.0"?><WMS_Capabilities><Layer>
      <Name>L</Name><Extent name="time">2026-09-04T00:00:00Z</Extent>
    </Layer></WMS_Capabilities>`;
    expect(timeDimensionFor(parse(xml), 'L').textContent).toContain('2026-09-04');
  });

  it('returns null when the document has no time at all', () => {
    const xml = `<?xml version="1.0"?><WMS_Capabilities><Layer><Name>L</Name></Layer></WMS_Capabilities>`;
    expect(timeDimensionFor(parse(xml), 'L')).toBeNull();
  });
});
