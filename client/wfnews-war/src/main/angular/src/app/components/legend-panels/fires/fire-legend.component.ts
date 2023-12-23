import { Component } from '@angular/core';
import { checkLayerVisible } from '@app/utils';

@Component({
  selector: 'wfnews-fire-legend',
  templateUrl: './fire-legend.component.html',
  styleUrls: ['./fire-legend.component.scss'],
})
export class FireLegendComponent {
  public checkLayerVisible = checkLayerVisible;

  constructor() {}
}
