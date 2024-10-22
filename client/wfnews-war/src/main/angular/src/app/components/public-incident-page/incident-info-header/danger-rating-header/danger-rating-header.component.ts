import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ResourcesRoutes, convertToDateTimeTimeZone, displayDangerRatingDescription} from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

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
    private commonUtilityService: CommonUtilityService
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
     return displayDangerRatingDescription(this.dangerRating?.attributes?.DANGER_RATING_DESC);  
  }

  openShareWindow() {
    const name = `${this.dangerRating.attributes.DANGER_RATING_DESC} Danger Rating`;
    this.commonUtilityService.openShareWindow('Danger Rating',name);
  }
}
