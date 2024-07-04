import { Component, OnInit } from '@angular/core';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { convertToDateYear, hidePanel, showPanel, displayLocalAuthorityType } from '@app/utils';

@Component({
  selector: 'wfnews-local-authorities',
  templateUrl: './local-authorities.component.html',
  styleUrls: ['./local-authorities.component.scss']
})
export class LocalAuthoritiesComponent implements OnInit{
  constructor(
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService
  ) { }
  
  convertToDateYear = convertToDateYear;
  displayLocalAuthorityType = displayLocalAuthorityType;
  public data;

  ngOnInit(): void {
    this.zoomIn();
  }

  setContent(data) {
    this.data = data;
  }

  closePanel() {
    hidePanel('desktop-preview');
  }

  goBack() {
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  zoomIn() {
    if (this.data?.layerId && this.data?.geometry?.coordinates?.length > 0) { 

        if(this.data?.layerId === 'abms-regional-districts' || this.data?.layerId === 'abms-municipalities') {  
            if(this.data.geometry.coordinates[0][0] && this.isNumberArray(this.data.geometry.coordinates[0][0]) && this.data.geometry.coordinates[0].length === 1) {
              this.mapUtilityService.fixPolygonToMap(this.data.geometry.coordinates[0][0], this.data.geometry.coordinates[0]);
            }
            else if(this.data.geometry.coordinates[0] && this.isNumberArray(this.data.geometry.coordinates[0])) {
              this.mapUtilityService.fixPolygonToMap(this.data.geometry.coordinates[0], this.data.geometry.coordinates);
            } 
        } else {
          const coordinates = this.commonUtilityService.extractPolygonData(this.data.geometry.coordinates[0]);
          if (coordinates.length) {
            this.mapUtilityService.fixPolygonToMap(coordinates);
          }
        }
    }
  }

 isNumberArray(array) {
  const num = parseFloat(array[0]);
  return Number.isNaN(num) ? false : true;
 }

}
