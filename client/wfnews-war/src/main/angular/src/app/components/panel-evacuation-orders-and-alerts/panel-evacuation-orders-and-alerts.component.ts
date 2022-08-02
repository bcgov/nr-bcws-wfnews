import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'panel-evacuation-orders-and-alerts',
    templateUrl: './panel-evacuation-orders-and-alerts.component.html',
    styleUrls: ['./panel-evacuation-orders-and-alerts.component.scss'],
})
export class PanelEvacuationOrdersAndAlertsComponent implements OnInit, OnChanges {
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
