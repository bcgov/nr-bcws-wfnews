import { Component, OnInit } from '@angular/core';
import { IncidentInfoPanel } from '../incident-info-panel/incident-info-panel.component';
import { convertToDateYear } from '@app/utils';

@Component({
  selector: 'incident-info-panel-mobile',
  templateUrl: './incident-info-panel-mobile.component.html',
  styleUrls: ['./incident-info-panel-mobile.component.scss']
})
export class IncidentInfoPanelMobileComponent extends IncidentInfoPanel implements OnInit {
  mobileEvacOrders = [];
  mobileEvacAlerts = [];
  convertToDateYear = convertToDateYear;

  ngOnInit(): void {
    this.populateOrdersAndAlerts()
  }

  populateOrdersAndAlerts() {
    if (this.evacOrders) {
      for (const evac of this.evacOrders) {
        if (evac.orderAlertStatus === 'Order') this.mobileEvacOrders.push(evac)
        else if (evac.orderAlertStatus === 'Alert') this.mobileEvacAlerts.push(evac)
        else console.error('Could not determine orderAlertStatus for mobile evacuations')
      }
    }

  }

  navigateToMap() {
    //to do, need to wait for the mobile map screen ticket
  }

  navigateToEvac(evac) {
    //to do. need to wait for the screen design
  }

  navigateToAreaRestriction(area) {
    //to do. need to wait for the screen design
  }

  scrollToSection(event, sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
  }

  callFireCentre(phoneNumber: string) {
    const parsedPhoneNumber = parseInt(phoneNumber.replace(/-/g, ""));
    window.open(`tel:${parsedPhoneNumber}`, '_system');
  }

  emailFireCentre(recipientEmail: string) {
    const mailtoUrl = `mailto:${recipientEmail}`;
    window.location.href = mailtoUrl;
  }

}
