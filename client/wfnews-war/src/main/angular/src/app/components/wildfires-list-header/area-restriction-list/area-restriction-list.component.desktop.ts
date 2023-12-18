import { Component } from '@angular/core';
import { AreaRestrictionListComponent } from './area-restriction-list.component';

@Component({
  selector: 'wf-area-restriction-list-desktop',
  templateUrl: './area-restriction-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './area-restriction-list.component.desktop.scss',
  ],
})
export class AreaRestrictionListComponentDesktop extends AreaRestrictionListComponent {
  columnsToDisplay = ['name', 'issuedOn', 'fireCentre', 'distance', 'viewMap'];
}
