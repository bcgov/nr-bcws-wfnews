import { Component, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AppConfigService } from "src/app/services/app-config.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { convertToFireCentreDescription } from 'src/app/utils';
import { MapConfigService } from 'src/app/services/map-config.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';

@Component({
    selector: 'incident-detail',
    templateUrl: './incident-detail.component.html',
    styleUrls: ['../base/base.component.scss', './incident-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentDetailComponent implements OnInit, OnDestroy {
    incidentDetail: any;
    incidentNewsLink: string;
    convertToFireCentreDescription = convertToFireCentreDescription
    errorMessage: string

    constructor(
        protected http: HttpClient,
        protected cdr: ChangeDetectorRef,
        protected appConfig: AppConfigService,
        private mapConfigService: MapConfigService,
        protected applicationStateService: ApplicationStateService,
    ) {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

    setError( err ) {
        if ( err ) {
            this.errorMessage = err.message || String( err )
        }
        else {
            this.errorMessage = null
        }
        this.cdr.detectChanges()
    }

    setIncidentDetail(incidentRef): Promise<any> {
        if (!incidentRef || !incidentRef.incident_number_label) {
            console.warn( 'no incident number' )
            this.errorMessage = 'No incident number provided'
            this.incidentDetail = {}
            this.cdr.detectChanges();
            return Promise.resolve()
        }

        let incidentNumber = incidentRef.incident_number_label

        let now = new Date(),
            fireYear = incidentRef.fire_year || ( now.getFullYear() + (now.getMonth() < 3 ? -1 : 0) )

        return this.appConfig.loadAppConfig()
            .then(()=>{
                let headers = new HttpHeaders({
                    'apikey': this.appConfig.getConfig().applicationResources['wfnews-api-key']
                });

                let baseUrl = this.appConfig.getConfig().applicationResources['wfnews-api-url'];
                let url = `${ baseUrl }/publicPublishedIncident/${ incidentNumber }/?fireYear=${ fireYear }`

                return this.http.get(url, { headers }).toPromise()
            })
            .then(incident => {
                this.incidentDetail = incident
                if ( this.incidentDetail.stageOfControlCode == 'OUT' ) {
                    this.incidentDetail.stageOfControl = 'Out: The wildfire is extinguished. Suppression efforts are complete.'
                }
                let baseNewsUiUrl = this.appConfig.getConfig().applicationResources['wfnews-ui-url'];
                this.incidentNewsLink = baseNewsUiUrl + `/incidents?fireYear=${this.incidentDetail.fireYear}&incidentNumber=${this.incidentDetail.incidentNumberLabel}`
                this.cdr.detectChanges();
                return incident
            })
            .catch( e => {
                console.warn( e )
                this.errorMessage = e.message
                this.incidentDetail = {}
                this.cdr.detectChanges();
            })
    }

    convertTimeStamp(date: string) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (date) {
            return new Date(date).toLocaleTimeString("en-US", options);
        }
    }

    getCauseLabel(code: number) {
        if (code === 1) return "Human";
        else if (code === 2) return "Natural";
        else return "Undetermined";
    }

    displayCurrentResources(incident: any) {
        let result = []
        if (incident.wildfireCrewResourcesInd) {
            result.push(' Wildfire Crews')
        }
        if (incident.wildfireAviationResourceInd) {
            result.push(' Aviation')
        }
        if (incident.incidentMgmtCrewRsrcInd) {
            result.push(' Incident Management Team')
        }
        if (incident.heavyEquipmentResourcesInd) {
            result.push(' Heavy Equipment')
        }
        if (incident.structureProtectionRsrcInd) {
            result.push(' Structure Protection')
        }

        if (result.length) {
            return String(result)
        }
        // todo
    }

    getResponseType(code: string) {
        let response = code.toLocaleLowerCase()
        return response.toLocaleLowerCase().charAt(0).toUpperCase() + response.slice(1);
    }

    zoomIn() {
        const long = Number(this.incidentDetail.longitude);
        const lat = Number(this.incidentDetail.latitude);

        this.mapConfigService.getMapConfig().then(() => {
            const SMK = window['SMK'];
            let viewer = null;
            for (const smkMap in SMK.MAP) {
                if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
                    viewer = SMK.MAP[smkMap].$viewer;
                }
            }
            viewer.panToFeature(window['turf'].point([long, lat]), 15, this.getIsMobileRes() )
        })

    }

    getIsMobileRes(): boolean {
        return this.applicationStateService.getIsMobileResolution();
    }
}
