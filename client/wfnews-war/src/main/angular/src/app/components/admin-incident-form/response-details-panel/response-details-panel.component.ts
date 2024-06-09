import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DISCLAIMER_TEXT } from '@app/constants';
import { AssignmentResourcesSummary, ResourceManagementService } from '@app/services/resource-management.service';

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

  responseDisclaimer = DISCLAIMER_TEXT.RESPONSE;
  incidentManagementComments = DISCLAIMER_TEXT.INCIDENT_MANAGEMENT;

  details = "detailsOnly"

  constructor(private resourceManagementService: ResourceManagementService) { }

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
      return `There are currently ${initialAttack && initialAttack > 0 ? initialAttack : 0
        } Initial Attack and ${unityCrews && unityCrews > 0 ? unityCrews : 0
        } Unit Crews responding to this wildfire.`;
    }
  }

  aviationCommentsValue(helicopters, airtankers) {
    if (helicopters || airtankers) {
      return `There are currently ${helicopters && helicopters > 0 ? helicopters : 0
        } helicopters and ${airtankers && airtankers > 0 ? airtankers : 0
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

  updateCrews() {
    this.resourceManagementService.fetchResource(this.incident.wildfireYear, this.incident.incidentLabel, this.details).toPromise().then(result => {
      result?.summary?.then(summary => {
        const details = summary?.details as unknown as AssignmentResourcesSummary;
        if (details) {
          this.initialAttackCrews.nativeElement.value = this.getCount(details['Crews'].resources, 'Initial Attack Crew');
          this.unitCrews.nativeElement.value = this.getCount(details['Crews']?.resources, 'Unit Crew');
          this.crewsValueChange();
        }
      })
    }).catch(error => {
      console.error('Could not update Crews', error)
    })
  }

  updateAviation() {
    // needs to be set to 0 for now, Aviation has not yet been implemented in WFRM
    this.airtankers.nativeElement.value = 0;
    this.helicopters.nativeElement.value = 0;
    this.aviationValueChange();
  }

  updateIMTeam() {
    this.resourceManagementService.fetchResource(this.incident.wildfireYear, this.incident.incidentLabel, this.details).toPromise().then(result => {
      result?.summary?.then(summary => {
        const details = summary?.details as unknown as AssignmentResourcesSummary;
        if (details) {
          this.imTeams.nativeElement.value = this.getCount(details['Crews']?.resources, 'IMT');
          this.incidentTeamValueChange();
        }
      })
    }).catch(error => {
      console.error('Could not update IM Team', error)
    })
    
  }

  updateEquipment() {
    this.resourceManagementService.fetchResource(this.incident.wildfireYear, this.incident.incidentLabel, this.details).toPromise().then(result => {
      result?.summary?.then(summary => {
        const details = summary?.details as unknown as AssignmentResourcesSummary;
        if (details) {
          this.pieces.nativeElement.value = details['Heavy Equipment']?.totalCount;
          this.heavyEquipmentValueChange();
        }
      })
    }).catch(error => {
      console.error('Could not update Heavy Equipment', error);
    })
  }

  updateStructureProtection() {
    this.resourceManagementService.fetchResource(this.incident.wildfireYear, this.incident.incidentLabel, this.details).toPromise().then(result => {
      result?.summary?.then(summary => {
        const details = summary?.details as unknown as AssignmentResourcesSummary;
        if (details) {
          this.structure.nativeElement.value = this.getCount(details['Fire Services Equipment']?.resources, 'Structure Protection Unit');
          this.structuretValueChange();
        }
      })
    }).catch(error => {
      console.error('Could not update Structure Protection Unit', error);
    })
  }

  getCount(resource, name) {
    return resource.find(r => r.name == name).count;
  }
}
