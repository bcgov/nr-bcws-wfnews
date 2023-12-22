import { Component } from '@angular/core';
import { IncidentMapsPanel } from '../incident-maps-panel/incident-maps-panel.component';

@Component({
  selector: 'incident-maps-panel-mobile',
  templateUrl: './incident-maps-panel-mobile.component.html',
  styleUrls: ['./incident-maps-panel-mobile.component.scss'],
})
export class IncidentMapsPanelMobileComponent extends IncidentMapsPanel {
  limit = 10;

  convertDate(dateString) {
    if (dateString) {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      const formattedDate: string = date.toLocaleDateString('en-US', options);
      return formattedDate;
    }
  }

  loadMore() {
    this.limit += 10;
  }
}
