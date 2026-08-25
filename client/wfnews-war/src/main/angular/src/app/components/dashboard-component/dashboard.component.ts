import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class Dashboard {
  public selectedTab = 0;
  public snowPlowHelper = snowPlowHelper;

  /**
   * Which widgets have been made. A widget asks the API when it is made, so an
   * empty slot costs nothing. `wfnewsDeferLoad` fills these in as the user scrolls.
   */
  public shown: Record<string, boolean> = {};

  show(widget: string): void {
    this.shown[widget] = true;
  }

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
  ) {}

  selectTab(tab: number) {
    this.selectedTab = tab;
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    let text = tab === 0 ? 'Current Situation' : tab === 1 ? 'Totals this year' : '';
    this.snowPlowHelper(url, {
      action: 'dashboard_click',
      text: text,
    });
  }

  offseason() {
    return new Date().getMonth() < 3 || new Date().getMonth() > 9;
  }
}
