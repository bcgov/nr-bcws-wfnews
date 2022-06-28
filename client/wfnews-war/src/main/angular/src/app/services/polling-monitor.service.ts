import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { select, Store } from "@ngrx/store";
import { AppConfigService } from "@wf1/core-ui";
import { SimpleReportOfFireListService } from '@wf1/incidents-rest-api';
import * as moment from 'moment';
import { filter } from 'rxjs/operators';
import { AudibleAlertState, RootState } from "../store";
import { ApplicationStateService } from "./application-state.service";

@Injectable()
export class PollingMonitorService {
    routeUrl = '';
    rofPollingInterval;
    nrofPollingInterval;
    incidentPollingInterval;
    audibleAlertRofInterval;

    constructor(
        protected store: Store<RootState>,
        protected appConfigService: AppConfigService,
        private applicationStateService: ApplicationStateService,
        private simpleReportOfFireListService: SimpleReportOfFireListService,
        private router: Router
    ) {
        this.router.events.pipe( filter( event => event instanceof NavigationStart ) ).subscribe( ( event:NavigationStart ) => {
            this.routeUrl = event.url
            console.log( this.routeUrl )
        } )
    }

    get canLoadComments() {
        return !this.applicationStateService.isGeneralStaff();
    }

    public startPolling() {
        this.startIncidentPolling();
        this.startRofPolling();
        this.startNrofPolling();
        this.startAudibleAlertPolling();
    }

    get isRouteIncidentList()   { return this.routeUrl.match( '/incidents/list' ) }
    get isRouteIncidentTable()  { return this.routeUrl.match( '/[(]root:external[)]' ) }
    get isRouteRofList()        { return this.routeUrl.match( '/rofs/list' ) }
    get isRouteRofDetail()      { return this.routeUrl.match( '/rofs/detail/(.+)/(.+)' ) }
    get isRouteNrofList()       { return this.routeUrl.match( '/nrofs/list' ) }
    get isRouteNrofDetail()     { return this.routeUrl.match( '/nrofs/detail/(.+)' ) }
    get isRoutePlaceNameSearch(){ return this.routeUrl.match( '/placeNameSearch' ) }

    startRofPolling() {
        const appConfig = this.appConfigService.getConfig().application;
        const rofInterval = appConfig?.polling?.mapTool?.rofPolling || 60000;

        this.rofPollingInterval = setInterval(() => {
            if ( !this.isRouteRofList && !this.isRouteRofDetail && !this.isRoutePlaceNameSearch ) return


            let d = this.isRouteRofDetail
            if ( d ) {
                let wildFireYear = parseInt( d[ 1 ] )
                let rofNumber = parseInt( d[ 2 ] )


                if (this.canLoadComments ) {
                }
            }
        }, rofInterval);
    }

    startNrofPolling() {
        const appConfig = this.appConfigService.getConfig().application;
        const nrofInterval = appConfig?.polling?.mapTool?.rofPolling || 60000;

        this.nrofPollingInterval = setInterval(() => {
            if ( !this.isRouteNrofList && !this.isRouteNrofDetail && !this.isRoutePlaceNameSearch ) return


            let d = this.isRouteNrofDetail
            if ( d ) {
                let provisionalZoneGuid = d[ 1 ]

            }
        }, nrofInterval);
    }

    startIncidentPolling() {
        const appConfig = this.appConfigService.getConfig().application;
        const incidentInterval = appConfig?.polling?.mapTool?.incidentsPolling || 60000;

        this.incidentPollingInterval = setInterval(() => {
            if ( this.isRouteIncidentList ) {
            }
        }, incidentInterval);
    }

