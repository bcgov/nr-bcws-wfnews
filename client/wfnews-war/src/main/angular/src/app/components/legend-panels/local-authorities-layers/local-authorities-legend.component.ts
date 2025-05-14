import { Component } from '@angular/core';
import { INFORMATION_TEXTS } from '@app/constants';
import { checkLayerVisible } from '@app/utils';

@Component({
  selector: 'wfnews-local-authorities-legend',
  templateUrl: './local-authorities-legend.component.html',
  styleUrls: ['./local-authorities-legend.component.scss'],
})
export class LocalAuthoritiesLegendComponent {
  public checkLayerVisible = checkLayerVisible;
  localAuthoritiesInfoText = INFORMATION_TEXTS.BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY;

  constructor() {}
}
