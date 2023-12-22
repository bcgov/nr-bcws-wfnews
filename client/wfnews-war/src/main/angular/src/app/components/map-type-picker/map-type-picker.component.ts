import { Component } from '@angular/core';
import { WFMapService } from '@app/services/wf-map.service';

@Component({
  selector: 'map-type-picker',
  templateUrl: './map-type-picker.component.html',
  styleUrls: ['./map-type-picker.component.scss'],
})
export class MapTypePickerComponent {
  constructor(protected mapService: WFMapService) {}

  isSelected(mapType: string) {
    return mapType?.toUpperCase() === this.getMapType()?.toUpperCase();
  }

  getMapType() {
    const basemap = this.mapService.getBaseMap();
    if (Array.isArray(basemap) && basemap.length > 0) {
      return this.mapService.getBaseMap()[0].id;
    } else {
      return '';
    }
  }

  onSelect(mapTypeId) {
    this.mapService.setBaseMap(mapTypeId);
  }
}
