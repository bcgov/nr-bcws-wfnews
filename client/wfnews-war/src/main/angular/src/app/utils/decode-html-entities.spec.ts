import { decodeHtmlEntities } from './index';

describe('decodeHtmlEntities', () => {
  it('decodes numeric and named entities', () => {
    expect(decodeHtmlEntities('Crew&#39;s update &amp; more')).toBe(
      "Crew's update & more",
    );
    expect(decodeHtmlEntities('&quot;Wildfire&quot;')).toBe('"Wildfire"');
  });

  it('leaves plain text unchanged', () => {
    expect(decodeHtmlEntities('Wildfire update for July')).toBe(
      'Wildfire update for July',
    );
  });

  it('strips markup without running scripts', () => {
    const result = decodeHtmlEntities('Hi <img src=x onerror=alert(1)>there');
    expect(result).toBe('Hi there');
  });

  it('returns empty or missing input unchanged', () => {
    expect(decodeHtmlEntities('')).toBe('');
    expect(decodeHtmlEntities(undefined as unknown as string)).toBeUndefined();
    expect(decodeHtmlEntities(null as unknown as string)).toBeNull();
  });
});
