import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, formatDate, hidePanel, showPanel, displayDangerRatingDescription, getActiveMap } from '@app/utils';

@Component({
  selector: 'wfnews-danger-rating-preview',
  templateUrl: './danger-rating-preview.component.html',
  styleUrls: ['./danger-rating-preview.component.scss']
})
export class DangerRatingPreviewComponent {

  public data;
  formatDate = formatDate;
  displayDangerRatingDescription = displayDangerRatingDescription;

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
    const location = new LocationData();
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'danger-rating',
          eventNumber: this.data.PROT_DR_SYSID,
          eventName: this.data.DANGER_RATING_DESC,
          location: JSON.stringify(location),
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          zoom: currentZoomLevel
        },
      }),
    );
    this.capacitorService.redirect(url, true);
  }

  zoomIn(level?: number, polygon?: boolean) {
    this.agolService
      .getDangerRatings(
        `PROT_DR_SYSID ='${this.data.PROT_DR_SYSID}'`,
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
