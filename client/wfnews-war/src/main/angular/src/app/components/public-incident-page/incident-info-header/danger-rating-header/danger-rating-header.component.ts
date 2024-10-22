import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
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
    private appConfigService: AppConfigService,
    private dialog: MatDialog
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
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.dialog.open(ShareDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: '500px',
      data: {
        incidentType: 'Danger Rating',
        currentUrl: url,
        name: `${this.dangerRating.attributes.DANGER_RATING_DESC} Danger Rating`
      },
    });
  }
}
