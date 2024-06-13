import { Component } from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { convertToDateYear, hidePanel, showPanel, getActiveMap } from '@app/utils';

@Component({
  selector: 'wfnews-closed-rec-sites',
  templateUrl: './closed-rec-sites.component.html',
  styleUrls: ['./closed-rec-sites.component.scss']
})
export class ClosedRecSitesComponent {
  constructor(private mapConfigService: MapConfigService) {}

  convertToDateYear = convertToDateYear;
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

