import { Component } from '@angular/core';
import { EvacListComponent } from './evac-list.component';

@Component({
  selector: 'wf-evac-list-desktop',
  templateUrl: './evac-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './evac-list.component.desktop.scss',
  ],
})
export class EvacListComponentDesktop extends EvacListComponent {
  columnsToDisplay = [
    'name',
    'status',
    'issuedOn',
    'agency',
    'distance',
    'viewMap',
  ];
}
