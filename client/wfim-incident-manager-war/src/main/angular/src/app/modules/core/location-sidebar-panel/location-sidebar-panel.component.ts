import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicSidebarPanelComponent } from "@wf1/core-ui";
import { LonLat } from '../../../services/wfim-map.service/util';

@Component({
    selector: 'wf1-location-sidebar-panel',
    templateUrl: `./location-sidebar-panel.component.html`,
    styles: []
})
export class LocationSidebarPanelComponent extends BasicSidebarPanelComponent {
    @Input() set location(location: LonLat) {
        if (location) {
            this.selectedLocation = location
        }
    }

    selectedLocation: LonLat;

    @Output() locationSelect = new EventEmitter<LonLat>();

    isInitializing = true;

    locationSelected(coordinates: LonLat) {
        this.locationSelect.emit(coordinates);
    }
}
