import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';
import { extentToParam, ringsToExtent } from '@app/utils/preview-map';
import { ShareService } from '@app/services/share.service';

@Component({
  selector: 'wfnews-area-restriction-header',
  templateUrl: './area-restriction-header.component.html',
  styleUrls: ['./area-restriction-header.component.scss'],
  encapsulation: ViewEncapsulation.None // This line disables view encapsulation

})
export class AreaRestrictionHeaderComponent {
  convertToDateYear = convertToDateYear;

  constructor(
    private router: Router,
    private shareService: ShareService,
  ) {}


  @Input() areaRestriction: any;

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.areaRestriction.centroid.x,
          latitude: this.areaRestriction.centroid.y,
          areaRestriction: true,
          extent: extentToParam(ringsToExtent(this.areaRestriction.geometry?.rings)),
        },
      });
    }, 200);
  }

  openShareWindow() {
    const name = this.areaRestriction.attributes.NAME;
    this.shareService.openShareWindow('Area restriction',name);
  }
}
