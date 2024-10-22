import { Component, OnDestroy } from '@angular/core';
import { MapConfigService } from '@app/services/map-config.service';
import { convertToDateYear, hidePanel, showPanel, openLink, zoomInWithLocationPin, getActiveMap } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-road-events-preview',
  templateUrl: './road-events-preview.component.html',
  styleUrls: ['./road-events-preview.component.scss']
})
export class RoadEventsPreviewComponent implements OnDestroy {

  constructor(private mapConfigService: MapConfigService,
    private appConfigService: AppConfigService
  ) { }

  convertToDateYear = convertToDateYear;
  openLink = openLink
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

  goBack() {
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }

  openDriveBC() {
    let url: string = null;

    if (this.data?.properties?.SOURCE_ID) {
      url = 'https://drivebc.ca/mobile/pub/events/id/' + this.data.properties.SOURCE_ID + '.html';
    }

    else url = this.appConfigService.getConfig().externalAppConfig[
      'driveBCUrl'
    ] as unknown as string

    window.open(url, '_blank');
  }

}
