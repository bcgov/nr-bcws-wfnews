import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtilityService } from '@app/services/common-utility.service';
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
    private commonUtilityService: CommonUtilityService
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

  openShareWindow() {
    const name = `Fire Ban on ${this.replaceCategoryDescription(this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION)} Open Fires`;
    this.commonUtilityService.openShareWindow('Fire Ban',name);
  }

}
