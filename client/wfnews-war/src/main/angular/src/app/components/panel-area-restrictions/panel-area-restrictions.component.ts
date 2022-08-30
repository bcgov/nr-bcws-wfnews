import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'panel-area-restrictions',
    templateUrl: './panel-area-restrictions.component.html',
    styleUrls: ['./panel-area-restrictions.component.scss'],
})
export class PanelAreaRestrictionsComponent implements OnInit, OnChanges {
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
