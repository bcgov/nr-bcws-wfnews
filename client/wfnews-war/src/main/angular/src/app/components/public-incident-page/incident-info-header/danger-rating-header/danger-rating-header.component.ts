import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateTimeTimeZone, displayDangerRatingDescription} from '@app/utils';
import { extentToParam, ringsToExtent } from '@app/utils/preview-map';
import { ShareService } from '@app/services/share.service';

@Component({
  selector: 'wfnews-danger-rating-header',
  templateUrl: './danger-rating-header.component.html',
  styleUrls: ['./danger-rating-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DangerRatingHeaderComponent {
  @Input() dangerRating: any;

  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  displayDangerRatingDescription = displayDangerRatingDescription;
  
  constructor(
    private router: Router,
    private shareService: ShareService,
  ) {}

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.dangerRating.centroid.x,
          latitude: this.dangerRating.centroid.y,
          dangerRating: true,
          extent: extentToParam(ringsToExtent(this.dangerRating.geometry?.rings)),
        },
      });
    }, 200);
  }

  dangerDescription() {
     return displayDangerRatingDescription(this.dangerRating?.attributes?.DANGER_RATING_DESC);  
  }

  openShareWindow() {
    const name = `${this.dangerRating.attributes.DANGER_RATING_DESC} Danger Rating`;
    this.shareService.openShareWindow('Danger Rating',name);
  }
}
