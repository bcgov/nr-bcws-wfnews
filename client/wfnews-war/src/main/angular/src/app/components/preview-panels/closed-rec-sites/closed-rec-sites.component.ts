import { Component, OnDestroy } from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { convertToDateYear, getActiveMap, hidePanel, showPanel, zoomInWithLocationPin } from '@app/utils';

@Component({
  selector: 'wfnews-closed-rec-sites',
  templateUrl: './closed-rec-sites.component.html',
  styleUrls: ['./closed-rec-sites.component.scss']
})
export class ClosedRecSitesComponent implements OnDestroy {
  constructor(private mapConfigService: MapConfigService) {}

  convertToDateYear = convertToDateYear;
  zoomInWithLocationPin = zoomInWithLocationPin;
  public data;
  defaultZoomLevel = 11;
  pinDrop;

  ngOnDestroy(): void {
    const viewer = getActiveMap().$viewer;
    if (this.pinDrop) {
      viewer.map.removeLayer(this.pinDrop);
    }
  }


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