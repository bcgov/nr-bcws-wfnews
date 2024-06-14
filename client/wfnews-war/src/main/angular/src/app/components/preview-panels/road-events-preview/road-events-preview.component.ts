import { Component } from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { convertToDateYear, hidePanel, showPanel, openLink, zoomInWithLocationPin } from '@app/utils';
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
  zoomInWithLocationPin = zoomInWithLocationPin;
  public data;
  defaultZoomLevel = 11;
  pinDrop;
  
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

}
