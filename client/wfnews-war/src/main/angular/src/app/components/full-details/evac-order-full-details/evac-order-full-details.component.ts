import { Component } from '@angular/core';
import { EvacAlertFullDetailsComponent } from '../evac-alert-full-details/evac-alert-full-details.component';
import { SimpleIncident } from '@app/services/published-incident-service';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wfnews-evac-order-full-details',
  templateUrl: './evac-order-full-details.component.html',
  styleUrls: ['./evac-order-full-details.component.scss'],
})
export class EvacOrderFullDetailsComponent extends EvacAlertFullDetailsComponent {
  navToIncident(incident: SimpleIncident) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
        source: [ResourcesRoutes.FULL_DETAILS],
        sourceId: this.id,
        sourceType: 'evac-order',
      },
    });
  }
}
