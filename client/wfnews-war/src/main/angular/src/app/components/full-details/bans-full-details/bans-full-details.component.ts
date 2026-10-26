import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { INFORMATION_TEXTS } from '@app/constants';
import {
  RelatedTopicsLink,
  fireBanRelatedTopics,
} from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { EventFeatureService } from '@app/services/event-feature.service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateYear, setDisplayColor } from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { drawNearbyIncidents, ringsToExtent } from '@app/utils/preview-map';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';

export class BanProhibition {
  public id: string;
  public type: string;
  public description: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
  public fireCentre: string;
  public isCat1 = false;
  public isCat2 = false;
  public isCat3 = false;
}

@Component({
  selector: 'wfnews-bans-full-details',
  templateUrl: './bans-full-details.component.html',
  styleUrls: ['./bans-full-details.component.scss'],
})
export class BansFullDetailsComponent implements OnInit {
  // Closed for this visit only; the next full details page shows it again.
  bulletinDismissed = false;
  @Input() id: string;

  public banData: BanProhibition | null;
  public map: any;

  bansDecisionText = INFORMATION_TEXTS.BANS_DECISION_INFO;
  relatedTopicLinks: RelatedTopicsLink[] = fireBanRelatedTopics(this.appConfigService);

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private eventFeatureService: EventFeatureService,
    private publishedIncidentService: PublishedIncidentService,
    private httpClient: HttpClient,
    private route: Route,
    private commonUtilityService: CommonUtilityService,
    private metaService: Meta,
    private mapConfigService: MapConfigService,
    private fullDetailsMap: FullDetailsMapService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.populateBansByID();
    this.initMap();
    this.metaService.updateTag({ property: 'og:title', content: `Fire Ban on ${this.banData.description} Open Fires`});
    this.metaService.updateTag({ property: 'og:description', content: `Fire Ban on ${this.banData.description} Open Fires` });
  }

  async initMap() {
    const sld = (name: string) =>
      this.httpClient
        .get('assets/js/smk/' + name, { responseType: 'text' })
        .toPromise();

    const [cat1sld, cat2sld, cat3sld, ban] = await Promise.all([
      sld('bans-cat1.sld'),
      sld('bans-cat2.sld'),
      sld('bans-cat3.sld'),
      this.eventFeatureService.getBan(this.id),
    ]);

    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    // SMK's wms layer takes the SLD and the CQL filter directly.
    const category = (id: string, sldBody: string, where: string) => ({
      type: 'wms',
      id,
      title: id,
      serviceUrl: databcUrl,
      layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
      version: '1.1.1',
      sld: sldBody,
      where,
      opacity: 0.5,
      isVisible: true,
    });

    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: ringsToExtent(ban?.geometry?.rings),
      layers: [
        category('bans-cat3', cat3sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 3%'"),
        category('bans-cat2', cat2sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 2%'"),
        category('bans-cat1', cat1sld,
          "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 1%' OR ACCESS_PROHIBITION_DESCRIPTION LIKE '%Campfire%'"),
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
          {
            latitude: Number(this.banData.centroidLatitude),
            longitude: Number(this.banData.centroidLongitude),
            radius: 100,
          } as any,
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

  async populateBansByID() {
    this.banData = null;
    const ban = await this.eventFeatureService.getBan(this.id);
    if (ban?.attributes) {

      this.banData = new BanProhibition();

      this.banData.id = ban.attributes.PROT_BAP_SYSID;
      this.banData.type = ban.attributes.TYPE;
      this.banData.description = ban.attributes.ACCESS_PROHIBITION_DESCRIPTION;
      this.banData.fireCentre =
        ban.attributes.FIRE_CENTRE_NAME + ' Fire Centre';
      this.banData.issuedDate = convertToDateYear(
        ban.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
      );
      this.banData.bulletinUrl = ban.attributes.BULLETIN_URL;
      this.banData.centroidLatitude = ban.centroid.y;
      this.banData.centroidLongitude = ban.centroid.x;
      this.banData.isCat1 =
        this.banData.description.includes('1') ||
        this.banData.description.toLowerCase().includes('campfires');
      this.banData.isCat2 = this.banData.description.includes('2');
      this.banData.isCat3 = this.banData.description.includes('3');
    } else {
      // What happens when this fails?
    }
  }

  navToMap() {
    setTimeout(() => {
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.banData.centroidLongitude,
          latitude: this.banData.centroidLatitude,
          bansProhibitions: true,
        },
      });
    }, 200);
  }

  navToBulletinUrl() {
    window.open(this.banData.bulletinUrl ? this.banData.bulletinUrl 
      : this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string, '_blank');
  }

  shareMobile() {
    this.commonUtilityService.shareMobile(`Fire Ban on ${this.banData.description} Open Fires`);
  }
}
