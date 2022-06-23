import { Component, Input, OnInit } from '@angular/core';
// External
import { select, Store } from '@ngrx/store';
// Models
import { CodeTablesIndex } from './models/code-tables-index';
import { WildfireIncidentResource } from '@wf1/incidents-rest-api';

// import {formatCoordinates} from '@wf1/angular-map';
import { isIncidentTypeWithStageOfControl, isIncidentTypeWithStatus } from "../../../utils";
import { SpatialUtilsService } from '@wf1/core-ui';

@Component({
    selector: 'wf1-info-incident-panel',
    templateUrl: './info-incident-panel.component.html',
    styleUrls: ['./info-incident-panel.component.scss']
})
export class InfoIncidentPanelComponent implements OnInit {

    @Input() incident: WildfireIncidentResource;
    codeLabelLookupTables: CodeTablesIndex = {};

    constructor(
        private store: Store<any>,
        protected spatialUtils: SpatialUtilsService
    ) { }

    ngOnInit() {
        this.getCodeLookupTables();
    }

    showStageOfControl() {
        return isIncidentTypeWithStageOfControl(this.incident.incidentTypeCode);
    }

    showIncidentStatus() {
        return isIncidentTypeWithStatus(this.incident.incidentTypeCode);
    }

    getCodeLookupTables() {
        this.store.pipe(select('codeData', 'codeIndex')).subscribe(codeIndex => this.codeLabelLookupTables = codeIndex);
    }

    getLabel(table: string, value: string) {
        return this.codeLabelLookupTables[table] && value ? this.codeLabelLookupTables[table][value] : '';
    }

    getPanelClasses() {
        let incidentClass;
        if (this.incident.incidentSituation) {
            incidentClass = (this.incident.incidentSituation.interfaceFireInd)
                ? 'incident-interface'
                : 'incident-non-interface';
        } else {
            incidentClass = 'incident-default';
        }
        return `info-panel ${incidentClass}`;
    }

    getFormattedLocation() {
        if (!this.incident.incidentLocation) return ''
        return this.spatialUtils.formatCoordinates([this.incident.incidentLocation.longitude, this.incident.incidentLocation.latitude])
    }


}
