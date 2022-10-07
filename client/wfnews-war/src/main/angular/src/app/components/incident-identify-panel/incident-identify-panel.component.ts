import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
    selector: 'incident-identify-panel',
    templateUrl: './incident-identify-panel.component.html',
    styleUrls: ['./incident-identify-panel.component.scss'],
})
export class IncidentIdentifyPanelComponent {
  public incident: any
  public loaded = false

  constructor (protected cdr: ChangeDetectorRef) { }
  // if we want the "next" functionality, pass in the identify set
  setIncident (incident, featureInfo) {
    this.incident = incident
    console.warn('Incident panel created with', incident, featureInfo);

    // load from DB. Show a spinner while loading

    // load Evac orders near this incident

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
        structureProtection: false
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
}
