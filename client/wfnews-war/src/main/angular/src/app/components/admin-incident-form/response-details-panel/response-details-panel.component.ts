import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'response-details-panel',
  templateUrl: './response-details-panel.component.html',
  styleUrls: ['./response-details-panel.component.scss']
})
export class ResponseDetailsPanel implements OnInit {
  @Input() public readonly formGroup: FormGroup;
  @Input() public incident;

  responseDisclaimer: string = "The BC Wildfire Service relies on thousands of people each year to respond to wildfires. This includes firefighters, air crew, equipment operators, and support staff. For more information on resources assigned to this incident, please contact the information officer listed for this incident.";
  crewsComments: string = "There are currently XX Initial Attack and XX Unit Crews responding to this wildfire.";
  aviationComments: string = "There are currently XX helicopters and XX airtankers responding to this wildfire.";
  incidentManagementComments: string = "An Incident Management Team has been assigned to this wildfire.";
  heavyEquipmentComments: string = "There are currently XX pieces of heavy equipment responding to this wildfire.";
  structureProtectionComments: string = "There are currently XX structure protection units responding to this incident.";

  ngOnInit() {
    this.formGroup.controls['responseComments'].setValue(this.responseDisclaimer);
  }

  onCheckedOption(event, controlName) {
    if(event.checked) {
      this.formGroup.controls[controlName].setValue(this[controlName]);
    } else {
      this.formGroup.controls[controlName].setValue("");
    }
  }
}
