import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from "@angular/core";
import { WFMapService } from "../../services/wf-map.service";

let mapIndexAuto = 0
let initPromise = Promise.resolve()

@Component({
  selector: 'wf-map-container',
  templateUrl: './wf-map-container.component.html',
  styleUrls: [ './wf-map-container.component.scss' ]
})
export class WFMapContainerComponent implements OnDestroy, OnChanges  {
    @Input() mapIndex: number = 0;
    @Input() mapConfig: Array<any>;

    @Output() mapInitialized = new EventEmitter<any>();

    @ViewChild('mapContainer') mapContainer;

    private initPromise: Promise<any>; // = Promise.resolve()
    private mapIndexAuto

    constructor(
        protected wfMap: WFMapService
    ) {
        mapIndexAuto += 1
        this.mapIndexAuto = mapIndexAuto
        // console.log('WFMapContainerComponent constructor',this.mapIndexAuto)
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
                config: mapConfig
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

}

function clone( o ) { return JSON.parse( JSON.stringify( o ) ) }