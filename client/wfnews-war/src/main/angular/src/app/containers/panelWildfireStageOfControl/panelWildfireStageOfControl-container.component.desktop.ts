import { Component, Input } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { PanelWildfireStageOfControlContainer } from './panelWildfireStageOfControl-container.component';

@Component({
  selector: 'desktop-legend-panel',
  template: ` <panel-wildfire-stage-of-control
    [collection]="collection$ | async"
    [searchState]="searchState$ | async"
    [loadState]="loadState$ | async"
    [errorState]="errorState$ | async"
    [selectedPanel]="selectedPanel"
  ></panel-wildfire-stage-of-control>`,
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class PanelWildfireStageOfControlContainerDesktop extends PanelWildfireStageOfControlContainer {
  @Input() selectedPanel: string;
}
