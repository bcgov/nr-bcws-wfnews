import * as P from 'piexifjs';
import { ReportOfFireService } from './report-of-fire-service';

/**
 * Regression coverage for the EXIF handling that Report of Fire photos pass through.
 *
 * These specs pin the contract between the web layer and the native camera plugin.
 * The plugin physically rotates picked images and resets their Orientation tag to 1
 * (ImageUtils.correctOrientation calls exif.resetOrientation() before transforming the
 * bitmap). checkExifGPS then rewrites the EXIF block via piexifjs P.insert(), which
 * replaces the whole block with only the GPS dict and therefore drops Orientation.
 *
 * That combination is only safe while the native layer keeps normalising orientation.
 * If a Capacitor upgrade changes that, the "orientation survives" expectations below
 * are what should be re-read before shipping.
 */

const TEST_LATITUDE = 49.2827;
const TEST_LONGITUDE = -123.1207;

/** Builds a small, valid baseline JPEG with no EXIF block. */
function makeJpeg(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // Asymmetric content so a rotation would be detectable in the decoded pixels.
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 0, Math.floor(width / 2), Math.floor(height / 2));
  return canvas.toDataURL('image/jpeg', 0.92);
}

/** Re-writes the EXIF block of a JPEG data URL with the given Orientation and optional GPS. */
function withExif(
  dataUrl: string,
  options: { orientation?: number; gps?: boolean },
): string {
  const zeroth = {};
  if (options.orientation !== undefined) {
    zeroth[P.ImageIFD.Orientation] = options.orientation;
  }

  const gps = {};
  if (options.gps) {
    gps[P.GPSIFD.GPSLatitudeRef] = 'N';
    gps[P.GPSIFD.GPSLatitude] = P.GPSHelper.degToDmsRational(TEST_LATITUDE);
    gps[P.GPSIFD.GPSLongitudeRef] = 'W';
    gps[P.GPSIFD.GPSLongitude] = P.GPSHelper.degToDmsRational(TEST_LONGITUDE);
  }

  return P.insert(P.dump({ '0th': zeroth, GPS: gps }), dataUrl);
}

function readOrientation(dataUrl: string): number | undefined {
  return P.load(dataUrl)['0th'][P.ImageIFD.Orientation];
}

function hasGps(dataUrl: string): boolean {
  const gps = P.load(dataUrl)['GPS'];
  return !!(gps && gps[P.GPSIFD.GPSLatitude] && gps[P.GPSIFD.GPSLongitude]);
}

function decode(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to decode'));
    img.src = dataUrl;
  });
}

describe('ReportOfFireService EXIF handling', () => {
  let service: ReportOfFireService;

  beforeEach(() => {
    // checkExifGPS only reads this.latitude / this.longitude, so the injected
    // collaborators are not exercised here.
    service = new ReportOfFireService(
      null as any,
      null as any,
      null as any,
      null as any,
    );
    service.latitude = TEST_LATITUDE;
    service.longitude = TEST_LONGITUDE;
  });

  it('builds fixtures that actually carry the EXIF under test', () => {
    const fixture = withExif(makeJpeg(40, 20), { orientation: 6, gps: true });
    expect(readOrientation(fixture)).toBe(6);
    expect(hasGps(fixture)).toBe(true);
  });

  describe('when the image already carries GPS', () => {
    it('returns it byte-identical', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1, gps: true });

      const result = await service.checkExifGPS(fixture);

      expect(result).toBe(fixture);
    });

    it('leaves a non-default Orientation tag intact', async () => {
      // The plugin normally resets Orientation to 1 before this point. If a future
      // change stops it doing so, the tag survives here and any consumer honouring
      // EXIF would rotate already-upright pixels a second time.
      const fixture = withExif(makeJpeg(40, 20), { orientation: 6, gps: true });

      const result = await service.checkExifGPS(fixture);

      expect(readOrientation(result)).toBe(6);
    });
  });

  describe('when the image has no GPS', () => {
    it('stamps the reported location', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1 });
      expect(hasGps(fixture)).toBe(false);

      const result = await service.checkExifGPS(fixture);

      expect(hasGps(result)).toBe(true);
    });

    it('leaves the image decodable at unchanged dimensions', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1 });

      const result = await service.checkExifGPS(fixture);
      const decoded = await decode(result);

      expect(decoded.naturalWidth).toBe(40);
      expect(decoded.naturalHeight).toBe(20);
    });

    it('drops the Orientation tag when rewriting EXIF', async () => {
      // P.insert() replaces the entire EXIF block with only the GPS dict. This is
      // safe *only* because the native plugin has already rotated the pixels and
      // reset Orientation to 1. Documented here so the coupling is explicit.
      const fixture = withExif(makeJpeg(40, 20), { orientation: 6 });
      expect(readOrientation(fixture)).toBe(6);

      const result = await service.checkExifGPS(fixture);

      expect(readOrientation(result)).toBeUndefined();
    });
  });
});
