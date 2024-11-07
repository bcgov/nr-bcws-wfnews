import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { BUILD_NUMBER } from '../../../environments/build-info';


@Component({
  selector: 'wfnews-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
})
export class MoreComponent implements OnInit{
  public versionNumber;
  public snowPlowHelper = snowPlowHelper;
  public buildNumber: string;
  public showVersion = true;

  constructor(
    private router: Router,
    private appConfig: AppConfigService) {}

  ngOnInit(): void {
    const version = this.appConfig.getConfig().application.version;
    if (version) {
      this.versionNumber = 'Version ' + version;
    }
    if (BUILD_NUMBER) {
      this.buildNumber = ' Build: ' + BUILD_NUMBER;
    }
  }

  navigate(menu) {
    const url = this.appConfig.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.snowPlowHelper(url, {
      action: 'more_menu_navigation',
      text: menu,
    });
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

  toggleVersionDisplay() {
    this.showVersion = !this.showVersion;
  }
}
