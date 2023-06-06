import { Component } from '@angular/core';
import { IncidentInfoPanel } from '../incident-info-panel/incident-info-panel.component';

@Component({
  selector: 'incident-info-panel-mobile',
  templateUrl: './incident-info-panel-mobile.component.html',
  styleUrls: ['./incident-info-panel-mobile.component.scss']
})
export class IncidentInfoPanelMobileComponent extends IncidentInfoPanel {

  getTooltipText() {
    return `What is a Hecture?

    A hectare is a unit of area equal to 10,000 square meters or around 2.5 acres of land.
    `;
  }

  navigateToMap(){
    //to do, need to wait for the mobile map screen ticket
  }

  navigateToEvac(evac){
    //to do. need to wait for the screen design
  }

  navigateToAreaRestriction(area){
    //to do. need to wait for the screen design
  }

  scrollToSection(event,sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  }

  callFireCentre(phoneNumber:string) {
    const parsedPhoneNumber = parseInt(phoneNumber.replace(/-/g, ""));
    window.open(`tel:${parsedPhoneNumber}`, '_system');
  }

  emailFireCentre(recipientEmail:string) {
    const mailtoUrl = `mailto:${recipientEmail}`;
    window.location.href = mailtoUrl;
  }
  
}
