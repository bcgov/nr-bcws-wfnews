import { Component } from '@angular/core';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { formatDate, hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'wfnews-protected-land-preview',
  templateUrl: './protected-land-preview.component.html',
  styleUrls: ['./protected-land-preview.component.scss']
})
export class ProtectedLandPreviewComponent {

  constructor(
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService
  ) {}
  public data;
  public geometry;
  formatDate = formatDate;
  setContent(data) {
    this.data = data.properties;
    this.geometry = data.geometry
  }
  

  closePanel() {  
    hidePanel('desktop-preview');
  }
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  zoomIn(){
    const polygonData = this.commonUtilityService.extractPolygonData(this.geometry?.coordinates);
    if (polygonData) {
      this.mapUtilityService.fixPolygonToMap(polygonData, this.geometry.coordinates);

    }   
  }
  
}
