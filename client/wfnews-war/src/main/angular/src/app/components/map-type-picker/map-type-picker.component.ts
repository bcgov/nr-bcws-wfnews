import { Component } from '@angular/core';
import { WFMapService } from '@app/services/wf-map.service';

@Component({
  selector: 'map-type-picker',
  templateUrl: './map-type-picker.component.html',
  styleUrls: ['./map-type-picker.component.scss']
})
export class MapTypePickerComponent {

  constructor(protected mapService: WFMapService) { }

  isSelected(mapType: string) {
    return mapType?.toUpperCase() === this.getMapType()?.toUpperCase();;
  }

  getMapType() {
    return this.mapService.getBaseMap()?.find((basemap) => !!basemap.options.wfnewsId)?.options?.wfnewsId;
  }

  onSelect(mapTypeId) {
    this.mapService.setBaseMap(mapTypeId);
  }

}
