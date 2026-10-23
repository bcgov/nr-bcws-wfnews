import { Component } from '@angular/core';
import { decodeName } from '../../identify-variants';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-area-restriction-card',
  templateUrl: './identify-area-restriction-card.component.html',
})
export class IdentifyAreaRestrictionCardComponent extends IdentifyCardBase {
  protected readonly compactOnDesktop = true;

  get heading(): string {
    return this.variant.decodeAreaTitle ? decodeName(this.p.NAME) : this.p.NAME;
  }
}
