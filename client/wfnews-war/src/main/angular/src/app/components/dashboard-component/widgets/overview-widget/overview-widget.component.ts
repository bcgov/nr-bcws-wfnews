import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { AppConfigService } from '@wf1/core-ui';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';
import { fireOfNote, stageDot } from '@app/utils/preview-map';

@Component({
  selector: 'overview-widget',
  templateUrl: './overview-widget.component.html',
  styleUrls: ['./overview-widget.component.scss'],
})
export class OverviewWidget implements OnInit, AfterViewInit {
  public startupComplete = false;
  public map: any = null;
  mapConfig = null;
  smk: any;
  private incidents: any = {};
  public showViewMapButton = false;

  constructor(
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private el: ElementRef,
    private router: Router,
    private mapConfigService: MapConfigService,
  ) {}

  ngOnInit(): void {
    new ResizeObserver(() => {
      this.map?.resize();
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
      this.incidents = { firesOfNote, outOfControl, holding, underControl };

      const databcUrl = this.appConfigService
        .getConfig()['mapServices']['openmapsBaseUrl'].toString();

      return this.mapConfigService.getPreviewMapConfig({
        baseMap: 'navigation',
        maxZoom: 10,
        layers: [
          {
            type: 'wms',
            id: 'current-fire-polys',
            title: 'Fire perimeters',
            serviceUrl: databcUrl,
            layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_CURRENT_FIRE_POLYS_SP',
            styleName: '1751_1752',
            version: '1.1.1',
            isVisible: true,
          },
        ],
      });
    })
    .then((cfg) => {
      this.mapConfig = [cfg];
      this.startupComplete = true;
      this.cdr.detectChanges();
    });
  }

  initMap(smk: any) {
    this.smk = smk;
    this.map = smk.$viewer.map;

    // One acetate per stage of control, drawn least urgent first so a fire of
    // note ends up on top.
    try {
      // The widget's own stage icons, so the legend still matches.
      this.addDataToMap('under-control', this.incidents.underControl,
        () => stageDot('UNDR_CNTRL'));
      this.addDataToMap('holding', this.incidents.holding,
        () => stageDot('HOLDING'));
      this.addDataToMap('out-of-control', this.incidents.outOfControl,
        () => stageDot('OUT_CNTRL'));
      this.addDataToMap('fires-of-note', this.incidents.firesOfNote,
        () => fireOfNote(20));
    } catch (err) {
      console.error(err);
    }

    this.cdr.detectChanges();
  }

  addDataToMap(acetate: string, data: any, marker: () => HTMLElement) {
    try {
      this.smk.showFeature(acetate, data, { htmlMarker: marker });
    } catch (err) {
      console.error('Feature data not loaded. No data found.');
    }
  }

  toggleMapView(){
    this.showViewMapButton = !this.showViewMapButton;
    this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
  }
}
