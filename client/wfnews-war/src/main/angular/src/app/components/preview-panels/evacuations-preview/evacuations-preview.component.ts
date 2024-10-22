import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AGOLService } from '@app/services/AGOL-service';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, convertToDateYear, hidePanel, showPanel } from '@app/utils';
import { MapUtilityService } from '../map-share-service';

@Component({
  selector: 'wfnews-evacuations-preview',
  templateUrl: './evacuations-preview.component.html',
  styleUrls: ['./evacuations-preview.component.scss']
})
export class EvacuationsPreviewComponent {

  public data;
  convertToDateYear = convertToDateYear;

  constructor(
    private router: Router,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService,
    private capacitorService: CapacitorService,
  ) { }

  setContent(data) {
    this.data = data.properties;
    this.zoomIn();
  }

  closePanel() {
    hidePanel('desktop-preview');
  }

  goBack() {
    showPanel('identify-panel-wrapper');
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

  enterFullDetail() {
    if (this.data) {
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
      this.capacitorService.redirect(url, true);
    }
  }

  zoomIn() {
    this.agolService
      .getEvacOrdersById(this.data.EMRG_OAA_SYSID, {
        returnGeometry: true,
      })
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          // testing purpose: EMRG_OAA_SYSID (id) is supposed to be unique ID. However in AGOL TEST, all the evacucation orders and alerts' id are 0 (bad data), so we need to use the event number to filter them ou
          const matchingFeature = response.features.find(feature => feature.attributes.EVENT_NUMBER === this.data.EVENT_NUMBER);
          const polygonData = this.commonUtilityService.extractPolygonData(matchingFeature.geometry.rings);
          if (polygonData?.length) {
            this.mapUtilityService.fixPolygonToMap(polygonData, matchingFeature.geometry.rings);
          }
        }
      });
  }

}
