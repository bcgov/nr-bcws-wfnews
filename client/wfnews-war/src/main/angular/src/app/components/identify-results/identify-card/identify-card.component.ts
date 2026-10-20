import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IDENTIFY_TEXTS, INFORMATION_TEXTS } from '@app/constants';
import {
  convertToDateYear,
  displayDangerRatingDescription,
  displayLocalAuthorityType,
  formatDate,
  formatNumber,
  formatWeatherHourRelative,
  getStageOfControlDescription,
  getStageOfControlIcon,
  getStageOfControlLabel,
} from '@app/utils';
import { IdentifyKind, displayWildfireName, identifyKind } from '@app/utils/identify-results';
import { IDENTIFY_VARIANTS, IdentifyLayout, decodeName } from '../identify-variants';

export type IncidentLoad = 'loading' | 'done' | 'failed' | 'unavailable' | null;

// On desktop these previews put their description in a card line and keep a bottom margin.
const DESKTOP_COMPACT: IdentifyKind[] = ['area-restriction', 'ban', 'danger-rating', 'protected-land'];

const LOCAL_AUTHORITY_INFO: Record<string, string> = {
  'abms-regional-districts': INFORMATION_TEXTS.REGIONAL_DISTRICTS_BANS_INFO,
  'clab-indian-reserves': INFORMATION_TEXTS.BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY,
  'abms-municipalities': INFORMATION_TEXTS.MUNICIPALITY_INFO,
  'fnt-treaty-land': INFORMATION_TEXTS.BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY,
};

/** One identify result, on the phone Drawer and in the desktop preview. */
@Component({
  selector: 'wfnews-identify-card',
  templateUrl: './identify-card.component.html',
  styleUrls: ['./identify-card.component.scss'],
})
export class IdentifyCardComponent {
  @Input() item: any;
  @Input() layout: IdentifyLayout = 'phone';
  /** A wildfire's published Incident, which the host loads. */
  @Input() incident: any;
  @Input() incidentLoad: IncidentLoad = null;
  @Output() retry = new EventEmitter<void>();

  readonly texts = IDENTIFY_TEXTS;
  readonly bansInfo = INFORMATION_TEXTS.BCWS_BANS_APPLY_LAND_INFO;
  readonly convertToDateYear = convertToDateYear;
  readonly formatDate = formatDate;
  readonly getStageOfControlIcon = getStageOfControlIcon;
  readonly getStageOfControlLabel = getStageOfControlLabel;
  readonly getStageOfControlDescription = getStageOfControlDescription;
  readonly displayDangerRatingDescription = displayDangerRatingDescription;
  readonly displayLocalAuthorityType = displayLocalAuthorityType;

  get kind(): IdentifyKind | null {
    return identifyKind(this.item);
  }

  get phone(): boolean {
    return this.layout === 'phone';
  }

  get variant() {
    return IDENTIFY_VARIANTS[this.layout];
  }

  get p(): any {
    return this.item?.properties ?? {};
  }

  /** Desktop previews from the old Area Restriction, ban, danger rating and Protected Lands panels. */
  get compact(): boolean {
    return !this.phone && DESKTOP_COMPACT.includes(this.kind);
  }

  get cardClass(): string {
    return this.phone ? 'phone' : this.compact ? 'desktop compact' : 'desktop';
  }

  get wildfireName(): string {
    return this.incident?.incidentName || displayWildfireName(this.item);
  }

  get wildfireSize(): string {
    const hectares = this.incident?.incidentSizeEstimatedHa;
    if (this.variant.sizeSeparators) {
      return hectares < 1 || hectares > 1 ? `${formatNumber(hectares)} Hectares` : `${hectares} Hectare`;
    }
    return `${hectares} ${hectares === 1 ? 'Hectare' : 'Hectares'}`;
  }

  get evacuationTexts(): string[] {
    const texts = this.variant.texts;
    return this.p.ORDER_ALERT_STATUS === 'Alert' ? texts.EVACUATION_ALERT
      : this.p.ORDER_ALERT_STATUS === 'Order' ? texts.EVACUATION_ORDER
      : [];
  }

  get evacuationTitle(): string {
    const prefix = this.p.ORDER_ALERT_STATUS === 'Alert' ? 'Evacuation Alert for '
      : this.p.ORDER_ALERT_STATUS === 'Order' ? 'Evacuation Order for '
      : null;
    return prefix + this.p.EVENT_NAME;
  }

  get areaTitle(): string {
    return this.variant.decodeAreaTitle ? decodeName(this.p.NAME) : this.p.NAME;
  }

  get banTitle(): string {
    if (!this.variant.banOpenFires) {
      return `Fire Ban on ${this.item.title}`;
    }
    const description: string = this.p.ACCESS_PROHIBITION_DESCRIPTION;
    return `Fire Ban on ${description.includes('Category 1') ? description.replace('Category 1', 'Category 1 (Campfires)') : description} Open Fires`;
  }

  get roadSeverity(): string {
    return this.p.SEVERITY[0].toUpperCase() + this.p.SEVERITY.slice(1).toLowerCase();
  }

  get roadAlert(): string {
    switch (this.p.ALERT_TYPE) {
      case 'WARNING':
        return 'Warning for ' + this.p.LOCATION;
      case 'CLOSURE':
        return 'Closure for ' + this.p.LOCATION;
      case 'SEASONAL':
        return 'Seasonal Closure for ' + this.p.LOCATION;
      default:
        return 'Unknown';
    }
  }

  get localAuthorityInfo(): string {
    return LOCAL_AUTHORITY_INFO[this.item?.layerId];
  }

  get campfireBan(): boolean {
    return this.p.CAMPFIRE_BAN_IND !== 'N';
  }

  get weatherHour(): string {
    // Supplies its own "Today at"/"Yesterday at" prefix where one applies.
    return formatWeatherHourRelative(this.item?.data?.validHour?.hour);
  }
}
