import { displayItemTitle, getActiveMap } from '@app/utils';

// A fire perimeter lists with the fires, so one fire shows one row.
export const WILDFIRE_LAYER_IDS = [
  'active-wildfires-fire-of-note',
  'active-wildfires-out-of-control',
  'active-wildfires-holding',
  'active-wildfires-under-control',
  'fire-perimeters',
  'active-wildfires-out',
];

/** The identify results of one map click, grouped as the result lists show them. */
export interface IdentifyResults {
  wildfires: any[];
  evacs: any[];
  areaRestrictions: any[];
  bansAndProhibitions: any[];
  dangerRatings: any[];
  roadEvents: any[];
  closedRecreationSites: any[];
  protectedLandsAccessRestrictions: any[];
  regionalDistricts: any[];
  municipalities: any[];
  firstNationsTreatyLand: any[];
  indianReserves: any[];
  weatherStations: any[];
}

export function groupIdentifyResults(items: any[]): IdentifyResults {
  const on = (...layerIds: string[]) => items.filter((item) => layerIds.includes(item.layerId));
  return {
    wildfires: on(...WILDFIRE_LAYER_IDS),
    evacs: on('evacuation-orders-and-alerts-wms'),
    areaRestrictions: on('area-restrictions'),
    bansAndProhibitions: on('bans-and-prohibitions-cat1', 'bans-and-prohibitions-cat2', 'bans-and-prohibitions-cat3'),
    dangerRatings: on('danger-rating'),
    roadEvents: on('drive-bc-active-events'),
    closedRecreationSites: on('closed-recreation-sites'),
    protectedLandsAccessRestrictions: on('protected-lands-access-restrictions'),
    regionalDistricts: on('abms-regional-districts'),
    municipalities: on('abms-municipalities'),
    firstNationsTreatyLand: on('fnt-treaty-land'),
    indianReserves: on('clab-indian-reserves'),
    weatherStations: on('weather-stations'),
  };
}

export const LOCAL_AUTHORITY_LAYER_IDS = ['abms-regional-districts', 'clab-indian-reserves', 'abms-municipalities', 'fnt-treaty-land'];

export type IdentifyKind =
  | 'wildfire' | 'evacuation' | 'area-restriction' | 'ban' | 'danger-rating' | 'closed-recreation-site'
  | 'road-event' | 'protected-land' | 'local-authority' | 'weather-station';

/** The card an identify result opens. A wildfire from the wildfire list has no layer, only its incident fields. */
export function identifyKind(item: any): IdentifyKind | null {
  const layerId: string = item?.layerId ?? '';
  if (WILDFIRE_LAYER_IDS.includes(layerId) || (!layerId && item?.incidentNumberLabel)) {
    return 'wildfire';
  }
  if (layerId.includes('bans-and-prohibitions')) {
    return 'ban';
  }
  if (LOCAL_AUTHORITY_LAYER_IDS.includes(layerId)) {
    return 'local-authority';
  }
  const kinds: Record<string, IdentifyKind> = {
    'evacuation-orders-and-alerts-wms': 'evacuation',
    'area-restrictions': 'area-restriction',
    'danger-rating': 'danger-rating',
    'closed-recreation-sites': 'closed-recreation-site',
    'drive-bc-active-events': 'road-event',
    'protected-lands-access-restrictions': 'protected-land',
    'weather-stations': 'weather-station',
  };
  return kinds[layerId] ?? null;
}

const KIND_TITLES: Partial<Record<IdentifyKind, string>> = {
  'area-restriction': 'Area Restrictions',
  ban: 'Fire Bans',
  'danger-rating': 'Wildfire Danger Rating',
  'closed-recreation-site': 'Closed Recreational Sites',
  'road-event': 'Road Events',
  'protected-land': 'Protected Lands',
  'local-authority': 'Local Authorities',
  'weather-station': 'Active Weather Stations',
};

/** The title bar of an open result. */
export function identifyTitle(item: any): string {
  const kind = identifyKind(item);
  if (kind === 'wildfire') {
    return displayItemTitle(item);
  }
  if (kind === 'evacuation') {
    return `Evacuation ${item.properties.ORDER_ALERT_STATUS}`;
  }
  return KIND_TITLES[kind] ?? '';
}

export function displayWildfireName(wildfire: any): string {
  if (wildfire.layerId === 'fire-perimeters') {
    return wildfire.properties.FIRE_NUMBER + ' Wildfire';
  }
  if (wildfire.properties.incident_name) {
    return wildfire.properties.incident_name + ' (' + wildfire.properties.incident_number_label + ')';
  }
  return wildfire.properties.incident_number_label + ' Wildfire';
}

/** The fire layer whose stage icon a perimeter with this status uses. */
export function firePerimeterStatusLayer(status: string): string | undefined {
  switch (status) {
    case 'Out of Control':
      return 'active-wildfires-out-of-control';
    case 'Being Held':
      return 'active-wildfires-holding';
    case 'Under Control':
      return 'active-wildfires-under-control';
    case 'Out':
      return 'bcws-activefires-publicview-inactive';
  }
}

// The incident marker is not cleared here: clearMarker keeps it on the calling component.
export function clearIdentifyOnMap() {
  // Passing no geometry empties the acetate.
  getActiveMap().showFeature('area-highlight');
  const map = window['SMK']?.MAP?.[1];
  if (map) {
    map.$viewer.identified.clear();
    map.$sidepanel.setExpand(0);
  }
}
