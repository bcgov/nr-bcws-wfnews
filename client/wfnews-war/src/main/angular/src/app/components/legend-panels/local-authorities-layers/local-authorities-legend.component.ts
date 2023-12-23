import { Component } from '@angular/core';
import { checkLayerVisible } from '@app/utils';

@Component({
  selector: 'wfnews-local-authorities-legend',
  templateUrl: './local-authorities-legend.component.html',
  styleUrls: ['./local-authorities-legend.component.scss'],
})
export class LocalAuthoritiesLegendComponent {
  public checkLayerVisible = checkLayerVisible;

  constructor() {}
}
