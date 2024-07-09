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
  @Input() dangerRating: any;

  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  
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
    switch (this.dangerRating.attributes.DANGER_RATING_DESC) {
      case 'Very Low':
        return 'Dry forest fuels are at a very low risk of catching fire.';
      case 'Low':
        return 'Fires may start easily and spread quickly but there will be minimal involvement of deeper fuel layers or larger fuels.';
      case 'Moderate':
        // eslint-disable-next-line max-len
        return 'Forest fuels are drying and there is an increased risk of surface fires starting. Carry out any forest activities with caution.';
      case 'High':
        return 'Forest fuels are very dry and the fire risk is serious. Extreme caution must be used in any forest activities.';
      case 'Extreme':
        // eslint-disable-next-line max-len
        return 'Extremely dry forest fuels and the fire risk is very serious. New fires will start easily, spread rapidly, and challenge fire suppression efforts.';
    }
  }

}
