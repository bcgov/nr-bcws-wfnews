import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'panel-wildfire-stage-of-control',
    templateUrl: './panel-wildfire-stage-of-control.component.html',
    styleUrls: ['./panel-wildfire-stage-of-control.component.scss'],
})
export class PanelWildfireStageOfControlComponent implements OnInit, OnChanges {
    constructor(
        private http: HttpClient,
        private appConfig: AppConfigService
    ) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
    }
}
