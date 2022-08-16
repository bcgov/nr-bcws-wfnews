import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'response-details-panel',
  templateUrl: './response-details-panel.component.html',
  styleUrls: ['./response-details-panel.component.scss']
})
export class ResponseDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  constructor(private appConfig: AppConfigService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }
}
