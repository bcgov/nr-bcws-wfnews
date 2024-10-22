import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';

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
    private commonUtilityService: CommonUtilityService
  ) {}


  @Input() areaRestriction: any;

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.areaRestriction.centroid.x,
          latitude: this.areaRestriction.centroid.y,
          areaRestriction: true,
        },
      });
    }, 200);
  }

  openShareWindow() {
    const name = this.areaRestriction.attributes.NAME;
    this.commonUtilityService.openShareWindow('Area restriction',name);
  }
}
