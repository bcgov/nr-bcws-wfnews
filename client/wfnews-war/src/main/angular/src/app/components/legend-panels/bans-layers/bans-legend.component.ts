import { Component } from '@angular/core';
import { checkLayerVisible } from '@app/utils';

@Component({
  selector: 'wfnews-bans-legend',
  templateUrl: './bans-legend.component.html',
  styleUrls: ['./bans-legend.component.scss'],
})
export class BansLegendComponent {
  public checkLayerVisible = checkLayerVisible;

  constructor() {}
}
