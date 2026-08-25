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
  disclaimerUrl = this.appConfig.getConfig().externalAppConfig['disclaimerUrl'].toString();
  privacyUrl = this.appConfig.getConfig().externalAppConfig['privacyUrl'].toString();
  copyrightUrl = this.appConfig.getConfig().externalAppConfig['copyrightUrl'].toString();

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
        window.open(this.appConfig.getConfig().externalAppConfig['bcwsBlogUrl'].toString(), '_blank');
        break;
      case 'facebook':
        window.open(this.appConfig.getConfig().externalAppConfig['bcwsFacebookUrl'].toString(), '_blank');
        break;
      case 'youtube':
        window.open(this.appConfig.getConfig().externalAppConfig['bcwsYoutubeUrl'].toString(), '_blank');
        break;
      case 'faq':
        window.open(this.appConfig.getConfig().externalAppConfig['faqUrl'].toString(), '_blank');
    }
  }

  toggleVersionDisplay() {
    this.showVersion = !this.showVersion;
  }
}
