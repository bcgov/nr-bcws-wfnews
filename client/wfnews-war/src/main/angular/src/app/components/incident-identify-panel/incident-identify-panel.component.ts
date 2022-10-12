import { ChangeDetectorRef, Component } from '@angular/core';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import { PublishedIncidentService } from '../../services/published-incident-service';

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
               private mapConfigService: MapConfigService,
               private publishedIncidentService: PublishedIncidentService) { }
  // if we want the "next" functionality, pass in the identify set
  setIncident (incidentRef, featureInfo) {
    console.warn('Incident panel created with', incidentRef, featureInfo);
    // load Evac orders near this incident
    this.publishedIncidentService.fetchPublishedIncident(incidentRef.guid).toPromise().then(result => {
      this.incident = result;

      this.incident.geometry = {
        x: result.longitude,
        y: result.latitude
      };

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

      this.incident.discoveryDate = new Date(this.incident.discoveryDate).toLocaleTimeString("en-US", options);
      this.incident.lastUpdatedTimestamp = new Date(this.incident.lastUpdatedTimestamp).toLocaleTimeString("en-US", options);
      this.incident.fireOfNoteInd = this.incident.fireOfNoteInd.trim().toUpperCase() === 'T';

      this.incident.heavyEquipmentResourcesInd = this.incident.heavyEquipmentResourcesInd.trim().toUpperCase() === 'T';
      this.incident.incidentMgmtCrewRsrcInd = this.incident.incidentMgmtCrewRsrcInd.trim().toUpperCase() === 'T';
      this.incident.structureProtectionRsrcInd = this.incident.structureProtectionRsrcInd.trim().toUpperCase() === 'T';
      this.incident.wildfireAviationResourceInd = this.incident.wildfireAviationResourceInd.trim().toUpperCase() === 'T';
      this.incident.wildfireCrewResourcesInd = this.incident.wildfireCrewResourcesInd.trim().toUpperCase() === 'T';

      this.getEvacOrders();

      this.loaded = true;

      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Failed to load Fire Info', err);
      // Kill the panel?
      this.loaded = true;
    });
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
