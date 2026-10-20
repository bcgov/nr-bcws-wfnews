import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, showPanel, hidePanel } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { snowPlowHelper, displayItemTitle, setDisplayColor, getStageOfControlIcon, getStageOfControlLabel, convertToDateYear, getStageOfControlDescription, getActiveMap, formatNumber, addMarker, clearMarker, pingMarkerAgain } from '@app/utils';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { MapConfigService } from '@app/services/map-config.service';
import * as turf from '@turf/turf';

@Component({
  selector: 'wfnews-wildfire-preview',
  templateUrl: './wildfire-preview.component.html',
  styleUrls: ['./wildfire-preview.component.scss']
})
export class WildfirePreviewComponent implements OnDestroy{
  public data;
  incident: any
  loading = true;
  defaultZoomLevel = 13;

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private mapConfigService: MapConfigService
  ) { }

  ngOnDestroy(): void {
    this.removeMarker();
  }

  snowPlowHelper = snowPlowHelper;
  displayItemTitle = displayItemTitle;
  getStageOfControlIcon = getStageOfControlIcon;
  getStageOfControlLabel = getStageOfControlLabel;
  convertToDateYear = convertToDateYear;
  getStageOfControlDescription = getStageOfControlDescription;
  formatNumber = formatNumber;
  setDisplayColor = setDisplayColor;
  addMarker = addMarker;
  clearMarker = clearMarker;
  pingMarkerAgain = pingMarkerAgain;
  
  closePanel() {
    this.removeMarker();
    hidePanel('desktop-preview');
  }
  
  goBack(){
    this.removeMarker();
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  // Only the API's Incident is shown. The layers can be older than the API,
  // so a missing Incident gets a message, not the layer's attributes.
  async setContent(data) {
    this.data = data;
    this.cdr.detectChanges();

    let incidentNumberLabel, fireYear;
    
    if (this.data.layerId === "fire-perimeters") {
      incidentNumberLabel = data.properties?.FIRE_NUMBER;
      fireYear = data.properties?.FIRE_YEAR;
    } else {
      incidentNumberLabel = data.properties?.incident_number_label || data.incidentNumberLabel;
      fireYear = data.properties?.fire_year || data.fireYear;
    }

    if (incidentNumberLabel && fireYear) {
      // identify an incident
      try {
        const result = await this.publishedIncidentService
          .fetchPublishedIncident(incidentNumberLabel, fireYear)
          .toPromise();

        this.incident = result;
        this.zoomIn();
        this.addMarker(this.incident);
        
        this.cdr.markForCheck();

      } catch (error) {
        console.error('Unable to identify', error);
      }
    }
    this.loading = false;
    this.cdr.markForCheck();
  }

  zoomIn(){
    const long = Number(this.incident?.longitude);
    const lat = Number(this.incident?.latitude);

    if(long && lat) {
      this.mapConfigService.getMapConfig().then(() => {
        getActiveMap().$viewer.panToFeature(
          turf.point([long, lat]),
          this.defaultZoomLevel,
        );
        this.pingMarkerAgain();
      });
    }
  }

  enterFullDetail() {
    if (this.incident?.fireYear && this.incident?.incidentNumberLabel) {
      this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
        queryParams: {
          fireYear: this.incident.fireYear,
          incidentNumber: this.incident.incidentNumberLabel,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
        },
      });
    }
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.snowPlowHelper(url, {
      action: 'incident_details_button_click',
      id: this.data.incident_number_label,
      text: 'Full Details',
    });

  }

  removeMarker() {
    this.clearMarker();
  }

}
