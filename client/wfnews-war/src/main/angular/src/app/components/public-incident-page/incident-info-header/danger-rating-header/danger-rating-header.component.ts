import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateTimeTimeZone } from '@app/utils';

@Component({
  selector: 'wfnews-danger-rating-header',
  templateUrl: './danger-rating-header.component.html',
  styleUrls: ['./danger-rating-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DangerRatingHeaderComponent {
  convertToDateTimeTimeZone = convertToDateTimeTimeZone;

  constructor(
    private router: Router,
  ) {}

  @Input() dangerRating: any;

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
    switch (this.dangerRating.attributes.DANGER_RATING_DESC) {
      case 'Very Low':
        return 'Dry forest fuels are at a very low risk of catching fire.';
      case 'Low':
        return 'Fires may start easily and spread quickly but there will be minimal involvement <br>of deeper fuel layers or larger fuels.';
      case 'Moderate':
        return 'Forest fuels are drying and there is an increased risk of surface fires starting.<br>  Carry out any forest activities with caution.';
      case 'High':
        return 'Forest fuels are very dry and the fire risk is serious. <br> Extreme caution must be used in any forest activities.';
      case 'Extreme':
        return 'Extremely dry forest fuels and the fire risk is very serious.<br> New fires will start easily, spread rapidly, and challenge fire suppression efforts.';
    }
  }

}
