import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { AGOLService } from '@app/services/AGOL-service';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, formatDate, getActiveMap, hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'wfnews-area-restriction-preview',
  templateUrl: './area-restriction-preview.component.html',
  styleUrls: ['./area-restriction-preview.component.scss']
})
export class AreaRestrictionPreviewComponent {
  public data;
  formatDate = formatDate;

  constructor(
    private router: Router,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService,
    private capacitorService: CapacitorService,
  ) { }

  setContent(data) {
    this.data = data.properties;
  }

  closePanel() {
    hidePanel('desktop-preview');
  }

  goBack() {
    showPanel('identify-panel-wrapper');
    hidePanel('desktop-preview');
  }


  enterFullDetail() {
    const currentZoomLevel = getActiveMap().$viewer?.map?._zoom;
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'area-restriction',
          eventNumber: this.data.PROT_RA_SYSID,
          eventName: this.data.NAME,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          zoom: currentZoomLevel
        },
      }),
    );
    this.capacitorService.redirect(url, true);
  }

  zoomIn(level?: number, polygon?: boolean) {
    this.agolService
      .getAreaRestrictions(
        `NAME='${this.data.NAME}'`,
        null,
        {
          returnGeometry: true,
        },
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
          if (polygonData?.length) {
            this.mapUtilityService.fixPolygonToMap(polygonData, response.features[0].geometry.rings);
          }
        }
      });
  }

}
