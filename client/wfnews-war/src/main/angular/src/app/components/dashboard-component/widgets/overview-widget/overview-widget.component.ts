import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import * as L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'overview-widget',
  templateUrl: './overview-widget.component.html',
  styleUrls: ['./overview-widget.component.scss'],
})
export class OverviewWidget implements OnInit, AfterViewInit {
  public startupComplete = false;
  public map: any = null;
  public showViewMapButton = false;

  constructor(
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private el: ElementRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const observer = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }).observe(this.el.nativeElement);
  }

  ngAfterViewInit(): void {
    // load the incident points from the API
    const url = `${
      this.appConfigService.getConfig().rest['wfnews']
    }/publicPublishedIncident/features?stageOfControl=`;
    Promise.all([
      this.httpClient
        .get(url + 'FIRE_OF_NOTE', {
          headers: {
            apikey:
              this.appConfigService.getConfig().application['wfnewsApiKey'],
          },
        })
        .toPromise(),
      this.httpClient
        .get(url + 'OUT_CNTRL', {
          headers: {
            apikey:
              this.appConfigService.getConfig().application['wfnewsApiKey'],
          },
        })
        .toPromise(),
      this.httpClient
        .get(url + 'HOLDING', {
          headers: {
            apikey:
              this.appConfigService.getConfig().application['wfnewsApiKey'],
          },
        })
        .toPromise(),
      this.httpClient
        .get(url + 'UNDR_CNTRL', {
          headers: {
            apikey:
              this.appConfigService.getConfig().application['wfnewsApiKey'],
          },
        })
        .toPromise(),
    ]).then(([firesOfNote, outOfControl, holding, underControl]) => {
      // set startupComplete to true
      this.startupComplete = true;
      this.cdr.detectChanges();

      // Create map and append data to the map component
      const southWest = L.latLng(60.2, -116);
        const northEast = L.latLng(49, -136.3);
        const bounds = L.latLngBounds(southWest, northEast);
        const location = [Number(55), Number(-126)];

      this.map = L.map('dashboard-map', {
        maxBounds: bounds,
        attributionControl: false,
        zoomControl: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        trackResize: false,
        scrollWheelZoom: false,
        maxZoom: 10,
      }).setView(location, 10);

      // configure map data
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      const databcUrl = this.appConfigService
        .getConfig()
        ['mapServices']['openmapsBaseUrl'].toString();
      L.tileLayer
        .wms(databcUrl, {
          layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_CURRENT_FIRE_POLYS_SP',
          styles: '1751_1752',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
        })
        .addTo(this.map);

      const fonIcon = L.icon({
        iconUrl: '/assets/images/local_fire_department.png',
        iconSize: [20, 20],
        shadowAnchor: [4, 42],
        shadowSize: [31, 31],
      });
      const ucIcon = L.icon({
        iconUrl: '/assets/images/svg-icons/under-control.svg',
        iconSize: [10, 10],
        shadowAnchor: [4, 32],
        shadowSize: [10, 10],
      });
      const holdIcon = L.icon({
        iconUrl: '/assets/images/svg-icons/being-held.svg',
        iconSize: [10, 10],
        shadowAnchor: [4, 32],
        shadowSize: [10, 10],
      });
      const oocIcon = L.icon({
        iconUrl: '/assets/images/svg-icons/out-of-control.svg',
        iconSize: [10, 10],
        shadowAnchor: [4, 32],
        shadowSize: [10, 10],
      });

      try {
        this.addDataToMap(underControl, ucIcon);
        this.addDataToMap(holding, holdIcon);
        this.addDataToMap(outOfControl, oocIcon);
        this.addDataToMap(firesOfNote, fonIcon);
    } catch (err) {
      console.error(err);
    }

      this.map.fitBounds(bounds);

      this.cdr.detectChanges();
    });
  }

  addDataToMap(data, icon) {
    try {
      L.geoJSON(data, {
        pointToLayer(feature: any, latlng: any) {
          return L.marker(latlng, { icon: icon });
        },
      }).addTo(this.map);
    } catch(err) {
      console.error('Feature data not loaded. No data found.');
    }
  }

  toggleMapView(){
    this.showViewMapButton = !this.showViewMapButton;
    this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
  }
}
