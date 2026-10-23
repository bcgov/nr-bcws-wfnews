import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import {
  RelatedTopicsLink,
  areaRestrictionRelatedTopics,
} from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { EventFeatureService } from '@app/services/event-feature.service';
import { PublishedIncidentService, SimpleIncident } from '@app/services/published-incident-service';
import {
  ResourcesRoutes,
  convertToDateYear,
  getStageOfControlIcon,
  getStageOfControlLabel,
} from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents, extentToParam } from '@app/utils/preview-map';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';
import { setDisplayColor } from '@app/utils';
import { WatchlistService } from '@app/services/watchlist-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { Meta } from '@angular/platform-browser';

export class AreaRestriction {
  public name: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public wildfireYear: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
  public fireCentre: string;
}

@Component({
  selector: 'wfnews-area-restrictions-full-details',
  templateUrl: './area-restrictions-full-details.component.html',
  styleUrls: ['./area-restrictions-full-details.component.scss'],
})
export class AreaRestrictionsFullDetailsComponent implements OnInit {
  // Closed for this visit only; the next full details page shows it again.
  bulletinDismissed = false;
  relatedTopicLinks: RelatedTopicsLink[] = areaRestrictionRelatedTopics(this.appConfigService);
  @Input() id: string;
  @Input() name: string;

  public restrictionData: AreaRestriction | null;
  public incidents: SimpleIncident[] | null;
  public map: any;
  // The polygon box, so View on Map can fit the area instead of a fixed zoom.
  public extent: number[] | undefined;

  public getStageOfControlLabel = getStageOfControlLabel;
  public getStageOfControlIcon = getStageOfControlIcon;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private eventFeatureService: EventFeatureService,
    private publishedIncidentService: PublishedIncidentService,
    private watchlistService: WatchlistService,
    private commonUtilityService: CommonUtilityService,
    private metaService: Meta,
    protected router: Router,
    private mapConfigService: MapConfigService,
    private fullDetailsMap: FullDetailsMapService

  ) {}

  async ngOnInit(): Promise<void> {
    await this.populateAreaRestrictionByID();
    this.initMap();
    this.metaService.updateTag({ property: 'og:title', content: this.restrictionData?.name });
    this.metaService.updateTag({ property: 'og:description', content: this.restrictionData?.name });

  }

  async initMap() {
    // Create map and append data to the map component
    const location = [
      Number(this.restrictionData.centroidLatitude),
      Number(this.restrictionData.centroidLongitude),
    ];

    const areaRestriction = await this.eventFeatureService.getAreaRestriction({ id: this.id, name: this.name });
    const rings = areaRestriction?.geometry?.rings;
    const polygonData = rings?.length ? this.commonUtilityService.extractPolygonData(rings) : [];
    if (polygonData.length) {
      this.createMap(location, this.commonUtilityService.getPolygonBond(polygonData));
    } else {
      this.createMap(location);
    }
  }

  async createMap(location: number[], bounds?: any) {
    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    this.extent = boundsToExtent(bounds);
    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: this.extent,
      layers: [
        {
          type: 'wms',
          id: 'restricted-areas',
          title: 'Area Restrictions',
          serviceUrl: databcUrl,
          layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP',
          version: '1.1.1',
          opacity: 0.5,
          isVisible: true,
        },
      ],
    });
    this.fullDetailsMap.setConfig(cfg);

    const smk = await this.fullDetailsMap.smk$
      .pipe(filter((v) => !!v), take(1))
      .toPromise();
    this.map = smk.$viewer.map;

    try {
      const incidents = await this.publishedIncidentService
        .fetchPublishedIncidentsList(
          0,
          9999,
          { latitude: location[0], longitude: location[1], radius: 100 } as any,
          null,
          null,
          ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'],
        )
        .toPromise();
      drawNearbyIncidents(smk, incidents?.collection);
    } catch (err) {
      console.error('Could not retrieve surrounding incidents');
    }

    this.cdr.detectChanges();
  }
  navToIncident(incident: any) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
        source: [ResourcesRoutes.FULL_DETAILS],
        sourceId: this.id,
        sourceType: 'area-restriction',
        name: this.name
      },
    });
  }

  async populateAreaRestrictionByID() {
    this.restrictionData = null;
    const areaRestriction = await this.eventFeatureService.getAreaRestriction({ id: this.id, name: this.name });
    if (areaRestriction?.attributes) {

      this.restrictionData = new AreaRestriction();

      this.restrictionData.name =
        areaRestriction.attributes.NAME.replace('Area Restriction', '').trim() +
        ' Area Restriction';
      this.restrictionData.fireCentre =
        areaRestriction.attributes.FIRE_CENTRE_NAME;
      this.restrictionData.issuedDate = convertToDateYear(
        areaRestriction.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
      );
      this.restrictionData.bulletinUrl =
        areaRestriction.attributes.BULLETIN_URL;
      this.restrictionData.centroidLatitude = areaRestriction.centroid.y;
      this.restrictionData.centroidLongitude = areaRestriction.centroid.x;

      await this.populateIncident(areaRestriction.geometry.rings);
    } else {
      console.error('Could not populate area restriction by ID: ' + this.id);
    }
  }

  async populateIncident(restrictionPolygon: [][]) {
    try {
      this.incidents =
        await this.publishedIncidentService.populateIncidentsByPoint(
          restrictionPolygon,
        );
    } catch (error) {
      console.error(
        'Error while populating associated incident for area restriction: ' +
          error,
      );
    }
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.restrictionData.centroidLongitude,
          latitude: this.restrictionData.centroidLatitude,
          areaRestriction: true,
          extent: extentToParam(this.extent),
        },
      });
    }, 200);
  }

  navToBulletinUrl() {
    window.open(this.restrictionData.bulletinUrl ? this.restrictionData.bulletinUrl 
      : this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string, '_blank');
  }

  bookmarkedIncidentNumbers(): string[] {
    return (this.incidents ?? [])
      .filter((incident) => this.onWatchlist(incident))
      .map((incident) => incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  onWatchlist(incident): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  toggleWatchlist(incident) {
    if (this.onWatchlist(incident)) {
      this.watchlistService.removeFromWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    } else {
      this.watchlistService.saveToWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }

  shareMobile() {
    this.commonUtilityService.shareMobile(this.restrictionData?.name);
  }
}
