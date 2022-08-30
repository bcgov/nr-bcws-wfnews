import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'panel-smoke-forecast',
    templateUrl: './panel-smoke-forecast.component.html',
    styleUrls: ['./panel-smoke-forecast.component.scss'],
})
export class PanelSmokeForecastComponent implements OnInit, OnChanges {
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
