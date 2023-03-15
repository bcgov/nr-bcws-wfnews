import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class OptionDisclaimer {
  public id: number;
  public optionValue: string;
  public disclaimer: string;
}

@Component({
  selector: 'incident-details-panel',
  templateUrl: './incident-details-panel.component.html',
  styleUrls: ['./incident-details-panel.component.scss']
})
export class IncidentDetailsPanel {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  sizeTypeOptions: OptionDisclaimer[] = [
    {id: 2, optionValue: "Select...", disclaimer: "Fire size is based on most current information available."},
    {id: 0, optionValue: "Mapped", disclaimer: "Fire size is based on the last known mapped size in hectares."},
    {id: 1, optionValue: "Estimated", disclaimer: "Fire size is based on the last known estimated size in hectares."}
  ]

  // IM db only contains "Human", "Natural" and "Undetermined", but in ticket https://apps.nrs.gov.bc.ca/int/jira/browse/WFNEWS-510
  // was requested to add "General", "Human", "Lightning" and "Under Investigation"
  // We resolved to keep the IM values in the UI
  causeOptions: OptionDisclaimer[] = [
    {id: 1, optionValue: "Human", disclaimer: "Humans start wildfires in several ways, either by accident or intentionally."},
    {id: 2, optionValue: "Lightning", disclaimer: "When lightning strikes an object it can release enough heat to ignite a tree or other fuels."},
    {id: 3, optionValue: "Under Investigation", disclaimer: "Wildfire investigations often take time and can be very complex. Investigations may be carried out by one or more agencies, including the BC Wildfire Service, the Compliance and Enforcement Branch, the RCMP, or other law enforcement agencies, and may be cross jurisdictional."}
  ]

  setSizeTypeDisclaimer (value) {
    this.formGroup.controls['sizeComments'].setValue(this.sizeTypeOptions.find(c => c.id === Number(value)).disclaimer);
  }

  setCauseDisclaimer (value) {
    this.formGroup.controls['causeComments'].setValue(this.causeOptions.find(c => c.id === Number(value)).disclaimer);
  }
}
