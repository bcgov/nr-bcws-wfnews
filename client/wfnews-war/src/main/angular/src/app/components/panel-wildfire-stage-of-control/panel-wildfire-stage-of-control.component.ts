import { AfterViewInit, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { PagedCollection } from '../../conversion/models';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { LOAD_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { PanelWildfireStageOfControlComponentModel } from './panel-wildfire-stage-of-control.component.model';

@Directive()
export class PanelWildfireStageOfControlComponent extends CollectionComponent implements OnChanges, AfterViewInit, OnInit  {

    @Input() collection: PagedCollection

    activeWildfiresInd = true;
    wildfiresOfNoteInd = false;
    wildfiresOutInd = false;
    currentLat;
    currentLong;

    initModels() {
        this.model = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
        this.viewModel = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
    }

    getViewModel(): PanelWildfireStageOfControlComponentModel {
        return <PanelWildfireStageOfControlComponentModel>this.viewModel;
    }


    ngAfterViewInit() {
        super.ngAfterViewInit();
    }


    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    ngOnInit() {
        this.updateView();
        this.config = this.getPagingConfig();
        this.baseRoute = this.router.url;
        this.componentId = LOAD_WILDFIRES_COMPONENT_ID
        this.doSearch();
        this.useMyCurrentLocation();
    }

    async useMyCurrentLocation() {
        this.searchText = undefined;

        const location = await this.commonUtilityService.getCurrentLocationPromise()
        console.log(location)
        if( location ){
            this.currentLat = location.coords.latitude;
            this.currentLong = location.coords.longitude;
        }
    }

    doSearch() {
        this.store.dispatch(searchWildfires(this.componentId, {
          pageNumber: this.config.currentPage,
          pageRowCount: this.config.itemsPerPage,
          sortColumn: this.currentSort,
          sortDirection: this.currentSortDirection,
          query: undefined
        },
          undefined, undefined, this.displayLabel));
      }


    stageOfControlChanges(event:any) {
        this.doSearch()
    }

    convertFromTimestamp(date: string) {
        if (date) {
            return moment(date).format('Y-MM-DD hh:mm')
        }
    }

    convertToDescription(code: string) {
        switch(code) {
            case 'OUT_CNTRL':
                return 'Out Of Control'
            case 'HOLDING':
                return 'Being Held'
            case 'UNDR_CNTRL':
                return 'Under Control'
            case 'OUT':
                return 'Out'
            default:
                break;
          }
    }

    calculateDistance (lat: number, long: number): string {
      let result = '---';
      if (lat && long && this.currentLat && this.currentLong) {
        result = (this.haversineDistance(lat, this.currentLat, long, this.currentLong) / 1000).toFixed(2);
      }
      return result;
    }

    /**
     * This uses the ‘haversine’ formula to calculate the great-circle distance between two points – that is, the shortest distance over the earth’s surface – giving an ‘as-the-crow-flies’ distance between the points.
     * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
     * c = 2 ⋅ atan2( √a, √(1−a) )
     * d = R ⋅ c
     * Where	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km). note that angles need to be in radians to pass to trig functions
     * @param lat1 Latitude of the location
     * @param lat2 Latitude of the destination
     * @param lon1 Longitude of the location
     * @param lon2 Longitude of the destination
     * @returns
     */
    haversineDistance(lat1, lat2, lon1, lon2): number {
        const R = 6371e3; // metres
        // to radians
        const lt1 = lat1 * Math.PI / 180;
        const lt2 = lat2 * Math.PI / 180;
        const lrad = (lat2 - lat1) * Math.PI / 180;
        const lonRad = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(lrad / 2)   * Math.sin(lrad / 2) +
                  Math.cos(lt1)        * Math.cos(lt2)   *
                  Math.sin(lonRad / 2) * Math.sin(lonRad / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (R * c)
    }

    public Number(value: string): number {
      return Number(value);
    }
}
