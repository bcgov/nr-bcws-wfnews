import { AfterViewInit, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
        console.log(changes)
    }

    ngOnInit() {
        this.updateView();
        this.config = this.getPagingConfig();
        this.baseRoute = this.router.url;
        this.componentId = LOAD_WILDFIRES_COMPONENT_ID
        this.doSearch();
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
        console.log(event)
        this.doSearch()
    }

}
