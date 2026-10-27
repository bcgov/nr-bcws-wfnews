import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';
import { MapConfigService } from '@app/services/map-config.service';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'bans-widget',
  templateUrl: './bans-widget.component.html',
  styleUrls: ['./bans-widget.component.scss'],
})
export class BansWidget implements OnInit, AfterViewInit {
  public startupComplete = false;
  public map: any = null;
  mapConfig = null;
  bansRestrictionsUrl = this.appConfigService.getConfig().externalAppConfig['bansRestrictionsUrl'].toString();

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
    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    const sld = (name: string) =>
      this.httpClient
        .get('assets/js/smk/' + name, { responseType: 'text' })
        .toPromise();

    Promise.all([sld('bans-cat1.sld'), sld('bans-cat2.sld'), sld('bans-cat3.sld')])
      .then(([cat1sld, cat2sld, cat3sld]) => {
        // SMK's wms layer takes the SLD and the CQL filter, so each of the
        // three categories is a layer in the config.
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

        return this.mapConfigService.getPreviewMapConfig({
          baseMap: 'navigation',
          maxZoom: 10,
          layers: [
            category('bans-cat3', cat3sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 3%'"),
            category('bans-cat2', cat2sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 2%'"),
            category('bans-cat1', cat1sld,
              "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 1%' OR ACCESS_PROHIBITION_DESCRIPTION LIKE '%Campfire%'"),
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
    this.map = smk.$viewer.map;
    this.cdr.detectChanges();
  }

  toggleMapView(){
    this.router.navigate
    this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
      queryParams: {
        featureType: 'British_Columbia_Bans_and_Prohibition_Areas',
      },
    });
  }
}
