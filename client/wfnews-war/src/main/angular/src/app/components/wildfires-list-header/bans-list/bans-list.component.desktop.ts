import { Component } from '@angular/core';
import { BansListComponent } from './bans-list.component';

@Component({
  selector: 'wf-bans-list-desktop',
  templateUrl: './bans-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './bans-list.component.desktop.scss',
  ],
})
export class BansListComponentDesktop extends BansListComponent {
  columnsToDisplay = ['fireCentre', 'type', 'details', 'issuedOn', 'viewMap'];
}
