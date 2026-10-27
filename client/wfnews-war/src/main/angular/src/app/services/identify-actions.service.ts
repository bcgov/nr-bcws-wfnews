import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CapacitorService } from '@app/services/capacitor-service';
import { MapConfigService } from '@app/services/map-config.service';
import { BC_EXTENT, IDENTIFY_RADIUS_PX } from '@app/services/map-config.service/map.config';
import { ResourcesRoutes, getActiveMap, snowPlowHelper } from '@app/utils';
import { IdentifyKind, WILDFIRE_LAYER_IDS, identifyKind } from '@app/utils/identify-results';
import { highlightArea, polygonRings, ringsToExtent, zoomToCoords } from '@app/utils/preview-map';
import { AppConfigService } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';

type Rings = number[][][];

/** Where Zoom to goes. Each layout only draws it, so the two cannot choose different places. */
export type ZoomTarget =
  | { type: 'incident' | 'pin' | 'point'; point: number[] }
  | { type: 'area'; rings: Rings };

export interface MapView {
  center: [number, number];
  zoom: number;
}

// flyTo's own pace took 3 s from the province to an Incident; 500 ms was too fast.
export const FOCUS_DURATION_MS = 1000;
// A tap zooms in to the circle, but not past the zoom a point card uses.
export const TAP_MAX_ZOOM = 13;

// After this, an AGOL area that has not come is given up, so it cannot move the map later.
const AREA_TIMEOUT_MS = 10000;
const PIN_KINDS: IdentifyKind[] = ['road-event', 'closed-recreation-site'];
const AREA_KINDS: IdentifyKind[] = ['ban', 'evacuation', 'area-restriction', 'danger-rating', 'local-authority', 'protected-land'];

const flatten = <T>(nested: T[][]): T[] => [].concat(...(nested || []));

const lonLat = (lon: any, lat: any): number[] | null => {
  const point = [Number(lon), Number(lat)];
  return point.every(Boolean) ? point : null;
};

/** The box round the identify circle that SMK drew for a tap at this zoom. */
export function tapCircleExtent(longitude: number, latitude: number, zoom: number): number[] {
  // Degrees across one screen pixel, for MapLibre's 512 px tiles.
  const lon = (IDENTIFY_RADIUS_PX * 360) / (512 * 2 ** zoom);
  const lat = lon * Math.cos((latitude * Math.PI) / 180);
  return [longitude - lon, latitude - lat, longitude + lon, latitude + lat];
}

export function currentView(): MapView {
  const map = getActiveMap().$viewer.map;
  const { lng, lat } = map.getCenter();
  return { center: [lng, lat], zoom: map.getZoom() };
}

/** Zoom to and Full Details for an identify result, on the phone and on desktop. */
@Injectable({ providedIn: 'root' })
export class IdentifyActionsService {
  // The view before a card moved the map. Back from the card returns to it.
  private listView: MapView | null = null;

  constructor(
    private router: Router,
    private agolService: AGOLService,
    private appConfigService: AppConfigService,
    private capacitorService: CapacitorService,
    private mapConfigService: MapConfigService,
  ) {}

  /** Where Zoom to goes, on both layouts; null when the result has no place on the map. */
  async zoomTarget(item: any, incident?: any): Promise<ZoomTarget | null> {
    await this.mapConfigService.getMapConfig();
    const fire = lonLat(incident?.longitude, incident?.latitude);
    if (fire) {
      return { type: 'incident', point: fire };
    }
    const point = this.identifyPoint(item);
    if (!point) {
      return null;
    }
    const kind = identifyKind(item);
    if (PIN_KINDS.includes(kind)) {
      const pin = lonLat(item.geometry?.coordinates?.[0], item.geometry?.coordinates?.[1]);
      return pin && { type: 'pin', point: pin };
    }
    if (!AREA_KINDS.includes(kind)) {
      return { type: 'point', point };
    }
    // The identify already holds the area; on INT the AGOL danger rating IDs name other DataBC areas.
    const rings = polygonRings(item.geometry) ?? (await this.agolRings(item));
    // Without the area, the point still moves the map, so the button is never dead.
    return ringsToExtent(rings) ? { type: 'area', rings } : { type: 'point', point };
  }

