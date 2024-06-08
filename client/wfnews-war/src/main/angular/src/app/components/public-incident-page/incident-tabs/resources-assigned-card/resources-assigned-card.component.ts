import { Component, Input, OnInit } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'resources-assigned-card',
  templateUrl: './resources-assigned-card.component.html',
  styleUrls: ['./resources-assigned-card.component.scss']
})
export class ResourcesAssignedCardComponent implements OnInit {

  @Input() incident;

  resources = [];

  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;
  
  ngOnInit(): void {
    this.populateResources();
  }

  populateResources = () => {
    if (this.incident.incident?.incidentMgmtCrewRsrcInd && this.incident.incident?.incidentMgmtCrewRsrcDetail) {
      this.resources.push({
        headerText: 'Incident Management Team',
        iconPath: 'assets/images/svg-icons/incident-management-teams-mobile.svg',
        description: this.incident.incident.incidentMgmtCrewRsrcDetail,
      });
    }

    if (this.incident.incident?.wildfireCrewResourcesInd && this.incident.incident?.wildfireCrewResourcesDetail) {
      this.resources.push({
        headerText: 'Firefighting Personnel',
        iconPath: 'assets/images/svg-icons/wildfire-crews-mobile.svg',
        description: this.incident.incident.wildfireCrewResourcesDetail,
      });
    }

    if (this.incident.incident?.wildfireAviationResourceInd && this.incident.incident?.wildfireAviationResourceDetail) {
      this.resources.push({
        headerText: 'Aviation',
        iconPath: 'assets/images/svg-icons/aviation-mobile.svg',
        description: this.incident.incident.wildfireAviationResourceDetail,
      });
    }

    if (this.incident.incident?.heavyEquipmentResourcesInd && this.incident.incident?.heavyEquipmentResourcesDetail) {
      this.resources.push({
        headerText: 'Heavy Equipment',
        iconPath: 'assets/images/svg-icons/heavy_equipment-mobile.svg',
        description: this.incident.incident.heavyEquipmentResourcesDetail,
      });
    }

    if (this.incident.incident?.structureProtectionRsrcInd && this.incident.incident?.structureProtectionRsrcDetail) {
      this.resources.push({
        headerText: 'Structure Protection',
        iconPath: 'assets/images/svg-icons/structure-protection-mobile.svg',
        description: this.incident.incident.structureProtectionRsrcDetail,
      });
    }
  };

  directToLink = () => {
    window.open(
      'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/wildfire-personnel-and-response-tools',
       '_blank'
    );
  };
}
