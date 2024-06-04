import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateTimeTimeZone } from '@app/utils';

@Component({
  selector: 'wfnews-area-restriction-header',
  templateUrl: './area-restriction-header.component.html',
  styleUrls: ['./area-restriction-header.component.scss'],
  encapsulation: ViewEncapsulation.None // This line disables view encapsulation

})
export class AreaRestrictionHeaderComponent {
  convertToDateTimeTimeZone = convertToDateTimeTimeZone;

  constructor(
    private router: Router,

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

}
