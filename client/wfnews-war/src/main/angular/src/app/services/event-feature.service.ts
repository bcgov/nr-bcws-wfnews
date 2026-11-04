import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { polygonRings } from '@app/utils/preview-map';
import { AppConfigService } from '@wf1/core-ui';
import * as turf from '@turf/turf';

const FULL_FEATURE: AgolOptions = { returnGeometry: true, returnCentroid: true, returnExtent: false };

// A phone page asks once for its text and again for its map. One download serves both.
const REUSE_MS = 60 * 1000;

/** A quote in a name or an id from a link would end the SQL string. */
export const sqlText = (value: string) => String(value).replace(/'/g, "''");

/** A DataBC GeoJSON feature in the AGOL shape the pages read; the centroid is inside the area. */
function asAgolFeature(feature: any): any {
  const [x, y] = turf.pointOnFeature(feature).geometry.coordinates;
  return { attributes: feature.properties, geometry: { rings: polygonRings(feature.geometry) }, centroid: { x, y } };
}

/**
 * The one feature behind a full-details page and a public event page, in the AGOL shape.
 * Each answer has its geometry and centroid, or is null when nothing matched.
 */
@Injectable({ providedIn: 'root' })
export class EventFeatureService {
  private answers = new Map<string, { at: number; feature: Promise<any> }>();

  constructor(
    private agolService: AGOLService,
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  getBan(id: string): Promise<any> {
    // AGOLService puts the id in the SQL with no quotes, so only a number may pass.
    if (!/^\d+$/.test(String(id))) {
      return Promise.resolve(null);
    }
    return this.once(`ban:${id}`, () =>
      this.agolService.getBansAndProhibitionsById(id, FULL_FEATURE).toPromise(),
    );
  }

  getAreaRestriction(key: { id?: string; name?: string }): Promise<any> {
    const where = key.name ? `NAME='${sqlText(key.name)}'` : `PROT_RA_SYSID='${sqlText(key.id)}'`;
    return this.once(`area-restriction:${where}`, () =>
      this.agolService.getAreaRestrictions(where, null, FULL_FEATURE).toPromise(),
    );
  }

  /** From DataBC, the source of the map layer and the identify list; the AGOL TEST ids name other areas. */
  getDangerRating(sysId: string): Promise<any> {
    // The id goes in the CQL filter with no quotes, so only a number may pass.
    if (!/^\d+$/.test(String(sysId))) {
      return Promise.resolve(null);
    }
    const params = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      srsName: 'EPSG:4326',
      typename: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
      outputformat: 'application/json',
      cql_filter: `PROT_DR_SYSID=${sysId}`,
    });
    const url = `${(this.appConfigService.getConfig() as any).mapServices['openmapsBaseUrl']}?${params}`;
    return this.once(`danger-rating:${sysId}`, () =>
      this.http.get<any>(url).toPromise().then((response) => ({ features: (response?.features ?? []).map(asAgolFeature) })),
    );
  }

  /** In AGOL TEST every evacuation id is 0, so the event number picks the feature. */
  getEvacuation(key: { id?: string; name?: string; eventNumber?: string }): Promise<any> {
    const where = key.id ? `EMRG_OAA_SYSID='${sqlText(key.id)}'` : `EVENT_NAME='${sqlText(key.name)}'`;
    return this.once(
      `evacuation:${where}:${key.eventNumber}`,
      () => this.agolService.getEvacOrdersByParam(where, FULL_FEATURE).toPromise(),
      (features) => features.find((feature) => feature.attributes?.EVENT_NUMBER === key.eventNumber),
    );
  }

  private once(
    key: string,
    request: () => Promise<any>,
    pick: (features: any[]) => any = (features) => features[0],
  ): Promise<any> {
    const kept = this.answers.get(key);
    if (kept && Date.now() - kept.at < REUSE_MS) {
      return kept.feature;
    }
    this.dropOld();
    const feature = request().then((response) => pick(response?.features ?? []) ?? null);
    this.answers.set(key, { at: Date.now(), feature });
    // A failure is not kept, so the next visit asks again.
    feature.catch(() => this.answers.delete(key));
    return feature;
  }

  private dropOld() {
    const now = Date.now();
    this.answers.forEach((kept, key) => {
      if (now - kept.at >= REUSE_MS) {
        this.answers.delete(key);
      }
    });
  }
}
