import { Component, Input, OnInit } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';

@Component({
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
    if (this.incident?.incidentMgmtCrewRsrcInd && this.incident?.incidentMgmtCrewRsrcDetail) {
      this.resources.push({
        headerText: 'Incident Management Team',
        iconPath: 'assets/images/svg-icons/incident-management-teams-mobile.svg',
        description: this.incident.incidentMgmtCrewRsrcDetail,
      });
    }

    if (this.incident?.wildfireCrewResourcesInd && this.incident?.wildfireCrewResourcesDetail) {
      this.resources.push({
        headerText: 'Firefighting Personnel',
        iconPath: 'assets/images/svg-icons/wildfire-crews-mobile.svg',
        description: this.incident.wildfireCrewResourcesDetail,
      });
    }

    if (this.incident?.wildfireAviationResourceInd && this.incident?.wildfireAviationResourceDetail) {
      this.resources.push({
        headerText: 'Aviation',
        iconPath: 'assets/images/svg-icons/aviation-mobile.svg',
        description: this.incident.wildfireAviationResourceDetail,
      });
    }

    if (this.incident?.heavyEquipmentResourcesInd && this.incident?.heavyEquipmentResourcesDetail) {
      this.resources.push({
        headerText: 'Heavy Equipment',
        iconPath: 'assets/images/svg-icons/heavy_equipment-mobile.svg',
        description: this.incident.heavyEquipmentResourcesDetail,
      });
    }

    if (this.incident?.structureProtectionRsrcInd && this.incident?.structureProtectionRsrcDetail) {
      this.resources.push({
        headerText: 'Structure Protection',
        iconPath: 'assets/images/svg-icons/structure-protection-mobile.svg',
        description: this.incident.structureProtectionRsrcDetail,
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