  private identifyPoint(item: any): number[] | null {
    const coordinates = item?.geometry?.coordinates;
    if (item?.geometry?.type === 'Point' && WILDFIRE_LAYER_IDS.includes(item.layerId)) {
      // The fire itself, not the place the user tapped near it.
      return lonLat(coordinates[0], coordinates[1]);
    }
    return lonLat(item?._identifyPoint?.longitude, item?._identifyPoint?.latitude) ?? lonLat(coordinates?.[0], coordinates?.[1]);
  }

  private agolRings(item: any): Promise<Rings | undefined> {
    const request = this.agolArea(item);
    if (!request) {
      return Promise.resolve(undefined);
    }
    return request
      .pipe(timeout(AREA_TIMEOUT_MS))
      .toPromise()
      .catch((error) => {
        console.error(`Unable to zoom to the ${identifyKind(item).replace('-', ' ')}`, error);
        return undefined;
      });
  }

  /** The AGOL area of a ban, evacuation, Area Restriction or danger rating; null for any other result. */
  agolArea(item: any): Observable<Rings | undefined> | null {
    const p = item?.properties ?? {};
    const rings = (feature: any): Rings | undefined => feature?.geometry?.rings;
    switch (identifyKind(item)) {
      case 'ban':
        return this.agolService
          .getBansAndProhibitionsById(p.PROT_BAP_SYSID, { returnGeometry: true })
          .pipe(map((response) => rings(response?.features?.[0])));
      case 'evacuation':
        return this.agolService.getEvacOrdersById(p.EMRG_OAA_SYSID, { returnGeometry: true }).pipe(
          map((response) => {
            const features = response?.features ?? [];
            return rings(features.find((feature) => feature.attributes?.EVENT_NUMBER === p.EVENT_NUMBER) ?? features[0]);
          }),
        );
      case 'area-restriction': {
        // A quote in the name would end the SQL string.
        const name = String(p.NAME).replace(/'/g, "''");
        return this.agolService
          .getAreaRestrictions(`NAME='${name}'`, null, { returnGeometry: true })
          .pipe(map((response) => rings(response?.features?.[0])));
      }
      case 'danger-rating':
        return this.agolService
          .getDangerRatings(`PROT_DR_SYSID ='${p.PROT_DR_SYSID}'`, null, { returnGeometry: true })
          .pipe(map((response) => rings(response?.features?.[0])));
      default:
        return null;
    }
  }

  /** A new card has moved nothing yet, so back from it stays where it is. */
  cardOpened() {
    this.listView = null;
  }

  /** The view from before a card zoom. A second Zoom to keeps the first one. */
  cardZoomed(before: MapView) {
    this.listView ??= before;
  }

  /** Back from a card: to the list view, if the card moved the map. */
  backToList() {
    const view = this.listView;
    this.listView = null;
    if (view) {
      getActiveMap().$viewer.map.easeTo({ ...view, duration: FOCUS_DURATION_MS });
    }
  }

  /** Back from the list: to the BC view the map loads with. */
  showBc() {
    this.listView = null;
    const [west, south, east, north] = BC_EXTENT;
    // The same fit as SMK's setView at load, which does not apply a zoom given with an extent.
    getActiveMap().$viewer.map.fitBounds([[west, south], [east, north]], { padding: 0, duration: FOCUS_DURATION_MS });
  }

  /** Desktop Zoom to for an area: the map fits it and marks it. */
  fitArea(rings: Rings) {
    const smk = getActiveMap();
    zoomToCoords(smk, flatten(rings));
    highlightArea(smk, rings);
  }

  /** The Drive BC page of a road event. */
  driveBcUrl(item: any): string {
    const sourceId = item?.properties?.SOURCE_ID;
    return sourceId
      ? 'https://drivebc.ca/mobile/pub/events/id/' + sourceId + '.html'
      : (this.appConfigService.getConfig().externalAppConfig['driveBCUrl'] as unknown as string);
  }

  /** Desktop opens the event page in a new tab; DeviceRedirectGuard sends a phone to the Full Details page instead. */
  openDesktopDetails(item: any, incident?: any) {
    const kind = identifyKind(item);
    if (kind === 'wildfire') {
      if (incident?.fireYear && incident?.incidentNumberLabel) {
        this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel, source: [ResourcesRoutes.ACTIVEWILDFIREMAP] },
        });
      }
      this.trackDetails(item?.incident_number_label);
      return;
    }
    const p = item?.properties ?? {};
    const zoom = getActiveMap().$viewer?.map?.getZoom();
    const source = [ResourcesRoutes.ACTIVEWILDFIREMAP];
    const queryParams: Record<string, any> | null =
      kind === 'area-restriction' ? { eventType: 'area-restriction', eventNumber: p.PROT_RA_SYSID, eventName: p.NAME, source, zoom }
      : kind === 'ban' ? { eventType: 'ban', eventNumber: p.PROT_BAP_SYSID, eventName: p.ACCESS_PROHIBITION_DESCRIPTION, source, zoom }
      : kind === 'danger-rating' ? {
        eventType: 'danger-rating', eventNumber: p.PROT_DR_SYSID, eventName: p.DANGER_RATING_DESC,
        location: JSON.stringify(new LocationData()), source, zoom,
      }
      : kind === 'evacuation' ? { eventType: p.ORDER_ALERT_STATUS, id: p.EMRG_OAA_SYSID, eventNumber: p.EVENT_NUMBER, source, zoom }
      : null;
    if (queryParams) {
      const url = this.router.serializeUrl(this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], { queryParams }));
      this.capacitorService.redirect(url, true);
    }
  }

  /** The phone opens the Full Details page in place; the map page is the way back. */
  openPhoneDetails(item: any) {
    const p = item?.properties;
    if (!item?.layerId || !p) {
      return;
    }
    const location = new LocationData();
    const point = item.layerId === 'weather-stations'
      ? { latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }
      : item._identifyPoint;
    location.latitude = Number(point.latitude);
    location.longitude = Number(point.longitude);
    // For the way back from the Full Details page.
    const sourceZoom = getActiveMap().$viewer?.map?.getZoom();
    const back = { source: [ResourcesRoutes.ACTIVEWILDFIREMAP], sourceLatitude: location.latitude, sourceLongitude: location.longitude, sourceZoom };
    const fullDetails = (queryParams: Record<string, any>) => this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams });

    switch (identifyKind(item)) {
      case 'area-restriction':
        if (p.NAME) {
          fullDetails({ type: 'area-restriction', id: p.PROT_RA_SYSID, name: p.NAME, ...back });
        }
        break;
      case 'ban':
        if (p.PROT_BAP_SYSID) {
          fullDetails({ type: 'bans-prohibitions', id: p.PROT_BAP_SYSID, ...back });
        }
        break;
      case 'danger-rating':
        fullDetails({ type: 'danger-rating', id: p.DANGER_RATING_DESC, location: JSON.stringify(location), source: back.source, sysid: p.PROT_DR_SYSID, ...back });
        break;
      case 'evacuation': {
        const type = p.ORDER_ALERT_STATUS === 'Alert' ? 'evac-alert' : p.ORDER_ALERT_STATUS === 'Order' ? 'evac-order' : null;
        fullDetails({ type, id: p.EMRG_OAA_SYSID, name: p.EVENT_NAME, source: back.source, eventNumber: p.EVENT_NUMBER, ...back });
        break;
      }
      case 'wildfire': {
        const fireYear = p.fire_year || p.FIRE_YEAR;
        const incidentNumber = p.incident_number_label || p.FIRE_NUMBER;
        if (fireYear && incidentNumber) {
          this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
            queryParams: { fireYear, incidentNumber, source: [ResourcesRoutes.ACTIVEWILDFIREMAP] },
          });
        }
        this.trackDetails(p.incident_number_label);
        break;
      }
      case 'weather-station':
        this.router.navigate([ResourcesRoutes.WEATHER_DETAILS], {
          queryParams: { latitude: location.latitude, longitude: location.longitude, name: 'xx', source: ResourcesRoutes.ACTIVEWILDFIREMAP },
        });
        break;
    }
  }

  private trackDetails(id: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    snowPlowHelper(url, { action: 'incident_details_button_click', id, text: 'Full Details' });
  }
}
