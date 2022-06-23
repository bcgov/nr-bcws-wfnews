import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";
import { WfimMapService } from '../../../services/wfim-map.service';
import { LonLat } from '../../../services/wfim-map.service/util';

@Component({
    selector: 'wf1-location-toolbar',
    templateUrl: 'location-toolbar.component.html',
})
export class LocationToolbarComponent {
    @Input() set location( location: LonLat ) {
        if ( location ) {
            this.selectedLocation.setValue(this.wfimMapService.formatCoordinates(location));
            this.locationSelect.emit(location);
        }
        else {
            this.selectedLocation.setValue('')
            this.locationSelect.emit();
        }
    }

    @Output() locationSelect = new EventEmitter<LonLat>();

    TOOLTIP_DELAY = 500;
    selectedLocation = new FormControl('', this.geometryValidator());
    isPointSelectedOnMap = false

    constructor(
        protected wfimMapService: WfimMapService
    ) {
        this.wfimMapService.selectedPointChange.subscribe( ( pt ) => {
            this.isPointSelectedOnMap = !!pt
        } )
    }

    geometryValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if ( !control.value )
                return null;

            const coordinates = this.wfimMapService.parseCoordinates( control.value )
            if ( !coordinates )
                return { invalidGeom: 'The geometry is invalid' };

            this.wfimMapService.setAnchor( coordinates )
            return null;
        };
    }

    zoomToSelectedLocation() {
        this.wfimMapService.zoomToAnchor()
    }

    setAnchorFromMap() {
        return this.wfimMapService.getSelectedPoint()
            .then( ( point ) => {
                if ( point ) {
                    this.selectedLocation.setValue( this.wfimMapService.formatCoordinates( point ) )
                    this.locationSelect.emit( point )
                }
                else if ( this.selectedLocation.value ) {
                    this.locationSelect.emit( this.wfimMapService.parseCoordinates( this.selectedLocation.value ) )
                }
                else {
                    this.locationSelect.emit( null )
                }
            } )
            .catch( ( e ) => {
                console.warn( e )
                this.locationSelect.emit( null )
            } )
    }

    clearSelectedLocation() {
        this.selectedLocation.setValue( '' )
        this.wfimMapService.setAnchor( null )
        this.wfimMapService.clearSelectedPoint()
        this.locationSelect.emit( null )
    }

    get hasSelectedLocation() {
        return !!this.selectedLocation.value
    }
}
