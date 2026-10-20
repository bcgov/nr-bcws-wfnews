import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CapacitorService } from '@app/services/capacitor-service';
import { ResourcesRoutes, getActiveMap, snowPlowHelper } from '@app/utils';
import { identifyKind } from '@app/utils/identify-results';
import { highlightArea, zoomToCoords } from '@app/utils/preview-map';
import { AppConfigService } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Rings = number[][][];

const flatten = <T>(nested: T[][]): T[] => [].concat(...(nested || []));

/** Zoom to and Full Details for an identify result, on the phone and on desktop. */
@Injectable({ providedIn: 'root' })
export class IdentifyActionsService {
  constructor(
    private router: Router,
    private agolService: AGOLService,
    private appConfigService: AppConfigService,
    private capacitorService: CapacitorService,
  ) {}

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

  /** Desktop Zoom to for an area: the map fits it and marks it. */
  fitArea(rings: Rings) {
    const smk = getActiveMap();
    zoomToCoords(smk, flatten(rings));
    highlightArea(smk, rings);
  }

  /** Desktop Zoom to for a result whose area came with the identify answer. */
  fitIdentifyGeometry(item: any) {
    const coordinates = item?.geometry?.coordinates;
    if (!coordinates?.length) {
      return;
    }
    if (identifyKind(item) === 'protected-land') {
      this.fitArea(coordinates);
      return;
    }
    // A local authority can be a MultiPolygon, one level deeper than a Polygon.
    const isPoint = (value: any) => typeof value?.[0] === 'number';
    if (isPoint(coordinates[0][0]?.[0])) {
      const smk = getActiveMap();
      zoomToCoords(smk, flatten(flatten(coordinates)));
      highlightArea(smk, flatten(coordinates));
    } else if (isPoint(coordinates[0]?.[0])) {
      const smk = getActiveMap();
      zoomToCoords(smk, coordinates[0]);
      highlightArea(smk, coordinates);
    }
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
