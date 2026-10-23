import { Component } from '@angular/core';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-closed-recreation-site-card',
  templateUrl: './identify-closed-recreation-site-card.component.html',
})
export class IdentifyClosedRecreationSiteCardComponent extends IdentifyCardBase {
  get description(): string {
    return this.variant.closureComment ? this.p.CLOSURE_COMMENT : this.texts.CLOSED_RECREATION_SITE;
  }
}
