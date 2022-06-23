import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Smk, WfimMapService } from "../../services/wfim-map.service";

@Component({
    selector: 'wfim-measure',
    templateUrl: './measure.component.html',
    styleUrls: [ './measure.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeasureComponent implements AfterViewInit {
    loading = true;

    distanceMeasurement
    areaMeasurement

    constructor(
        protected changeDetector: ChangeDetectorRef,
        protected wfimMapService: WfimMapService
    ) {
    }

    ngAfterViewInit(): void {
    }

    setSmk( smk: Smk ) {
        smk.on( 'MeasureTool', {
            'measure-distance': ( m ) => {
                // console.log( 'distance', m )
                this.distanceMeasurement = m
                this.changeDetector.detectChanges()
            }, 
            'measure-area': ( m ) => {
                // console.log( 'area', m )
                this.areaMeasurement = m
                this.changeDetector.detectChanges()
            }, 
            'start-area': () => this.cancelMeasurement(),
            'start-distance': () => this.cancelMeasurement(),
            'cancel': () => this.cancelMeasurement(),
        } )
    }

    cancelMeasurement() {
        this.distanceMeasurement = null
        this.areaMeasurement = null
        this.changeDetector.detectChanges()
    }

    selectMiddle() {
        const turf = window[ 'turf' ]
        let ls = turf.lineString( this.distanceMeasurement.points.map( ( p ) => [ p.lng, p.lat ] ) )
        let pt = turf.along( ls, turf.length( ls ) / 2 )

        this.setSelectedPoint( pt )
    }
    selectEnd() {
        let p = this.distanceMeasurement.points[ this.distanceMeasurement.points.length - 1 ]
        let pt = window[ 'turf' ].point( [ p.lng, p.lat ] )

        this.setSelectedPoint( pt )
    }

    setSelectedPoint( pt: any ) {
        this.wfimMapService.clearSelectedPoint()
            .then( () => {
                return this.wfimMapService.putTemporaryLayer( 'measure', () => {
                    let c =  pt.geometry.coordinates
                    return window[ 'L' ].marker( [ c[ 1 ],c[ 0 ] ], { interactive: false } )
                } )        
            } )
            .then( () => {
                window[ 'SMK' ].HANDLER.get( 'MarkupTool--point', 'markup-created' )( null, this, pt )
            } )
    }

    removeMarkup() {
        this.wfimMapService.clearTemporaryLayer( 'measure' )
    }
}
