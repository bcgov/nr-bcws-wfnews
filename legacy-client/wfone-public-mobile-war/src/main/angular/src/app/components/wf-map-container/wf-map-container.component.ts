import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, NgZone, Injector, ChangeDetectorRef, Type, ComponentRef, ViewContainerRef, ComponentFactoryResolver} from "@angular/core";
import { WFMapService } from "../../services/wf-map.service";
import { IncidentDetailComponent } from '../incident-detail-panel/incident-detail.component';
import { AppConfigService } from '@wf1/core-ui';
import { HttpClient } from "@angular/common/http";


let mapIndexAuto = 0
let initPromise = Promise.resolve()

@Component({
  selector: 'wf-map-container',
  templateUrl: './wf-map-container.component.html',
  styleUrls: [ './wf-map-container.component.scss' ]
})
export class WFMapContainerComponent implements OnDestroy, OnChanges  {
    @ViewChild('identifyContainer', { read: ViewContainerRef }) identifyContainer: ViewContainerRef;

    @Input() mapIndex: number = 0;
    @Input() mapConfig: Array<any>;
    @Input() baseMap: string;
    @Input() showRof: boolean = false
    @Input() showNearMe: boolean = false

    @Output() mapInitialized = new EventEmitter<any>();
    @Output() rofClick = new EventEmitter<any>();
    @Output() pushNotificationClick = new EventEmitter<any>();
    @Output() nearMeClick = new EventEmitter<any>();

    @ViewChild('mapContainer') mapContainer;

    private initPromise: Promise<any>; // = Promise.resolve()
    private mapIndexAuto
    private zone: NgZone;
    private componentRef: ComponentRef<any>;


    constructor(
        protected appConfigService: AppConfigService,
        protected httpClient: HttpClient,
        protected wfMap: WFMapService,
        protected injector: Injector,
        protected cdr: ChangeDetectorRef,
        protected componentFactoryResolver: ComponentFactoryResolver

    ) {
        mapIndexAuto += 1
        this.mapIndexAuto = mapIndexAuto
        // console.log('WFMapContainerComponent constructor',this.mapIndexAuto)
        this.zone = this.injector.get(NgZone)
    }

    ngOnDestroy() {
        this.destroyMap()
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log("ngOnChanges", clone(changes),clone(this.mapConfig));
        this.initMap()
    }

    initMap(): void {
        var self = this

        var mapIndex = this.mapIndex || this.mapIndexAuto,
            mapConfig = clone( this.mapConfig )

        if ( !mapConfig ) return

        this.destroyMap()

        // console.log( "initMap", mapIndex );

        initPromise = initPromise.then( function () {
            // console.log("initMap");

            return self.wfMap.createSMK( {
                id: mapIndex,
                containerSel: self.mapContainer.nativeElement,
                config: mapConfig,
                baseMap: self.baseMap
            } )
            .then( function ( smk ) {
                // console.log("map created");
                self.mapInitialized.emit( smk )

                return smk
            } )
        } ).catch( function ( e ) {
            console.warn( e )
        } )
        this.initPromise = initPromise
    }

    destroyMap(): void {
        if ( !this.initPromise ) return

        this.initPromise = this.initPromise.then( function ( smk ) {
            if ( !smk ) return

            // console.log( "destroyMap", smk.$option.id );

            smk.destroy()
        } )
    }

    onCreateRof() {
        this.rofClick.emit()
    }

    onPushNotification() {
        this.pushNotificationClick.emit()
    }

    onNearMe() {
        this.nearMeClick.emit()
    }
}

function clone( o ) { return JSON.parse( JSON.stringify( o ) ) }