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
  selector: 'bans-widget',
  templateUrl: './bans-widget.component.html',
  styleUrls: ['./bans-widget.component.scss'],
})
export class BansWidget implements OnInit, AfterViewInit {
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
    Promise.all([
      this.httpClient
        .get('assets/js/smk/bans-cat1.sld', { responseType: 'text' })
        .toPromise(),
      this.httpClient
        .get('assets/js/smk/bans-cat2.sld', { responseType: 'text' })
        .toPromise(),
      this.httpClient
        .get('assets/js/smk/bans-cat3.sld', { responseType: 'text' })
        .toPromise(),
    ]).then(([cat1sld, cat2sld, cat3sld]) => {
      // set startupComplete to true
      this.startupComplete = true;
      this.cdr.detectChanges();

      // Create map and append data to the map component
      const southWest = L.latLng(60.2, -116);
        const northEast = L.latLng(49, -136.3);
        const bounds = L.latLngBounds(southWest, northEast);
        const location = [Number(55), Number(-126)];

      this.map = L.map('bans-map', {
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
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat3sld,
          cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 3%\'',
          opacity: 0.5,
        })
        .addTo(this.map);

      L.tileLayer
        .wms(databcUrl, {
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat2sld,
          cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 2%\'',
          opacity: 0.5,
        })
        .addTo(this.map);

      L.tileLayer
        .wms(databcUrl, {
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat1sld,
          cql_filter:
            'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 1%\' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Campfire%\'',
          opacity: 0.5,
        })
        .addTo(this.map);

      this.map.fitBounds(bounds);
      this.cdr.detectChanges();
    });
  }

  toggleMapView(){
    this.showViewMapButton = !this.showViewMapButton;
    this.router.navigate
    this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
      queryParams: {
        featureType: 'British_Columbia_Bans_and_Prohibition_Areas',
      },
    });
  }
}
