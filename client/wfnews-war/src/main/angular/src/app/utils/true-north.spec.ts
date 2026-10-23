import { declinationAt, toTrueNorth } from './true-north';

const OCT_2026 = new Date('2026-10-23T12:00:00Z');

describe('declinationAt', () => {
  // WMM2025 values; magvar, a second WMM library, gives the same to 0.01°.
  it('is about 15° east at Kamloops', () => {
    expect(declinationAt(50.67, -120.33, OCT_2026)).toBeCloseTo(15.14, 1);
  });

  it('is about 17° east at Fort Nelson', () => {
    expect(declinationAt(58.81, -122.7, OCT_2026)).toBeCloseTo(17.41, 1);
  });

  it('keeps working after the model end date', () => {
    expect(() => declinationAt(50.67, -120.33, new Date('2031-06-01'))).not.toThrow();
  });
});

describe('toTrueNorth', () => {
  it('adds an east declination', () => {
    expect(toTrueNorth(90, 15)).toBe(105);
  });

  it('wraps past 360', () => {
    expect(toTrueNorth(350, 15)).toBe(5);
  });

  it('wraps below 0', () => {
    expect(toTrueNorth(5, -10)).toBe(355);
  });
});
