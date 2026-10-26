import { Component, EventEmitter, Input, Output } from '@angular/core';
import { formatNumber, getStageOfControlDescription, getStageOfControlIcon, getStageOfControlLabel } from '@app/utils';
import { displayWildfireName } from '@app/utils/identify-results';
import { IdentifyCardBase } from '../identify-card-base';
import { IncidentLoad } from '../identify-card.component';

@Component({
  selector: 'wfnews-identify-wildfire-card',
  templateUrl: './identify-wildfire-card.component.html',
  styleUrls: ['./identify-wildfire-card.component.scss'],
})
export class IdentifyWildfireCardComponent extends IdentifyCardBase {
  /** A wildfire's published Incident, which the host loads. */
  @Input() incident: any;
  @Input() incidentLoad: IncidentLoad = null;
  @Output() retry = new EventEmitter<void>();

  readonly getStageOfControlIcon = getStageOfControlIcon;
  readonly getStageOfControlLabel = getStageOfControlLabel;

  get heading(): string | null {
    if (this.phone) {
      return this.incident?.incidentName || displayWildfireName(this.item);
    }
    return this.incident ? this.incident.incidentName : null;
  }

  get size(): string {
    const hectares = this.incident?.incidentSizeEstimatedHa;
    if (this.variant.sizeSeparators) {
      return hectares < 1 || hectares > 1 ? `${formatNumber(hectares)} Hectares` : `${hectares} Hectare`;
    }
    return `${hectares} ${hectares === 1 ? 'Hectare' : 'Hectares'}`;
  }

  get descriptions(): string[] {
    const stage = getStageOfControlDescription(this.incident.stageOfControlCode);
    return this.item?.layerId === 'active-wildfires-fire-of-note' ? [this.texts.FIRE_OF_NOTE, stage] : [stage];
  }
}
