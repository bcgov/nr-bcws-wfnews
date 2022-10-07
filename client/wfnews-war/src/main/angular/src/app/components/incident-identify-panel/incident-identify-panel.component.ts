import { Component } from '@angular/core';

@Component({
    selector: 'incident-identify-panel',
    templateUrl: './incident-identify-panel.component.html',
    styleUrls: ['./incident-identify-panel.component.scss'],
})
export class IncidentIdentifyPanelComponent {
  public incident: any

  setIncident(incident) {
    this.incident = incident
    console.warn('Incident panel created with', incident);

    // load from DB?
  }
}
