import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import {
  RelatedTopicsLink,
  dangerRatingRelatedTopics,
} from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { EventFeatureService } from '@app/services/event-feature.service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { displayDangerRatingDescription, ResourcesRoutes, setDisplayColor } from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents, extentToParam } from '@app/utils/preview-map';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-danger-rating-full-details',
  templateUrl: './danger-rating-full-details.component.html',
  styleUrls: ['./danger-rating-full-details.component.scss'],
})
export class DangerRatingFullDetailsComponent implements OnInit {
  relatedTopicLinks: RelatedTopicsLink[] = dangerRatingRelatedTopics(this.appConfigService);
  @Input() rating: string;
  @Input() location: string;
  @Input() sysid: string;

  public map: any;
  // The polygon box, so View on Map can fit the area instead of a fixed zoom.
  public extent: number[] | undefined;

  displayDangerRatingDescription = displayDangerRatingDescription;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route,
    private eventFeatureService: EventFeatureService,
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
    const dangerRating = await this.eventFeatureService.getDangerRating(this.sysid);
    const rings = dangerRating?.geometry?.rings;
    const polygonData = rings?.length ? this.commonUtilityService.extractPolygonData(rings) : [];
    if (polygonData.length) {
      this.createMap(locationData, this.commonUtilityService.getPolygonBond(polygonData));
    }
  }

  async createMap(locationData: LocationData, bounds?: any) {
    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    this.extent = boundsToExtent(bounds);
    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: this.extent,
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
          extent: extentToParam(this.extent),
        },
      });
    }, 200);
  }

  shareMobile() {
    this.commonUtilityService.shareMobile(`${this.rating} Danger Rating`);
  }
}
