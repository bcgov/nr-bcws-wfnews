import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateTimeTimeZone, displayDangerRatingDes} from '@app/utils';

@Component({
  selector: 'wfnews-danger-rating-header',
  templateUrl: './danger-rating-header.component.html',
  styleUrls: ['./danger-rating-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DangerRatingHeaderComponent {
  @Input() dangerRating: any;

  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  displayDangerRatingDes = displayDangerRatingDes;
  
  constructor(
    private router: Router,
  ) {}

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.dangerRating.centroid.x,
          latitude: this.dangerRating.centroid.y,
          dangerRating: true,
        },
      });
    }, 200);
  }

  dangerDescription() {
     return displayDangerRatingDes(this.dangerRating?.attributes?.DANGER_RATING_DESC);  
  }

}
