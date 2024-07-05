import { AfterContentInit, Component } from '@angular/core';
import { MapUtilityService } from '@app/components/preview-panels/map-share-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { convertToDateYear, hidePanel, showPanel, displayLocalAuthorityType } from '@app/utils';

@Component({
  selector: 'wfnews-local-authorities',
  templateUrl: './local-authorities.component.html',
  styleUrls: ['./local-authorities.component.scss']
})
export class LocalAuthoritiesComponent implements AfterContentInit{
  constructor(
    private commonUtilityService: CommonUtilityService,
    private mapUtilityService: MapUtilityService
  ) { }
  
  convertToDateYear = convertToDateYear;
  displayLocalAuthorityType = displayLocalAuthorityType;
  public data;

  ngAfterContentInit(): void {
    try {
      this.zoomIn();
    } catch(error) {
      console.error('Could not zoom to local authority: ' + error)
    }
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
        if(this.isNumberArray(this.data.geometry.coordinates[0][0])) {
          this.mapUtilityService.fixMultipolygonToMap(this.data.geometry.coordinates, this.data.geometry.coordinates);
        } else if(this.isNumberArray(this.data.geometry.coordinates[0])) {
          this.mapUtilityService.fixPolygonToMap(this.data.geometry.coordinates[0], this.data.geometry.coordinates)
        } 
    }
  }

 isNumberArray(array) {
  return typeof array[0][0] === 'number';
 }

}
