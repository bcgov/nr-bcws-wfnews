import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { WatchlistService } from '../../services/watchlist-service';
import {
  ResourcesRoutes,
  convertFireNumber,
  convertToFireCentreDescription,
  getActiveMap,
} from '../../utils';
import { CapacitorService } from '@app/services/capacitor-service';

@Component({
  selector: 'incident-identify-panel',
  templateUrl: './incident-identify-panel.component.html',
  styleUrls: ['./incident-identify-panel.component.scss'],
})
export class IncidentIdentifyPanelComponent {
  public incident: any;
  public evacOrders: EvacOrderOption[] = [];
  public loaded = false;
  public failedToLoad = false;

  public featureSet;
  public identifiedFeatures = [];
  public index = 0;
  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;

  constructor(
    protected cdr: ChangeDetectorRef,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private router: Router,
    private watchlistService: WatchlistService,
    private mapConfigService: MapConfigService,
    private capacitorService: CapacitorService,
  ) {}

  // if we want the "next" functionality, pass in the identify set
  async setIncident(incidentRef, identifyList, setIndex = true) {
    this.loaded = false;
    this.featureSet = identifyList;
    // clear the feature list
    this.identifiedFeatures = [];
    let count = 1; // index counter for the next/previous buttons
    for (const fid in identifyList) {
      if (Object.hasOwn(identifyList, fid)) {
        const feature = identifyList[fid];
        if (
          [
            'active-wildfires-fire-of-note',
            'active-wildfires-out-of-control',
            'active-wildfires-holding',
            'active-wildfires-under-control',
            'active-wildfires-out',
          ].includes(feature.layerId)
        ) {
          this.identifiedFeatures.push(feature);
          // if we want to reset the index, we need to compare the input feature ID to the identified feature ID
          if (setIndex) {
            const sourceId = feature.properties.FIRE_NUMBER
              ? feature.properties.FIRE_NUMBER
              : feature.properties.incident_number_label;
            const compareId = incidentRef.FIRE_NUMBER
              ? incidentRef.FIRE_NUMBER
              : incidentRef.incident_number_label;
            if (sourceId && compareId && sourceId === compareId) {
              this.index = count;
            }
            count++;
          }
        }
      }
    }

    // get the fire number, either from a perimeter or active fire feature
    const id = incidentRef.FIRE_NUMBER
      ? incidentRef.FIRE_NUMBER
      : incidentRef.incident_number_label;
    const year = incidentRef.fire_year;

    this.publishedIncidentService
      .fetchPublishedIncident(id, year)
      .toPromise()
      .then(async (result) => {
        this.incident = result;

        this.incident.geometry = {
          x: result.longitude,
          y: result.latitude,
        };

        // date formatting
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        this.incident.discoveryDate = this.incident.discoveryDate
          ? new Date(this.incident.discoveryDate).toLocaleTimeString(
              'en-US',
              options,
            )
          : 'Pending';
        this.incident.declaredOutDate = this.incident.declaredOutDate
          ? new Date(this.incident.declaredOutDate).toLocaleTimeString(
              'en-US',
              options,
            )
          : 'Pending';
        this.incident.lastUpdatedTimestamp = this.incident.lastUpdatedTimestamp
          ? new Date(this.incident.lastUpdatedTimestamp).toLocaleTimeString(
              'en-US',
              options,
            )
          : 'Pending';

        // load evac orders nearby
        await this.getEvacOrders().catch((e) => console.error(e));
        await this.getExternalUriEvacOrders().catch((e) => console.error(e));
        // then, set loaded to true and refresh the page
        this.loaded = true;

        this.cdr.detectChanges();
      })
      .catch((err) => {
        console.error('Failed to load Fire Info', err);
        this.loaded = true;
        this.failedToLoad = true;
      });
  }

  close() {
    // (
    //   document.getElementsByClassName('incident-details').item(0) as HTMLElement
    // ).remove();
    (
      document.getElementsByClassName('identify-panel').item(0) as HTMLElement
    ).style.display = 'none';
  }

  async goToIncidentDetail() {
    // this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], { queryParams: { incidentNumber: this.incident.incidentNumberLabel } })
    const device = await this.capacitorService.checkDeviceSystem();
    // IOS standalone app can not open url in blank page.
    if (device.operatingSystem === 'ios') {
      this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
        queryParams: {
          fireYear: this.incident.fireYear,
          incidentNumber: this.incident.incidentNumberLabel,
        },
      });
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: {
            fireYear: this.incident.fireYear,
            incidentNumber: this.incident.incidentNumberLabel,
          },
        }),
      );
      window.open(url, '_blank');
    }
  }

  next() {
    this.index = this.index + 1;
    if (this.index > this.identifiedFeatures.length) {
      this.index = 1;
    }

    this.setIncident(
      this.identifiedFeatures[this.index - 1].properties,
      this.featureSet,
      false,
    ).catch((e) => console.error(e));
  }

  previous() {
    this.index = this.index - 1;
    if (this.index <= 0) {
      this.index = this.identifiedFeatures.length;
    }

    this.setIncident(
      this.identifiedFeatures[this.index - 1].properties,
      this.featureSet,
      false,
    ).catch((e) => console.error(e));
  }

  onWatchlist(): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(
        this.incident.fireYear + ':' + this.incident.incidentNumberLabel,
      );
  }

  addToWatchlist() {
    this.watchlistService.saveToWatchlist(
      this.incident.fireYear,
      this.incident.incidentNumberLabel,
    );
  }

  removeFromWatchlist() {
    this.watchlistService.removeFromWatchlist(
      this.incident.fireYear,
      this.incident.incidentNumberLabel,
    );
  }

  getEvacOrders() {
    return this.agolService
      .getEvacOrdersByEventNumber(this.incident.incidentNumberLabel, {
        returnCentroid: true,
        returnGeometry: false,
      })
      .toPromise()
      .then((response) => {
        if (response.features) {
          for (const element of response.features) {
            this.evacOrders.push({
              eventName: element.attributes.EVENT_NAME,
              eventType: element.attributes.EVENT_TYPE,
              orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
              issuingAgency: element.attributes.ISSUING_AGENCY,
              preOcCode: element.attributes.PREOC_CODE,
              emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
              centroid: element.centroid,
            });
          }
        }
      });
  }

  async getExternalUriEvacOrders() {
    return this.publishedIncidentService
      .fetchExternalUri(this.incident.incidentNumberLabel)
      .toPromise()
      .then((results) => {
        if (results?.collection?.length > 0) {
          for (const uri of results.collection) {
            if (uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
              this.evacOrders.push({
                eventName: uri.externalUriDisplayLabel,
                eventType: uri.externalUriCategoryTag.split(':')[1],
                orderAlertStatus: uri.externalUriCategoryTag.split(':')[1],
                issuingAgency: 'Pending',
                preOcCode: 'NA',
                emrgOAAsysID: 0,
                uri: uri.externalUri,
                centroid: [0, 0],
                externalUri: true
              });
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  ZoomIn() {
    const long = Number(this.incident.longitude);
    const lat = Number(this.incident.latitude);

    this.mapConfigService.getMapConfig().then(() => {
      getActiveMap().$viewer.panToFeature(
        window['turf'].point([long, lat]),
        15,
      );
    });
  }
}
