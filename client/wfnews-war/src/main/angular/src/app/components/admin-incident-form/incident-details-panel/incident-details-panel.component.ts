import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'incident-details-panel',
  templateUrl: './incident-details-panel.component.html',
  styleUrls: ['./incident-details-panel.component.scss']
})
export class IncidentDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  constructor(private appConfig: AppConfigService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }
}
