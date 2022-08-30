import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'panel-bans-prohibitions',
    templateUrl: './panel-bans-prohibitions.component.html',
    styleUrls: ['./panel-bans-prohibitions.component.scss'],
})
export class PanelBansAndProhibitionsComponent implements OnInit, OnChanges {
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
