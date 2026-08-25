import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EXTERNAL_LINKS } from '@app/constants';
import { ResourcesRoutes, snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { DebugAccessService } from '@app/services/debug-access.service';
import { BUILD_NUMBER } from '../../../environments/build-info';

/** Start telling the user when the diagnostics are this close. */
const HINT_FROM = 3;


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

  /** Says how many taps are left, once the user is clearly on purpose. */
  public tapHint = '';

  constructor(
    private router: Router,
    private appConfig: AppConfigService,
    private debugAccess: DebugAccessService) {}

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
        window.open(EXTERNAL_LINKS.BCWS_BLOG, '_blank');
        break;
      case 'facebook':
        window.open(EXTERNAL_LINKS.BCWS_FACEBOOK, '_blank');
        break;
      case 'youtube':
        window.open(EXTERNAL_LINKS.BCWS_YOUTUBE, '_blank');
        break;
      case 'faq':
        window.open(EXTERNAL_LINKS.FAQ, '_blank');
    }
  }

  /**
   * Each tap still turns the version into the build and back, so the label answers
   * every tap. Ten taps in a row open the diagnostics. A gap of two seconds starts
   * the count again, so taps made over a day do not add up.
   */
  toggleVersionDisplay() {
    this.showVersion = !this.showVersion;

    const left = this.debugAccess.tap();
    if (left === 0) {
      this.tapHint = '';
      this.router.navigate([ResourcesRoutes.DEBUG]);
      return;
    }
    this.tapHint = left <= HINT_FROM ? `${left} more to open the diagnostics` : '';
  }
}
