import { Component, OnInit } from '@angular/core';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import { snowPlowHelper } from '../../utils';
import L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';
import { Router } from '@angular/router';

@Component({
    selector: 'panel-evacuation-orders-and-alerts',
    templateUrl: './panel-evacuation-orders-and-alerts.component.html',
    styleUrls: ['./panel-evacuation-orders-and-alerts.component.scss'],
})
export class PanelEvacuationOrdersAndAlertsComponent implements OnInit {
  public evacOrders : EvacOrderOption[] = []

  public snowPlowHelper = snowPlowHelper

  constructor(private agolService: AGOLService,
              private mapConfigService: MapConfigService,
              private appConfigService: AppConfigService,
              private router: Router) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  async snowplow (link: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(url, {
      action: 'wildfire_evac_orders_view_link',
      link: link
    })
  }

  zoomToEvac (evac) {
    this.snowplow(`EVAC-ORDER-ZOOM-TO - ${evac.emrgOAAsysID}:${evac.eventName}`)
    this.mapConfigService.getMapConfig().then(() => {
      const SMK = window['SMK'];
      let viewer = null;
      for (const smkMap in SMK.MAP) {
        if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
          viewer = SMK.MAP[smkMap].$viewer;
        }
      }
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
            if (feature.type === 'Feature' && feature.layerId === 'evacuation-orders-and-alerts-wms' && feature.properties.ISSUING_AGENCY === evac.issuingAgency) {
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
