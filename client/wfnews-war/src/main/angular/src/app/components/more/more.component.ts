import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

@Component({
  selector: 'wfnews-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
})
export class MoreComponent {
  constructor(private router: Router) {}

  navigate(menu) {
    switch (menu) {
      case 'wildfire-list':
        this.router.navigate([ResourcesRoutes.WILDFIRESLIST]);
        break;
      case 'resources':
        this.router.navigate([ResourcesRoutes.RESOURCES]);
        break;
      case 'contact-us':
        this.router.navigate([ResourcesRoutes.CONTACT_US]);
        break;
      case 'blog':
        window.open('https://blog.gov.bc.ca/bcwildfire/', '_blank');
        break;
      case 'facebook':
        window.open('https://www.facebook.com/BCForestFireInfo/', '_blank');
        break;
      case 'youtube':
        window.open('https://www.youtube.com/@BCWildfireService', '_blank');
        break;
      case 'twitter':
        window.open('https://twitter.com/BCGovFireInfo', '_blank');
        break;
    }
  }
}
