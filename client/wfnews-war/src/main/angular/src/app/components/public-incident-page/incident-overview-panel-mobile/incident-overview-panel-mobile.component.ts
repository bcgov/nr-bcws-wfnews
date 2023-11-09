import { Component } from '@angular/core';
import { convertToDateYear, getResponseTypeDescription, getResponseTypeTitle } from "../../../utils";
import { IncidentOverviewPanel } from '../incident-overview-panel/incident-overview-panel.component';

@Component({
  selector: 'incident-overview-panel-mobile',
  templateUrl: './incident-overview-panel-mobile.component.html',
  styleUrls: ['./incident-overview-panel-mobile.component.scss']
})
export class IncidentOverviewPanelMobileComponent extends IncidentOverviewPanel {
  getResponseTypeTitle = getResponseTypeTitle;
  getResponseTypeDescription = getResponseTypeDescription;
  convertToDateYear = convertToDateYear;

  navToLearnMore() {
    let responseUrl = this.appConfigService.getConfig().externalAppConfig['bcWildfireResponsePage'].toString();
    window.open(responseUrl, "_blank")
  }
}
