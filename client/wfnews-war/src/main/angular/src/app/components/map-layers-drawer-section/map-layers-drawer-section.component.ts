import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { getActiveMap } from '@app/utils';
import { SmkApi } from '@app/utils/smk';

@Component({
  selector: 'map-layers-section',
  templateUrl: './map-layers-drawer-section.component.html',
  styleUrls: ['./map-layers-drawer-section.component.scss'],
})
export class MapLayersDrawerSectionComponent implements OnChanges {
  @Input() mapInitialized: boolean;
  @Input() triggerRefresh: boolean;
  @Output() triggerRefreshChange = new EventEmitter<boolean>();
  @Output() layersChangedEvent = new EventEmitter<boolean>();

  activeWeatherStations = true;
  areaRestrictions = false;
  bansAndProhibitions = false;
  beingHeldWildfire = false;
  closedRecreationSites = false;
  currentPrecipitationRadar = false;
  currentWeather = false;
  dangerRating = false;
  declaredOutWildfire = false;
  evacuationOrders = false;
  firePerimeters = false;
  hourlyPrecipitationForecast = false;
  indianReserves = false;
  municipalities = false;
  outOfControlWildfire = false;
  protectedLandsAccessRestrictions = false;
  regionalDistricts = false;
  roadEvents = false;
  smokeForecast = false;
  treatyLand = false;
  underControlWildfire = false;
  wildfireOfNote = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.mapInitialized || (this.mapInitialized && this.triggerRefresh)) {
      this.clearAll(false);
      this.loadLayers();
    }
  }

  clearAll(updateLayers: boolean) {
    this.activeWeatherStations = false;
    this.areaRestrictions = false;
    this.bansAndProhibitions = false;
    this.beingHeldWildfire = false;
    this.closedRecreationSites = false;
    this.currentPrecipitationRadar = false;
    this.currentWeather = false;
    this.dangerRating = false;
    this.declaredOutWildfire = false;
    this.evacuationOrders = false;
    this.firePerimeters = false;
    this.hourlyPrecipitationForecast = false;
    this.indianReserves = false;
    this.municipalities = false;
    this.outOfControlWildfire = false;
    this.protectedLandsAccessRestrictions = false;
    this.regionalDistricts = false;
    this.roadEvents = false;
    this.smokeForecast = false;
    this.treatyLand = false;
    this.underControlWildfire = false;
    this.wildfireOfNote = false;

    if (updateLayers) {
      this.updateLayers();
    }
  }

  loadLayers() {
    const smkApi = new SmkApi(getActiveMap());
    const visibleLayers = smkApi.getVisibleLayers();

    Object.keys(visibleLayers).forEach((layerId) => {
      switch (layerId) {
        case 'active-wildfires-fire-of-note':
          this.wildfireOfNote = true;
          break;
        case 'active-wildfires-heatmap':
          this.outOfControlWildfire = true;
          break;
        case 'active-wildfires-holding':
          this.beingHeldWildfire = true;
          break;
        case 'active-wildfires-out-of-control':
          this.outOfControlWildfire = true;
          break;
        case 'active-wildfires-out':
          this.declaredOutWildfire = true;
          break;
        case 'active-wildfires-under-control':
          this.underControlWildfire = true;
          break;
        case 'area-restrictions-highlight':
        case 'area-restrictions':
          this.areaRestrictions = true;
          break;
        case 'bans-and-prohibitions-cat1':
        case 'bans-and-prohibitions-cat2':
        case 'bans-and-prohibitions-cat3':
        case 'bans-and-prohibitions-highlight':
          this.bansAndProhibitions = true;
          break;
        case 'clab-indian-reserves':
          this.indianReserves = true;
          break;
        case 'closed-recreation-sites':
          this.closedRecreationSites = true;
          break;
        case 'current-conditions--default':
          this.currentWeather = true;
          break;
        case 'danger-rating':
          this.dangerRating = true;
          break;
        case 'drive-bc-active-events':
          this.roadEvents = true;
          break;
        case 'evacuation-orders-and-alerts-wms-highlight':
        case 'evacuation-orders-and-alerts-wms':
          this.evacuationOrders = true;
          break;
        case 'fire-perimeters':
          this.firePerimeters = true;
          break;
        case 'fnt-treaty-land':
          this.treatyLand = true;
          break;
        case 'hourly-currentforecast-firesmoke':
          this.smokeForecast = true;
          break;
        case 'precipitation':
          this.hourlyPrecipitationForecast = true;
          break;
        case 'protected-lands-access-restrictions':
          this.protectedLandsAccessRestrictions = true;
          break;
        case 'radar-1km-rrai--radarurpprecipr14-linear':
          this.currentPrecipitationRadar = true;
          break;
        case 'weather-stations':
          this.activeWeatherStations = true;
          break;
        case 'abms-municipalities':
          this.municipalities = true;
          break;
        case 'abms-regional-districts':
          this.regionalDistricts = true;
          break;
        default:
          break;
      }
    });
    this.activeWeatherStations = true;

    this.triggerRefreshChange.emit(false);
    this.cdr.detectChanges();
  }

  updateLayers() {
    const smkApi = new SmkApi(getActiveMap());

    const layers = [
      { itemId: 'abms-municipalities', visible: this.municipalities },
      { itemId: 'abms-regional-districts', visible: this.regionalDistricts },
      { itemId: 'active-wildfires-fire-of-note', visible: this.wildfireOfNote },
      { itemId: 'active-wildfires-heatmap', visible: this.wildfireOfNote },
      { itemId: 'active-wildfires-holding', visible: this.beingHeldWildfire },
      {
        itemId: 'active-wildfires-out-of-control',
        visible: this.outOfControlWildfire,
      },
      { itemId: 'active-wildfires-out', visible: this.declaredOutWildfire },
      {
        itemId: 'active-wildfires-under-control',
        visible: this.underControlWildfire,
      },
      { itemId: 'area-restrictions-highlight', visible: this.areaRestrictions },
      { itemId: 'area-restrictions', visible: this.areaRestrictions },
      {
        itemId: 'bans-and-prohibitions-cat1',
        visible: this.bansAndProhibitions,
      },
      {
        itemId: 'bans-and-prohibitions-cat2',
        visible: this.bansAndProhibitions,
      },
      {
        itemId: 'bans-and-prohibitions-cat3',
        visible: this.bansAndProhibitions,
      },
      {
        itemId: 'bans-and-prohibitions-highlight',
        visible: this.bansAndProhibitions,
      },
      { itemId: 'clab-indian-reserves', visible: this.indianReserves },
      {
        itemId: 'closed-recreation-sites',
        visible: this.closedRecreationSites,
      },
      { itemId: 'current-conditions--default', visible: this.currentWeather },
      { itemId: 'danger-rating', visible: this.dangerRating },
      { itemId: 'drive-bc-active-events', visible: this.roadEvents },
      {
        itemId: 'evacuation-orders-and-alerts-wms-highlight',
        visible: this.evacuationOrders,
      },
      {
        itemId: 'evacuation-orders-and-alerts-wms',
        visible: this.evacuationOrders,
      },
      { itemId: 'fire-perimeters', visible: this.firePerimeters },
      { itemId: 'fnt-treaty-land', visible: this.treatyLand },
      {
        itemId: 'hourly-currentforecast-firesmoke',
        visible: this.smokeForecast,
      },
      { itemId: 'precipitation', visible: this.hourlyPrecipitationForecast },
      {
        itemId: 'protected-lands-access-restrictions',
        visible: this.protectedLandsAccessRestrictions,
      },
      {
        itemId: 'radar-1km-rrai--radarurpprecipr14-linear',
        visible: this.currentPrecipitationRadar,
      },
      { itemId: 'weather-stations', visible: this.activeWeatherStations },
    ];

    smkApi.setDisplayContextItemsVisible(...layers);
    this.layersChangedEvent.emit(true);
  }
}
