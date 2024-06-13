import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, showPanel, hidePanel } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { snowPlowHelper, displayItemTitle, setDisplayColor, getStageOfControlIcon, getStageOfControlLabel, convertToDateYear, getDescription, getActiveMap, formatNumber } from '@app/utils';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { MapConfigService } from '@app/services/map-config.service';
import * as L from 'leaflet';

@Component({
  selector: 'wfnews-wildfire-preview',
  templateUrl: './wildfire-preview.component.html',
  styleUrls: ['./wildfire-preview.component.scss']
})
export class WildfirePreviewComponent implements OnDestroy{
  public data;
  incident: any
  defaultZoomLevel = 13;
  private marker: any;
  private markerAnimation;

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
  getDescription = getDescription;
  formatNumber = formatNumber;
  setDisplayColor = setDisplayColor;

  closePanel() {
    this.removeMarker();
    hidePanel('desktop-preview');
  }
  
  goBack(){
    this.removeMarker();
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  async setContent(data) {
    this.data = data;
    if (data.properties?.incident_number_label && data.properties?.fire_year) {
      // identify an incident
      try {
        const result = await this.publishedIncidentService
          .fetchPublishedIncident(data.properties.incident_number_label, data.properties.fire_year)
          .toPromise();

        this.incident = result;
        console.log(result)
        this.zoomIn();
        this.addMarker(this.incident);
        
        this.cdr.markForCheck();

      } catch (error) {
        console.error('Unable to identify', error);

      }
    }
  }

  zoomIn(){
    const long = Number(this.incident?.longitude);
    const lat = Number(this.incident?.latitude);

    if(long && lat) {
      this.mapConfigService.getMapConfig().then(() => {
        getActiveMap().$viewer.panToFeature(
          window['turf'].point([long, lat]),
          this.defaultZoomLevel,
        );
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

  addMarker(incident: any) {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }

    const pointerIcon = L.divIcon({
      iconSize: [20, 20],
      iconAnchor: [12, 12],
      popupAnchor: [10, 0],
      shadowSize: [0, 0],
      className: 'animated-icon',
    });
    this.marker = L.marker(
      [Number(incident.latitude), Number(incident.longitude)],
      { icon: pointerIcon },
    );
    this.marker.on('add', function() {
      const icon: any = document.querySelector('.animated-icon');
      icon.style.backgroundColor = setDisplayColor(incident.stageOfControlCode);

      this.markerAnimation = setInterval(() => {
        icon.style.width = icon.style.width === '10px' ? '20px' : '10px';
        icon.style.height = icon.style.height === '10px' ? '20px' : '10px';
        icon.style.marginLeft = icon.style.width === '20px' ? '-10px' : '-5px';
        icon.style.marginTop = icon.style.width === '20px' ? '-10px' : '-5px';
        icon.style.boxShadow =
          icon.style.width === '20px'
            ? '4px 4px 4px rgba(0, 0, 0, 0.65)'
            : '0px 0px 0px transparent';
      }, 1000);
    });

    const viewer = getActiveMap().$viewer;
    this.marker.addTo(viewer.map);
  }

  removeMarker() {
    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }
    const icon = document.querySelector('.animated-icon') as HTMLElement;
    icon?.remove();
  }

}
