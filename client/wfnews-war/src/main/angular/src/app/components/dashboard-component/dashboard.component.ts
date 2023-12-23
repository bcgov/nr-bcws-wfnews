import { Component } from '@angular/core';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class Dashboard {
  public selectedTab = 0;

  constructor() {}

  selectTab(tab: number) {
    this.selectedTab = tab;
  }

  offseason() {
    return new Date().getMonth() < 3 || new Date().getMonth() > 9;
  }
}
