import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class OptionDisclaimer {
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
    {optionValue: "Mapped", disclaimer:"Fire size based on the last known mapped size in hectares."},
    {optionValue: "Estimated", disclaimer:"Fire size based on the last known estimated size in hectares."},
  ];

  causeOptions: OptionDisclaimer[] = [
    {optionValue: "General", disclaimer:"The cause of a wildfire is determined by professional investigations. The BC Wildfire Service employs Fire Origin and Cause Specialists to conduct investigations in accordance with international standards. Learn more about what causes wildfires here."},
    {optionValue: "Lightning", disclaimer:"When lightning strikes an object it can release enough heat to ignite a tree or other fuels."},
    {optionValue: "Human", disclaimer:"Humans start wildfires in several ways, either by accident or intentionally."},
    {optionValue: "Under Investigation", disclaimer:"Wildfire investigations often take time and can be very complex. Investigations may be carried out by one or more agencies, including the BC Wildfire Service, the Compliance and Enforcement Branch, the RCMP, or other law enforcement agencies, and may be cross jurisdictional."}
  ];

  showLearnMoreText:boolean;

  setSizeTypeDisclaimer (value) {
    this.formGroup.controls['sizeComments'].setValue(this.sizeTypeOptions.find(c=>c.optionValue===value).disclaimer);
  }

  setCauseDisclaimer (value) {
    this.formGroup.controls['causeComments'].setValue(this.causeOptions.find(c=>c.optionValue===value).disclaimer);
    this.showLearnMoreText = true;
  }
}
