import { ChangeDetectorRef, Component } from '@angular/core';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';

@Component({
    selector: 'incident-identify-panel',
    templateUrl: './incident-identify-panel.component.html',
    styleUrls: ['./incident-identify-panel.component.scss'],
})
export class IncidentIdentifyPanelComponent {
  public incident: any
  public evacOrders : EvacOrderOption[] = []
  public loaded = false

  constructor (protected cdr: ChangeDetectorRef,
               private agolService: AGOLService,
               private mapConfigService: MapConfigService) { }
  // if we want the "next" functionality, pass in the identify set
  setIncident (incident, featureInfo) {
    this.incident = incident
    console.warn('Incident panel created with', incident, featureInfo);

    // load from DB. Show a spinner while loading

    // load Evac orders near this incident
    this.getEvacOrders();

    // test data
    setTimeout(() => {
      this.incident = {
        name: 'My Super Cool Fire',
        fireCentre: 'Test Fire Centre',
        fireOfNote: true,
        status: 'ACTIVE',
        fireNumber: 'V123ABC',
        lastUpdated: new Date().toISOString(),
        discoveryDate: new Date().toISOString(),
        declaredOut: new Date().toISOString(),
        size: 66,
        location: 'This is an arbitrarily long set of text. I wrote this to identify if there would be padding or overflow issues, but as you can see, that does not appear to be the case. Nevertheless, this is an unrealistic amount of text for this box, but its always better to be safe than sorry. Wouldnt you agree?',
        traditionalTerritory: 'blah blah blah',
        wildfireCrews: true,
        aviation: true,
        heavyEquipment: false,
        incidentManagementTeam: true,
        structureProtection: false,
        geometry:  {
          x: -115,
          y: 50
        }
      }

      this.loaded = true;

      this.cdr.detectChanges();
    }, 2000);
  }

  close () {
    (document.getElementsByClassName('incident-details').item(0) as HTMLElement).remove();
    (document.getElementsByClassName('identify-panel').item(0) as HTMLElement).style.display = 'none';
  }

  goToIncidentDetail () {
    // route to the details page
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(this.incident.geometry, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
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
