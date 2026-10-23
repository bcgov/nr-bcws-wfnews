import { Injectable } from '@angular/core';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';

const FULL_FEATURE: AgolOptions = { returnGeometry: true, returnCentroid: true, returnExtent: false };

// A phone page asks once for its text and again for its map. One download serves both.
const REUSE_MS = 60 * 1000;

/** A quote in a name or an id from a link would end the SQL string. */
export const sqlText = (value: string) => String(value).replace(/'/g, "''");

/**
 * The one AGOL feature behind a full-details page and a public event page.
 * Each answer has its geometry and centroid, or is null when nothing matched.
 */
@Injectable({ providedIn: 'root' })
export class EventFeatureService {
  private answers = new Map<string, { at: number; feature: Promise<any> }>();

  constructor(private agolService: AGOLService) {}

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

  getDangerRating(sysId: string): Promise<any> {
    const where = `PROT_DR_SYSID ='${sqlText(sysId)}'`;
    return this.once(`danger-rating:${where}`, () =>
      this.agolService.getDangerRatings(where, null, FULL_FEATURE).toPromise(),
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
