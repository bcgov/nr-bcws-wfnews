import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, formatDate, getActiveMap, hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'wfnews-fire-ban-preview',
  templateUrl: './fire-ban-preview.component.html',
  styleUrls: ['./fire-ban-preview.component.scss']
})
export class FireBanPreviewComponent {
  
  constructor(
    private router: Router,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService
  ) {}
  public data;
  formatDate = formatDate;
  setContent(data) {
    this.data = data.properties;
  }

  closePanel() {  
    hidePanel('desktop-preview');
  }
  
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  enterFullDetail(){
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'ban',
          eventNumber: this.data.PROT_BAP_SYSID,
          eventName: this.data.ACCESS_PROHIBITION_DESCRIPTION,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP]
        },
      }),
    );
    window.open(url, '_blank');
  }

  zoomIn(level?: number, polygon?: boolean){
    const viewer = getActiveMap().$viewer;
    let long;
    let lat;
    this.data;
    this.agolService
    .getBansAndProhibitionsById(
      this.data.PROT_BAP_SYSID,
      {
        returnGeometry: true,
      },
    )
    .toPromise()
    .then((response) => {
      if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0){
        const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
        if (polygonData?.length) {
          this.mapUtilityService.fixPolygonToMap(polygonData, response.features[0].geometry.rings);

        }                
      }
    });
  }

  replaceCategoryDescription(description: string): string {
    if (description.includes("Category 1")) {
      return description.replace("Category 1", "Category 1 (Campfires)");
    }
    return description;
  }
  
}
