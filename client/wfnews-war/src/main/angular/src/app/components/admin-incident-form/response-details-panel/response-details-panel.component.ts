import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'response-details-panel',
  templateUrl: './response-details-panel.component.html',
  styleUrls: ['./response-details-panel.component.scss'],
})
export class ResponseDetailsPanel implements OnInit {
  @Input() public readonly formGroup: UntypedFormGroup;
  @Input() public incident;

  @ViewChild('initialAttackCrews') initialAttackCrews: ElementRef;
  @ViewChild('unitCrews') unitCrews: ElementRef;
  @ViewChild('helicopters') helicopters: ElementRef;
  @ViewChild('airtankers') airtankers: ElementRef;
  @ViewChild('pieces') pieces: ElementRef;
  @ViewChild('structure') structure: ElementRef;
  @ViewChild('imTeams') imTeams: ElementRef;

  responseDisclaimer = `The BC Wildfire Service relies on thousands of people each year to respond to wildfires. This includes firefighters, air crew, equipment operators, and support staff. For more information on resources assigned to this incident, please contact the information officer listed for this incident.`;
  incidentManagementComments = `An Incident Management Team has been assigned to this wildfire.`;

  ngOnInit() {
    this.formGroup.controls['responseComments'].setValue(
      this.responseDisclaimer,
    );
  }

  onWildfireCrewsChecked(event) {
    if (event.checked) {
      this.formGroup.controls['crewsComments'].setValue(
        this.crewCommentsValue(
          this.initialAttackCrews.nativeElement.value,
          this.unitCrews.nativeElement.value,
        ),
      );
    } else {
      this.formGroup.controls['crewsComments'].setValue('');
    }
  }

  onAviationChecked(event) {
    if (event.checked) {
      this.formGroup.controls['aviationComments'].setValue(
        this.aviationCommentsValue(
          this.helicopters.nativeElement.value,
          this.airtankers.nativeElement.value,
        ),
      );
    } else {
      this.formGroup.controls['aviationComments'].setValue('');
    }
  }

  onIncidentManagementTeamsChecked(event) {
    if (event.checked) {
      this.formGroup.controls['incidentManagementComments'].setValue(
        this.incidentManagementComments,
      );
    } else {
      this.formGroup.controls['incidentManagementComments'].setValue('');
    }
  }

  onHeavyEquipmentChecked(event) {
    if (event.checked) {
      this.formGroup.controls['heavyEquipmentComments'].setValue(
        this.heavyEquipmentCommentsValue(this.pieces.nativeElement.value),
      );
    } else {
      this.formGroup.controls['heavyEquipmentComments'].setValue('');
    }
  }

  onStructureProtectionChecked(event) {
    if (event.checked) {
      this.formGroup.controls['structureProtectionComments'].setValue(
        this.structureProtectionCommentsValue(),
      );
    } else {
      this.formGroup.controls['structureProtectionComments'].setValue('');
    }
  }

  crewCommentsValue(initialAttack, unityCrews) {
    if (initialAttack || unityCrews) {
      return `There are currently ${
        initialAttack && initialAttack > 0 ? initialAttack : 0
      } Initial Attack and ${
        unityCrews && unityCrews > 0 ? unityCrews : 0
      } Unit Crews responding to this wildfire.`;
    }
  }

  aviationCommentsValue(helicopters, airtankers) {
    if (helicopters || airtankers) {
      return `There are currently ${
        helicopters && helicopters > 0 ? helicopters : 0
      } helicopters and ${
        airtankers && airtankers > 0 ? airtankers : 0
      } airtankers responding to this wildfire.`;
    }
  }

  heavyEquipmentCommentsValue(pieces) {
    if (pieces && pieces > 0) {
      return `There are currently ${pieces} pieces of heavy equipment responding to this wildfire.`;
    }
  }

  structureProtectionCommentsValue() {
    return `Structure protection is responding to this incident.`;
  }

  incidentTeamCommentsValue() {
    return 'An Incident Management Team has been assigned to this wildfire.';
  }

  crewsValueChange() {
    if (this.incident.wildifreCrewsInd) {
      this.formGroup.controls['crewsComments'].setValue(
        this.crewCommentsValue(
          this.initialAttackCrews.nativeElement.value,
          this.unitCrews.nativeElement.value,
        ),
      );
      this.incident.crewResourceCount =
        (Number(this.initialAttackCrews?.nativeElement?.value) || 0) +
          (Number(this.unitCrews?.nativeElement?.value) || 0) || undefined;
    }
  }

  aviationValueChange() {
    if (this.incident.aviationInd) {
      this.formGroup.controls['aviationComments'].setValue(
        this.aviationCommentsValue(
          this.helicopters.nativeElement.value,
          this.airtankers.nativeElement.value,
        ),
      );
      this.incident.aviationResourceCount =
        (Number(this.helicopters?.nativeElement?.value) || 0) +
          (Number(this.airtankers?.nativeElement?.value) || 0) || undefined;
    }
  }

  heavyEquipmentValueChange() {
    if (this.incident.heavyEquipmentInd) {
      this.formGroup.controls['heavyEquipmentComments'].setValue(
        this.heavyEquipmentCommentsValue(this.pieces.nativeElement.value),
      );
      this.incident.heavyEquipmentResourceCount =
        Number(this.pieces?.nativeElement?.value) || undefined;
    }
  }

  structuretValueChange() {
    if (this.incident.structureProtectionInd) {
      this.formGroup.controls['structureProtectionComments'].setValue(
        this.structureProtectionCommentsValue(),
      );
      this.incident.structureProtectionResourceCount =
        Number(this.structure?.nativeElement?.value) || undefined;
    }
  }

  incidentTeamValueChange() {
    if (this.incident.incidentManagementInd) {
      this.formGroup.controls['incidentManagementComments'].setValue(
        this.incidentTeamCommentsValue(),
      );
      this.incident.incidentManagementResourceCount =
        Number(this.imTeams?.nativeElement?.value) || undefined;
    }
  }
}
