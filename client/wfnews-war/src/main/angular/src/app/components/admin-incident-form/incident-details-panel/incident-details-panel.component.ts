import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
  CauseOptionDisclaimer,
  SizeTypeOptionDisclaimer,
} from './incident-details-panel.constants';

export class OptionDisclaimer {
  public id: number;
  public optionValue: string;
  public disclaimer: string;
}

@Component({
  selector: 'incident-details-panel',
  templateUrl: './incident-details-panel.component.html',
  styleUrls: ['./incident-details-panel.component.scss'],
})
export class IncidentDetailsPanel {
  @Input() public readonly formGroup: UntypedFormGroup;
  @Input() public incident;

  sizeTypeOptions: OptionDisclaimer[] = [
    {
      id: 2,
      optionValue: 'Select...',
      disclaimer: SizeTypeOptionDisclaimer[2],
    },
    { id: 0, optionValue: 'Mapped', disclaimer: SizeTypeOptionDisclaimer[0] },
    {
      id: 1,
      optionValue: 'Estimated',
      disclaimer: SizeTypeOptionDisclaimer[1],
    },
  ];

  // IM db only contains "Human", "Natural" and "Undetermined", but in ticket https://apps.nrs.gov.bc.ca/int/jira/browse/WFNEWS-510
  // was requested to add "General", "Human", "Lightning" and "Under Investigation"
  // We resolved to keep the IM values in the UI
  causeOptions: OptionDisclaimer[] = [
    { id: 0, optionValue: 'Select...', disclaimer: CauseOptionDisclaimer[0] },
    { id: 1, optionValue: 'Human', disclaimer: CauseOptionDisclaimer[1] },
    { id: 2, optionValue: 'Lightning', disclaimer: CauseOptionDisclaimer[2] },
    {
      id: 3,
      optionValue: 'Under Investigation',
      disclaimer: CauseOptionDisclaimer[3],
    },
  ];

  setSizeTypeDisclaimer(value) {
    this.formGroup.controls['sizeComments'].setValue(
      this.sizeTypeOptions.find((c) => c.id === Number(value))?.disclaimer,
    );
  }

  setCauseDisclaimer(value) {
    this.formGroup.controls['causeComments'].setValue(
      this.causeOptions.find((c) => c.id === Number(value))?.disclaimer,
    );
  }
}
