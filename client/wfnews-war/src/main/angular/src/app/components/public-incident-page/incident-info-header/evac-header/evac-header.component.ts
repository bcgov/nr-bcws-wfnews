import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ShareService } from '@app/services/share.service';
import { ResourcesRoutes, convertToDateYear, isMobileView } from '@app/utils';
import { boundsToExtent, extentToParam, ringsToExtent } from '@app/utils/preview-map';

@Component({
  selector: 'wfnews-evac-header',
  templateUrl: './evac-header.component.html',
  styleUrls: ['./evac-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EvacHeaderComponent {
  @Input() evac: any;
  @Input() bounds: any;

  convertToDateYear = convertToDateYear;
  isMobileView = isMobileView;

  constructor(
    private router: Router,
    private shareService: ShareService,
  ) {}

  navToMap() {
    setTimeout(() => {
      const extent = this.bounds ? boundsToExtent(this.bounds) : ringsToExtent(this.evac?.geometry?.rings);
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.evac.centroid.x,
          latitude: this.evac.centroid.y,
          evacuationAlert: true,
          extent: extentToParam(extent),
        },
      });
    }, 200);
  }

  openShareWindow() {
    const incidentType = `Evacuation ${this.evac.attributes.ORDER_ALERT_STATUS}`;
    const name = `Evacuation ${this.evac.attributes.ORDER_ALERT_STATUS} for ${this.evac.attributes.EVENT_NAME}`;
    this.shareService.openShareWindow(incidentType, name);
  }
}

