import { Component, ViewEncapsulation } from '@angular/core';
import {
  convertToDateYear,
  getResponseTypeDescription,
  getResponseTypeTitle,
} from '../../../utils';
import { IncidentOverviewPanel } from '../incident-overview-panel/incident-overview-panel.component';

@Component({
  selector: 'incident-overview-panel-mobile',
  templateUrl: './incident-overview-panel-mobile.component.html',
  styleUrls: ['./incident-overview-panel-mobile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IncidentOverviewPanelMobileComponent extends IncidentOverviewPanel {
  getResponseTypeTitle = getResponseTypeTitle;
  getResponseTypeDescription = getResponseTypeDescription;
  convertToDateYear = convertToDateYear;

  getResponseImage(code: string): string {
    if (code === 'MONITOR') {
      return '/assets/images/svg-icons/monitored_response.svg';
    } else if (code === 'MODIFIED') {
      return '/assets/images/svg-icons/modified_response.svg';
    } else if (code === 'FULL') {
      return '/assets/images/svg-icons/full_response.svg';
    }
  }

  navToLearnMore() {
    const responseUrl = this.appConfigService.getConfig().externalAppConfig[
      'bcWildfireResponsePage'
    ] as unknown as string;
    window.open(responseUrl, '_blank');
  }
}
