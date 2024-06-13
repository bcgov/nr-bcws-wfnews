import { Component } from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { convertToDateYear, hidePanel, showPanel, openLink, getActiveMap } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-road-events-preview',
  templateUrl: './road-events-preview.component.html',
  styleUrls: ['./road-events-preview.component.scss']
})
export class RoadEventsPreviewComponent {

  constructor(private mapConfigService: MapConfigService) {}

  convertToDateYear = convertToDateYear;
  openLink = openLink
  public data;
  defaultZoomLevel = 13;
  
  setContent(data) {
    this.data = data;
  }

  closePanel() {
    hidePanel('desktop-preview');
  }
  
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }
  
  zoomIn(){
    const long = Number(this.data?._identifyPoint?.longitude);
    const lat = Number(this.data?._identifyPoint?.latitude);

    if(long && lat) {
      this.mapConfigService.getMapConfig().then(() => {
        getActiveMap().$viewer.panToFeature(
          window['turf'].point([long, lat]),
          this.defaultZoomLevel
        );
      });
    }
  }

}
