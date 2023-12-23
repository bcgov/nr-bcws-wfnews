import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PanelWildfireStageOfControlComponent } from './panel-wildfire-stage-of-control.component';

@Component({
  selector: 'panel-wildfire-stage-of-control',
  templateUrl: './panel-wildfire-stage-of-control.component.html',
  styleUrls: [
    '../common/base-collection/collection.component.scss',
    './panel-wildfire-stage-of-control.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelWildfireStageOfControlComponentDesktop extends PanelWildfireStageOfControlComponent {}
