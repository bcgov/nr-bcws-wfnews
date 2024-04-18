import { Component, OnInit } from '@angular/core';
import { IncidentInfoPanel } from '../incident-info-panel/incident-info-panel.component';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';

@Component({
  selector: 'incident-info-panel-mobile',
  templateUrl: './incident-info-panel-mobile.component.html',
  styleUrls: ['./incident-info-panel-mobile.component.scss'],
})
export class IncidentInfoPanelMobileComponent
  extends IncidentInfoPanel
  implements OnInit {
  mobileEvacOrders = [];
  mobileEvacAlerts = [];
  convertToDateYear = convertToDateYear;

  ngOnInit(): void {
    this.populateOrdersAndAlerts();
  }

  populateOrdersAndAlerts() {
    if (this.evacOrders) {
      for (const evac of this.evacOrders) {
        if (evac.orderAlertStatus === 'Order') {
this.mobileEvacOrders.push(evac);
} else if (evac.orderAlertStatus === 'Alert') {
this.mobileEvacAlerts.push(evac);
} else {
console.error(
            'Could not determine orderAlertStatus for mobile evacuations',
          );
}
      }
    }
  }

  navigateToMap() {
    if (this.incident) {
      setTimeout(() => {
        this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude: this.incident.longitude,
            latitude: this.incident.latitude,
            activeWildfires: true
          },
        });
      }, 200);
    }
  }

  navigateToEvac(evac) {
    if (evac?.externalUri) {
      window.open(evac.uri, '_blank');
    } else if (evac && this.incident) {
      let type = null;
      if (evac.orderAlertStatus === 'Alert') {
type = 'evac-alert';
} else if (evac.orderAlertStatus === 'Order') {
type = 'evac-order';
}
      this.route.navigate([ResourcesRoutes.FULL_DETAILS], {
        queryParams: {
          type,
          id: evac.emrgOAAsysID,
          name: evac.eventName,
          source: [ResourcesRoutes.PUBLIC_INCIDENT],
          sourceYear: this.incident.fireYear,
          sourceNumber: this.incident.incidentNumberLabel
            ? this.incident.incidentNumberLabel
            : this.incident.incidentNumber,
        },
      });
    }
  }

  navigateToAreaRestriction(area) {
    if (area?.protRsSysID && this.incident) {
this.route.navigate([ResourcesRoutes.FULL_DETAILS], {
        queryParams: {
          type: 'area-restriction',
          id: area.protRsSysID,
          source: [ResourcesRoutes.PUBLIC_INCIDENT],
          sourceYear: this.incident.fireYear,
          sourceNumber: this.incident.incidentNumberLabel
            ? this.incident.incidentNumberLabel
            : this.incident.incidentNumber,
        },
      });
}
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
section.scrollIntoView({ behavior: 'smooth' });
}
  }
}