    startAudibleAlertPolling() {
        const appConfig = this.appConfigService.getConfig().application;
        const queryInterval = appConfig?.polling?.audibleAlert?.unacknowledgedRofPolling || 60000
        const audioAlertInterval = appConfig?.polling?.audibleAlert?.alertFrequency || 60000

        let alertAudio = new Audio();
        alertAudio.src = 'assets/audio/ipr.wav';

        let audibleAlertState: AudibleAlertState = {
            enableReceivedFromPM: false,
            enableUnacknowledged: false,
            selectedZoneIds: null
        }

        let rofAlertCount = 0
        let checkAlertStatus = () => {
            return this.fetchRofAlertCount( audibleAlertState )
                .then( ( count ) => {
                    rofAlertCount = count
                } )
                .catch( ( e ) => {
                    console.warn( e )
                } )
                .finally( () => {
                    setTimeout( () => { checkAlertStatus() }, queryInterval )
                } )
        }
        checkAlertStatus()

        this.audibleAlertRofInterval = setInterval(() => {
            if ( this.isRouteIncidentTable ) return

            if ( !audibleAlertState.selectedZoneIds || audibleAlertState.selectedZoneIds.length == 0 ) return
            if ( !audibleAlertState.enableReceivedFromPM && !audibleAlertState.enableUnacknowledged ) return
            if ( !rofAlertCount ) return

            try {
                alertAudio.play()
            }
            catch (e) {
                console.warn(e)
            }
        }, audioAlertInterval);
    }

    fetchRofAlertCount(a: AudibleAlertState): Promise<number> {
        let timestamp = ( moment().startOf('day').subtract(30, 'days').unix() * 1000 ).toString()

        let statusCodes = []
        if ( a.enableReceivedFromPM ) statusCodes.push( 'Received' )
        if ( a.enableUnacknowledged ) statusCodes.push( 'Submitted' )

        let fireZoneIds = a.selectedZoneIds || []

        if ( fireZoneIds.length == 0 || statusCodes.length == 0 ) return Promise.resolve( 0 )

        /**
         * Get list of Simple Report of Fires.
         * Get list of Simple Report of Fires.
         * @param searchText Filter the results by the searchText.
         * @param messageStatusCode Filter the results by the messageStatusCode.
         * @param reportOfFireNumber Filter the results by the reportOfFireNumber.
         * @param wildfireYear Filter the results by the wildfireYear.
         * @param interfaceFireInd Filter the results by the interfaceFireInd.
         * @param minimumReportedDate Filter the results by the minimumReportedDate.
         * @param reportedByName Filter the results by the reportedByName.
         * @param receivedByUserId Filter the results by the receivedByUserId.
         * @param receivedByUserGuid Filter the results by the receivedByUserGuid.
         * @param acknowledgedByUserId Filter the results by the acknowledgedByUserId.
         * @param acknowledgedByUserGuid Filter the results by the acknowledgedByUserGuid.
         * @param fireCentreOrgUnitIdentifier Filter the results by the fireCentreOrgUnitIdentifier.
         * @param zoneOrgUnitIdentifier Filter the results by the zoneOrgUnitIdentifier.
         * @param reportedByPartyName Filter the results by the reportedByPartyName.
         * @param callerName Filter the results by the callerName.
         * @param lostCallInd Filter the results by the lostCallInd.
         * @param availableForCallbackInd Filter the results by the availableForCallbackInd.
         * @param publicReportTypeCode Filter the results by the publicReportTypeCode.
         * @param fireSizeComparisionCode Filter the results by the fireSizeComparisionCode.
         * @param rateOfSpreadCode Filter the results by the rateOfSpreadCode.
         * @param smokeColourCode Filter the results by the smokeColourCode.
         * @param submittedAsOfTimestamp Filter the results by the submittedAsOfTimestamp.
         * @param incidentWildfireYear Filter the results by the incidentWildfireYear.
         * @param incidentNumberSequence Filter the results by the incidentNumberSequence.
         * @param relayedInd Filter the results by the relayedInd.
         * @param lastStateChangeAsOfTimestamp Filter the results by the lastStateChangeAsOfTimestamp.
         * @param pageNumber The page number of the results to be returned.
         * @param pageRowCount The number of results per page.
         * @param orderBy Comma separated list of property names to order the result set by.
         * @param expand The level of child resources to load. Zero for no child resources.
         * @param restVersion The version of the Rest API supported by the requesting client.
         * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
         * @param reportProgress flag to report request and response progress.
         */
        return this.simpleReportOfFireListService.getSimpleReportOfFireList(
            undefined,
            statusCodes,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            fireZoneIds,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            timestamp,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            'body',
            undefined
        ).toPromise().then( ( resp ) => {
            return resp.collection.length
        } )
    }
}
