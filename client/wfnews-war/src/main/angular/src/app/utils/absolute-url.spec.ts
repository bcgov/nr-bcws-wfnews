import { absoluteUrl } from './index';

describe('absoluteUrl', () => {
  it('adds https to a link with no scheme', () => {
    expect(absoluteUrl('www.apple.com')).toBe('https://www.apple.com');
  });

  it('keeps an http or https link', () => {
    expect(absoluteUrl('http://example.ca/a')).toBe('http://example.ca/a');
    expect(absoluteUrl('HTTPS://example.ca')).toBe('HTTPS://example.ca');
  });

  it('trims spaces that were typed in the Admin Panel', () => {
    expect(absoluteUrl('  www.example.ca ')).toBe('https://www.example.ca');
  });

  // A protocol-relative link also resolves against capacitor:// on iOS.
  it('makes a protocol-relative link absolute', () => {
    expect(absoluteUrl('//www.example.ca')).toBe('https://www.example.ca');
  });
});
