import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';

@Component({
  selector: 'wfnews-ban-header',
  templateUrl: './ban-header.component.html',
  styleUrls: ['./ban-header.component.scss'],
  encapsulation: ViewEncapsulation.None // This line disables view encapsulation
})
export class BanHeaderComponent {
  convertToDateYear = convertToDateYear;

  constructor(
    private router: Router,
  ) {}


  @Input() ban: any;

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.ban.centroid.x,
          latitude: this.ban.centroid.y,
          bansProhibitions: true,
        },
      });
    }, 200);
  }
  replaceCategoryDescription(description: string): string {
    if (description.includes("Category 1")) {
      return description.replace("Category 1", "Category 1 (Campfires)");
    }
    return description;
  }

  openShareWindow(mode: string | null) {

  }

}
