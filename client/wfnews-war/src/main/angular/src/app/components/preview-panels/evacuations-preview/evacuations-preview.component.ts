import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, hidePanel, showPanel, convertToDateTimeTimeZone, getActiveMap } from '@app/utils';
import { MapUtilityService } from '../map-share-service';

@Component({
  selector: 'wfnews-evacuations-preview',
  templateUrl: './evacuations-preview.component.html',
  styleUrls: ['./evacuations-preview.component.scss']
})
export class EvacuationsPreviewComponent {

  constructor(
    private router: Router,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService
  ) {}

  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  public data;
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
  
  displayEvacTitle(item) {
    let prefix = null;
    if (item?.ORDER_ALERT_STATUS === 'Alert') {
      prefix = 'Evacuation Alert for ';
    } else if (item?.ORDER_ALERT_STATUS === 'Order') {
      prefix = 'Evacuation Order for ';
    }
    return prefix + item?.EVENT_NAME;
  }

  enterFullDetail(){
    if(this.data) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
          queryParams: {
            eventType: this.data.ORDER_ALERT_STATUS,
            id: this.data.EMRG_OAA_SYSID,
            eventNumber: this.data.EVENT_NUMBER,
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP]
          },
        }),
      );
      window.open(url, '_blank');
    }
  }

  zoomIn(){
    this.agolService
    .getEvacOrdersByEventNumber(this.data.EVENT_NUMBER, {
      returnGeometry: true,
    })
    .toPromise()
    .then((response) => {
      console.log(response)
      if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0){
        const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
        if (polygonData?.length) {
          this.mapUtilityService.fixPolygonToMap(polygonData, response.features[0].geometry.rings);
        }                
      }
    });
  }

}
