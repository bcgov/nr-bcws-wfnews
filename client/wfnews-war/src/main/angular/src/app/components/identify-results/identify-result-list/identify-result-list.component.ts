import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdentifyResults, displayWildfireName, firePerimeterStatusLayer } from '@app/utils/identify-results';
import { IDENTIFY_VARIANTS, IdentifyLayout, decodeName } from '../identify-variants';

interface ResultGroup {
  key: keyof IdentifyResults;
  title: string;
  icon?: (item: any) => string | null;
  label: (item: any) => string;
}

const ICONS = '/assets/images/svg-icons/';
const DANGER_ICONS: Record<string, string> = {
  Extreme: 'fire-danger-extreme.svg',
  High: 'fire-danger-high.svg',
  Moderate: 'fire-danger-moderate.svg',
  Low: 'fire-danger-low.svg',
  'Very Low': 'fire-danger-very-low.svg',
};

/** The identify results of one map click, grouped by layer, on the phone and on desktop. */
@Component({
  selector: 'wfnews-identify-result-list',
  templateUrl: './identify-result-list.component.html',
  styleUrls: ['./identify-result-list.component.scss'],
})
export class IdentifyResultListComponent {
  @Input() results: IdentifyResults;
  @Input() layout: IdentifyLayout = 'phone';
  @Output() selected = new EventEmitter<any>();

  readonly groups: ResultGroup[] = [
    { key: 'wildfires', title: 'Wildfires', label: displayWildfireName },
    {
      key: 'evacs', title: 'Evacuations',
      icon: (item) => ({ Alert: 'evacuation-alert.svg', Order: 'evacuation-order.svg' })[item.properties.ORDER_ALERT_STATUS] ?? null,
      label: (item) => `Evacuation ${item.properties.ORDER_ALERT_STATUS} for ${item.properties.EVENT_NAME}`,
    },
    {
      key: 'areaRestrictions', title: 'Area Restrictions', icon: () => 'area-restriction.svg',
      label: (item) => {
        const name: string = item.properties.NAME;
        return decodeName(this.variant.restrictedAreaName ? name.replace('Area Restriction', 'Restricted Area') : name);
      },
    },
    {
      key: 'bansAndProhibitions', title: 'Fire Bans and Prohibitions', icon: () => 'ban.svg',
      label: (item) => `Fire Ban on ${item.title}` + (this.variant.banOpenFires ? ' Open Fires' : ''),
    },
    {
      key: 'dangerRatings', title: 'Fire Danger Rating',
      icon: (item) => DANGER_ICONS[item.properties.DANGER_RATING_DESC] ?? null,
      label: (item) => `${item.properties.DANGER_RATING_DESC} Fire Danger`,
    },
    { key: 'roadEvents', title: 'Road Events', icon: () => 'ban.svg', label: (item) => item.title },
    { key: 'closedRecreationSites', title: 'Closed Recreation Sites', icon: () => 'closed-recreation-site.svg', label: (item) => item.title },
    { key: 'protectedLandsAccessRestrictions', title: 'Protected Lands Access Restrictions', label: (item) => item.title },
    { key: 'regionalDistricts', title: 'Regional Districts', icon: () => 'regional-districts.svg', label: (item) => item.title },
    { key: 'municipalities', title: 'Municipalities', icon: () => 'regional-districts.svg', label: (item) => item.title },
    { key: 'firstNationsTreatyLand', title: 'First Nations Treaty Land', icon: () => 'brown-square.svg', label: (item) => item.title },
    { key: 'indianReserves', title: 'Indian Reserve', icon: () => 'indian-reserve.svg', label: (item) => item.title },
    { key: 'weatherStations', title: 'Active Weather Stations', icon: () => 'carbon_partly-cloudy.svg', label: (item) => item.title },
  ];

  get variant() {
    return IDENTIFY_VARIANTS[this.layout];
  }

  get phone() {
    return this.layout === 'phone';
  }

  iconPath(group: ResultGroup, item: any): string | null {
    const file = group.icon?.(item);
    return file ? ICONS + file : null;
  }

  /** A perimeter takes the stage dot of the fire status it carries. */
  stageClass(wildfire: any): string {
    return wildfire.layerId === 'fire-perimeters' ? firePerimeterStatusLayer(wildfire.properties.FIRE_STATUS) : wildfire.layerId;
  }

  isFireOfNote(wildfire: any): boolean {
    return wildfire.layerId === 'active-wildfires-fire-of-note';
  }
}
