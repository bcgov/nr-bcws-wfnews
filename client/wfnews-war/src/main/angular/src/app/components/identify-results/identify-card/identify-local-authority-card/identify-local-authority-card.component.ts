import { Component } from '@angular/core';
import { INFORMATION_TEXTS } from '@app/constants';
import { displayLocalAuthorityType } from '@app/utils';
import { IdentifyCardBase } from '../identify-card-base';

const LOCAL_AUTHORITY_INFO: Record<string, string> = {
  'abms-regional-districts': INFORMATION_TEXTS.REGIONAL_DISTRICTS_BANS_INFO,
  'clab-indian-reserves': INFORMATION_TEXTS.BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY,
  'abms-municipalities': INFORMATION_TEXTS.MUNICIPALITY_INFO,
  'fnt-treaty-land': INFORMATION_TEXTS.BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY,
};

@Component({
  selector: 'wfnews-identify-local-authority-card',
  templateUrl: './identify-local-authority-card.component.html',
  styleUrls: ['./identify-local-authority-card.component.scss'],
})
export class IdentifyLocalAuthorityCardComponent extends IdentifyCardBase {
  get type(): string {
    return displayLocalAuthorityType(this.item.layerId);
  }

  get info(): string {
    return LOCAL_AUTHORITY_INFO[this.item?.layerId];
  }
}
