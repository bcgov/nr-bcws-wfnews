import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { displayDangerRatingDescription, ResourcesRoutes, setDisplayColor } from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents } from '@app/utils/preview-map';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-danger-rating-full-details',
  templateUrl: './danger-rating-full-details.component.html',
  styleUrls: ['./danger-rating-full-details.component.scss'],
})
export class DangerRatingFullDetailsComponent implements OnInit {
  @Input() rating: string;
  @Input() location: string;
  @Input() sysid: string;

  public map: any;

  displayDangerRatingDescription = displayDangerRatingDescription;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private metaService: Meta,
    private mapConfigService: MapConfigService,
    private fullDetailsMap: FullDetailsMapService
  ) { }

  async ngOnInit(): Promise<void> {
    this.initMap();
    this.metaService.updateTag({ property: 'og:title', content: `${this.rating} Danger Rating` });
    this.metaService.updateTag({ property: 'og:description', content: `${this.rating} Danger Rating` });
  }

  dangerDescription() {
    return displayDangerRatingDescription(this.rating);
  }

  async initMap() {
    // Create map and append data to the map component
    const locationData = JSON.parse(this.location) as LocationData;
    let bounds = null;
    this.agolService
      .getDangerRatings(
        `PROT_DR_SYSID ='${this.sysid}'`,
        null,
        {
          returnGeometry: true,
        },
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
          if (polygonData?.length) {
            bounds = this.commonUtilityService.getPolygonBond(polygonData);
            this.createMap(locationData, bounds);
          }
        }
      });
  }

  async createMap(locationData: LocationData, bounds?: any) {
    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: boundsToExtent(bounds),
      layers: [
        {
          type: 'wms',
          id: 'danger-rating',
          title: 'Danger Rating',
          serviceUrl: databcUrl,
          layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
          styleName: '7734',
          version: '1.1.1',
          opacity: 0.5,
          isVisible: true,
        },
      ],
    });
    this.fullDetailsMap.setConfig(cfg);

    // The parent builds the map, so wait for it before drawing on it.
    const smk = await this.fullDetailsMap.smk$
      .pipe(filter((v) => !!v), take(1))
      .toPromise();
    this.map = smk.$viewer.map;

    try {
      locationData.radius = 100;
      const incidents = await this.publishedIncidentService
        .fetchPublishedIncidentsList(0, 9999, locationData, null, null, [
          'OUT_CNTRL',
          'HOLDING',
          'UNDR_CNTRL',
        ])
        .toPromise();
      drawNearbyIncidents(smk, incidents?.collection);
    } catch (err) {
      console.error('Could not retrieve surrounding incidents');
    }

    this.cdr.detectChanges();
  }

  navToMap() {
    setTimeout(() => {
      const locationData = JSON.parse(this.location) as LocationData;
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          dangerRating: true,
        },
      });
    }, 200);
  }

  navToCurrentRestrictions() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
      'currentRestrictions'
      ] as unknown as string,
      '_blank',
    );
  }

  navToDangerSummary() {
    window.open(
      'https://www2.gov.bc.ca/gov/content?id=3DDDD01FBF674A619B3178603539E493',
      '_blank',
    );
  }

  navToDangerClass() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
      'dangerSummary'
      ] as unknown as string,
      '_blank',
    );
  }

  navToHighRiskActivities() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
      'highRiskActivities'
      ] as unknown as string,
      '_blank',
    );
  }

  shareMobile() {
    this.commonUtilityService.shareMobile(`${this.rating} Danger Rating`);
  }
}
