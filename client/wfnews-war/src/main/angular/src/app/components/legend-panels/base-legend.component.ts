import { Component, Input } from '@angular/core';
import { checkLayerVisible } from '@app/utils';

@Component({
  selector: 'wfnews-base-legend',
  templateUrl: './base-legend.component.html',
  styleUrls: ['./base-legend.component.scss'],
})
export class BaseLegendComponent {
  @Input() public featureLayerID: string;

  public checkLayerVisible = checkLayerVisible;

  constructor() {}
}
