/* eslint-disable @typescript-eslint/naming-convention */
import { SpatialUtilsService } from '@wf1/core-ui';

export type LonLat = [number, number];
export type LatLon = [number, number];

export const toPoint = (lonLat: LonLat): any => window['turf'].point(lonLat);

export const toLatLon = (lonLat: LonLat): LatLon => [lonLat[1], lonLat[0]];

export const encodeUrl = (
  url: string,
  data: { [key: string]: string | number | boolean },
): string => {
  if (!data) {
    return url;
  }

  const params = Object.keys(data)
    .filter((k) => data[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join('&');

  if (/[?]\S+$/.test(url)) {
    return `${url}&${params}`;
  }

  if (/[?]$/.test(url)) {
    return `${url}${params}`;
  }

  return `${url}?${params}`;
};

export const fetchJsonP = (
  url: string,
  data: { [key: string]: string | number | boolean },
  opt = { timeout: 10000 },
): { response: Promise<any>; abort: () => void } => {
  data['_'] = Math.round(Math.random() * 1e10);

  const cbfn = `callback_${data['_']}`;
  data.callback = cbfn;

  let id;
  let cancel;
  const req = encodeUrl(url, data);
  const promise = new Promise((res, rej) => {
    const cleanup = () => {
      if (id) {
        clearTimeout(id);
      }
      id = null;

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      window[cbfn] = null;
    };

    window[cbfn] = (payload) => {
      cleanup();
      res(payload);
    };

    cancel = () => {
      cleanup();
      rej(new Error('cancelled'));
    };
    const script = window['L'].DomUtil.create('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = req;

    document.getElementsByTagName('head')[0].appendChild(script);
  });

  if (opt.timeout) {
    id = setTimeout(cancel, opt.timeout);
  }

  return {
    response: promise,
    abort: cancel,
  };
};

// distance in km
export const distance = (loc1: LonLat, loc2: LonLat): number => window['turf'].distance(toPoint(loc1), toPoint(loc2));

export const formatDistance = (dist: number, unit: string): string => {
  if (dist == null) {
    return 'n/a';
  }
  if (dist < 10) {
    return dist.toFixed(1) + ' ' + unit;
  }
  return dist.toFixed(0) + ' ' + unit;
};

const DIRECTION = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const direction = (start: LonLat, end: LonLat): string => {
  const bearing = window['turf'].bearing(toPoint(start), toPoint(end));
  return DIRECTION[Math.floor((bearing + 382.5) / 45) % 8];
};

const TIME_FORMAT = Intl.DateTimeFormat('en-CA', {
  timeZone: undefined,
  hour12: false,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short',
});
const DATE_FORMAT = Intl.DateTimeFormat('en-CA', {
  timeZone: undefined,
  hour12: false,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});
const CAD_FORMAT = Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

export interface NumberFormat {
  precision: number;
  fractionPlaces: number;
}
export interface UnitWithFormat {
  unit: string;
  format: NumberFormat;
}

export class Translate {
  constructor(private spatialUtils: SpatialUtilsService) {}

  parseCoordinate(val: string): LonLat {
    const c = this.spatialUtils.parseCoordinates(val);
    if (!c) {
      return;
    }
    return c as LonLat;
  }

  parseSexagesimal(val: string): number {
    if (typeof val == 'number') {
      return val;
    } else if (/^-?\d*(\.\d*)?$/.test(val)) {
      return 0.0 + parseFloat(val);
    } else {
      let result = 0;
      let divisor = 1;
      let sign = 1;
      if (/[NSEWnsew]$/.test(val)) {
        sign = /[SWsw]$/.test(val) ? -1 : 1;
        val = val.replace(/[NSEWnsew]$/, '');
      }
      val.split(/[°DMSdms'"\s]+/).forEach((part) => {
        const partVal = parseFloat(part);
        if (!isNaN(partVal)) {
          result += partVal / divisor;
        }
        divisor *= 60;
      });

      return result * sign;
    }
  }

  formatCoordinate(lonLat: LonLat): string {
    if (!lonLat[0] || !lonLat[1]) {
      return '';
    }
    return this.spatialUtils.formatCoordinates(lonLat);
  }

  formatLatLon(lat, lon): string {
    if (!lat || !lon) {
      return '';
    }
    return this.formatCoordinate([lon, lat]);
  }

  parseYyyyMmDd(val): Date {
    if (!val) {
      return;
    }
    const s = '' + val;
    return new Date(
      `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`,
    );
  }
  parseIsoDateTime(val): Date {
    if (!val) {
      return;
    }
    return new Date(val);
  }

  parseMilliseconds(val): Date {
    if (val == null) {
      return;
    }
    return new Date(1 * val);
  }
  parseEUDate(val?): Date {
    // Fix European style dd/mm/yyyy dates.
    if (!val) {
      return val;
    }
    const date = new Date(
      val.replace(
        /(\d\d)\/(\d\d)\/(\d\d\d\d)/,
        (m, day, month, year) => `${year}-${month}-${day}`,
      ),
    );
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }
  formatLocalDate(val: Date): string {
    if (!val) {
      return '';
    }
    return DATE_FORMAT.format(val);
    // return val && new Date( val ).toLocaleDateString()
  }

  formatLocalTime(val: Date): string {
    if (!val) {
      return '';
    }
    return TIME_FORMAT.format(val);
    // return val && new Date( val ).toLocaleDateString()
  }

  formatNumber(val: number, numberFormat?: NumberFormat): string {
    if (val == null) {
      return '';
    }

    numberFormat = { precision: 3, fractionPlaces: 1, ...numberFormat };

    const rounded = parseFloat(val.toPrecision(numberFormat.precision));
    if (!numberFormat.fractionPlaces) {
      return rounded.toLocaleString();
    }

    const a = Math.abs(rounded);
    const s = Math.sign(rounded);
    const i = Math.floor(a);
    const f = a - i;
    return (
      (s * i).toLocaleString() +
      f.toFixed(numberFormat.fractionPlaces).substr(1)
    );
  }

  formatUnit(val: number, unit: string, numberFormat?: NumberFormat): string {
    if (val == null) {
      return '';
    }
    return `<span>${this.formatNumber(
      val,
      numberFormat,
    )}\u202F<span class="unit">${unit}</span></span>`;
  }

  formatAndConvertUnit(
    val: number,
    unit: string,
    outputUnit: string | UnitWithFormat,
  ) {
    if (typeof outputUnit === 'object') {
      this.formatUnit(
        this.convertUnit(val, unit, outputUnit.unit),
        outputUnit.unit,
      );
    } else {
      this.formatUnit(this.convertUnit(val, unit, outputUnit), outputUnit);
    }
  }

  formatCAD(value?: number): string | null | undefined {
    if (value === null || value === undefined) {
      return value as null | undefined;
    } else {
      return CAD_FORMAT.format(value);
    }
  }

  formatAngle(
    val?: number,
    numberFormat?: NumberFormat,
  ): string | undefined | null {
    if (val) {
      return `<span>${this.formatNumber(
        val,
        numberFormat,
      )}<span class="unit">°</span></span>`;
    } else {
      return val as undefined | null;
    }
  }

  /**
   * Converts and formats a value as two different units, the second in parentheses.
   */
  formatMultipleUnits(
    val: number,
    unit: string,
    standardUnit: string | UnitWithFormat,
    otherUnit: string | UnitWithFormat,
  ): string {
    if (val == null) {
      return '';
    }
    return `${this.formatAndConvertUnit(
      val,
      unit,
      standardUnit,
    )} <span class='alternate-unit'>(${this.formatAndConvertUnit(
      val,
      unit,
      otherUnit,
    )})</span>`;
  }

  convertUnit(val: number, unitFrom: string, unitTo: string = 'm'): number {
    if (val == null) {
      return;
    }
    if (!(unitFrom in metersPerUnit)) {
      throw Error(`unitFrom "${unitFrom}" isn't defined`);
    }
    if (!(unitTo in metersPerUnit)) {
      throw Error(`unitTo "${unitTo}" isn't defined`);
    }

    const valInMeters = val * metersPerUnit[unitFrom];
    return valInMeters / metersPerUnit[unitTo];
  }

  formatFireZone(zoneName: string): string {
    if (!zoneName) {
      return;
    }

    const result = zoneName.match(
      /^(.+?) (?:Fire )?Zone(?: [(](.+?)[)])?(?: - (\w\d))?$/,
    );
    if (!result) {
      return zoneName;
    }

    if (result[2]) {
      return `${result[1]} (${result[2]})`;
    }
    return result[1];
  }

  formatFireCentre(centreName: string): string {
    if (!centreName) {
      return;
    }

    const result = centreName.match(/^(.+?) (?:Fire )?(?:Centre|Center)$/);
    if (!result) {
      return centreName;
    }

    return result[1];
  }

  formatIndicator(
    value: boolean | null,
    tString = '✔️ Yes',
    fString = '❌ No',
    nString = '❓ Unknown',
  ): string {
    if (value === undefined || value === null) {
      return nString;
    } else if (value) {
      return tString;
    } else {
      return fString;
    }
  }

  parseIndicator(indString: string, flip = false): boolean | null {
    if (indString === 'Y') {
      return !flip;
    } else if (indString === 'N') {
      return flip;
    } else {
      return null;
    }
  }

  formatPhoneHtml(phoneNumber: string): string {
    if (phoneNumber) {
      return `<a href="tel:${encodeURIComponent(
        phoneNumber,
      )}">${phoneNumber}</a>`;
    } else {
      return null;
    }
  }

  formatEmailHtml(emailAddress: string): string {
    if (emailAddress) {
      return `<a href="mailto:${encodeURIComponent(
        emailAddress,
      )}">${emailAddress}</a>`;
    } else {
      return null;
    }
  }
}

/**
 * This uses the ‘haversine’ formula to calculate the great-circle distance between two points 
 * – that is, the shortest distance over the earth’s surface – giving an ‘as-the-crow-flies’ distance between the points.
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2( √a, √(1−a) )
 * d = R ⋅ c
 * Where	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km). 
 * note that angles need to be in radians to pass to trig functions
 * @param lat1 Latitude of the location
 * @param lat2 Latitude of the destination
 * @param lon1 Longitude of the location
 * @param lon2 Longitude of the destination
 * @returns
 */
export const haversineDistance = (lat1, lat2, lon1, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

const metersPerUnit = {
  Mil: 2.5399999999999996e-8,
  MicroInch: 0.0000254,
  mm: 0.001,
  Millimeter: 0.001,
  cm: 0.01,
  Centimeter: 0.01,
  IInch: 0.0254,
  'us-in': 0.0254000508001016,
  Inch: 0.0254000508001016,
  in: 0.0254000508001016,
  inches: 0.0254000508001016,
  Decimeter: 0.1,
  ClarkeLink: 0.201166194976,
  SearsLink: 0.2011676512155,
  BenoitLink: 0.20116782494375873,
  IntnlLink: 0.201168,
  link: 0.201168,
  GunterLink: 0.2011684023368047,
  CapeFoot: 0.3047972615,
  ClarkeFoot: 0.3047972651151,
  'ind-ft': 0.30479841,
  IndianFt37: 0.30479841,
  SearsFoot: 0.30479947153867626,
  IndianFt75: 0.3047995,
  IndianFoot: 0.30479951,
  IndianFt62: 0.3047996,
  GoldCoastFoot: 0.3047997101815088,
  IFoot: 0.3048,
  Foot: 0.3048006096012192,
  ft: 0.3048006096012192,
  'us-ft': 0.3048006096012192,
  ModAmFt: 0.304812252984506,
  'ind-yd': 0.9143952300000001,
  IndianYd37: 0.9143952300000001,
  SearsYard: 0.914398414616029,
  IndianYd75: 0.9143985000000001,
  IndianYard: 0.9143985307444409,
  IndianYd62: 0.9143987999999998,
  IYard: 0.9143999999999999,
  Yard: 0.9144018288036576,
  yd: 0.9144018288036576,
  'us-yd': 0.9144018288036576,
  CaGrid: 0.9997380000000001,
  m: 1,
  Meter: 1,
  GermanMeter: 1.0000135965,
  fath: 1.8287999999999998,
  Fathom: 1.8287999999999998,
  Rood: 3.7782668980000005,
  Perch: 5.02921005842012,
  Rod: 5.02921005842012,
  Pole: 5.02921005842012,
  Dekameter: 10,
  Decameter: 10,
  ClarkeChain: 20.1166194976,
  'ind-ch': 20.11669506,
  SearsChain: 20.11676512155,
  BenoitChain: 20.116782494375872,
  IntnlChain: 20.1168,
  ch: 20.1168,
  'us-ch': 20.11684023368047,
  GunterChain: 20.11684023368047,
  dm: 100,
  Hectometer: 100,
  Furlong: 201.1684023368046,
  Brealey: 375,
  km: 1000,
  Kilometer: 1000,
  IMile: 1609.344,
  Mile: 1609.3472186944373,
  mi: 1609.3472186944373,
  'us-mi': 1609.3472186944373,
  kmi: 1851.9999999999998,
  nmi: 1851.9999999999998,
  NautM: 1852.0000000000002,
  'NautM-UK': 1853.1840000000002,
  '50kilometers': 50000,
  'Lat-66': 110943.31648893275,
  'Lat-83': 110946.25736872235,
  dd: 111118.97383794768,
  degrees: 111118.97383794768,
  '150kilometers': 150000,
};
