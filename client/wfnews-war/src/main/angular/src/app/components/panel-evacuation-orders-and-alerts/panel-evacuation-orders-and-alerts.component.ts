import { Component, OnInit } from '@angular/core';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import L from 'leaflet';

@Component({
    selector: 'panel-evacuation-orders-and-alerts',
    templateUrl: './panel-evacuation-orders-and-alerts.component.html',
    styleUrls: ['./panel-evacuation-orders-and-alerts.component.scss'],
})
export class PanelEvacuationOrdersAndAlertsComponent implements OnInit {
  public evacOrders : EvacOrderOption[] = []

  constructor(private agolService: AGOLService,
              private mapConfigService: MapConfigService,) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  zoomToEvac (evac) {
    this.mapConfigService.getMapConfig().then(() => {
      const SMK = window['SMK'];
      const viewer = SMK.MAP[1].$viewer;
      viewer.panToFeature(window['turf'].point([evac.centroid.x, evac.centroid.y]), 10)

      const map = viewer.map;
      let latlngPoint = new L.LatLng(evac.centroid.y, evac.centroid.x);
      map.fireEvent('click', {
        latlng: latlngPoint,
        layerPoint: map.latLngToLayerPoint(latlngPoint),
        containerPoint: map.latLngToContainerPoint(latlngPoint)
      });

      setTimeout(() => {
        for (const set in viewer.identified.featureSet) {
          if (Object.prototype.hasOwnProperty.call(viewer.identified.featureSet, set)) {
            const feature = viewer.identified.featureSet[set]
            if (feature.type === 'Feature' && feature.layerId === 'evacuation-orders-and-alerts-wms') {
              viewer.identified.pick(feature.id)
              break;
            }
          }
        }
      }, 1000)
      viewer.identified.remove('weather-stations')
    })
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          console.log(element)
          console.log(response)
          this.evacOrders.push({
            eventName: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
            issuingAgency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
            centroid: element.centroid
          })
        }
      }
    })
  }
}
