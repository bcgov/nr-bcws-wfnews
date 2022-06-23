import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
// Models
import {RootState} from '../../../../store/index';
import {Convert} from "../panel-container/panel/convert";
import {WildfireIncidentResource} from "@wf1/incidents-rest-api";
import {SpatialUtilsService} from "@wf1/core-ui";

// Redux


@Component({
	selector: 'update-info-container',
	templateUrl: './update-info.component.html',
	styleUrls: ['../panel-container/panel/base-panel.component.scss']
})
export class UpdateInfoContainerComponent implements OnInit, OnDestroy, OnChanges {
  public formGroup : FormGroup;

  @Input() incident: WildfireIncidentResource;

  constructor(
    protected store: Store<RootState>,
    protected fb: FormBuilder,
    protected spatialUtils: SpatialUtilsService,
    protected cdr: ChangeDetectorRef
  ) {}

	ngOnChanges(changes: SimpleChanges) {
    
    if (changes.incident && this.formGroup) {
      const lastUpdatedUserId = changes.incident.currentValue.lastUpdatedUserId;
      const lastUpdatedTimestampDisplay = changes.incident.currentValue.lastUpdatedTimestamp ? Convert.formatDateTimeToDisplayString(new Date(changes.incident.currentValue.lastUpdatedTimestamp)):undefined;
      
      this.formGroup.patchValue({
          lastUpdatedUserId,
          lastUpdatedTimestampDisplay
      });
      this.formGroup.markAsPristine();
    }
	}

	ngOnInit() {
    this.formGroup = this.fb.group({
      lastUpdatedUserId: [{value: this.incident.lastUpdatedUserId, disabled:true}],
      lastUpdatedTimestampDisplay: [{value:this.incident.lastUpdatedTimestamp ? Convert.formatDateTimeToDisplayString(new Date(this.incident.lastUpdatedTimestamp)):undefined, disabled:true}]
    });
	}

	ngOnDestroy() {
	}

}
