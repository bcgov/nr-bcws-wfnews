import { AfterViewInit, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { PagedCollection } from '../../conversion/models';
import { distanceHelper } from '../../services/wfnews-map.service/util';
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
    currentLat: number;
    currentLong: number;

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
            this.currentLat = Number(location.coords.latitude);
            this.currentLong = Number(location.coords.longitude);
        }
    }

    doSearch() {
        this.store.dispatch(searchWildfires(this.componentId, {
          pageNumber: this.config.currentPage,
          pageRowCount: 10,
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

    calculateDistance(lat: number, long: number){
        if ((lat && long) && (this.currentLat && this.currentLong)) {
            let result = ((distanceHelper(lat, this.currentLat, long, this.currentLong)) / 1000).toFixed(2)
            return result.toString() + ' KM'
        }
    }

}
