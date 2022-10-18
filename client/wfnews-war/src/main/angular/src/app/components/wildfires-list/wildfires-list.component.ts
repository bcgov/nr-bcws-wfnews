import { AfterViewInit, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { PagedCollection } from '../../conversion/models';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { initWildfiresListPaging, SEARCH_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { convertFromTimestamp, convertToStageOfControlDescription, FireCentres } from '../../utils';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { WildFiresListComponentModel } from './wildfires-list.component.model';

@Directive()
export class WildFiresListComponent extends CollectionComponent implements OnChanges, AfterViewInit, OnInit {

  @Input() collection: PagedCollection;


  public currentYearString;
  public currentDateTimeString;

  displayLabel = "Simple Wildfires Search"
  selectedFireCentreCode = "";
  wildfiresOfNoteInd = false;
  wildfiresOutInd = true;
  selectedRadius = "50km";
  radiusOptions = [
    '50km',
    '10km',
    '20km',
    '30km',
    '40km',
    '60km',
    '70km',
    '80km',
    '90km',
    '100km',
  ]
  fireCentreOptions = FireCentres;

  convertFromTimestamp = convertFromTimestamp;
  convertToStageOfControlDescription = convertToStageOfControlDescription



  initModels() {
    this.model = new WildFiresListComponentModel(this.sanitizer);
    this.viewModel = new WildFiresListComponentModel(this.sanitizer);
  }

  loadPage() {
    this.componentId = SEARCH_WILDFIRES_COMPONENT_ID;
    this.updateView();
    this.initSortingAndPaging(initWildfiresListPaging);
    this.config = this.getPagingConfig();
    this.baseRoute = this.router.url;
    this.doSearch();
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
  }

  doSearch() {
    this.store.dispatch(searchWildfires(this.componentId, {
      pageNumber: this.config.currentPage,
      pageRowCount: this.config.itemsPerPage,
      sortColumn: this.currentSort,
      sortDirection: this.currentSortDirection,
      query: this.searchText
    },
      this.selectedFireCentreCode, this.wildfiresOfNoteInd, !this.wildfiresOutInd, undefined, this.displayLabel));
  }

  onChangeFilters() {
    super.onChangeFilters();
    this.doSearch();
  }

  clearSearchAndFilters() {
    this.searchText = null;
    this.selectedFireCentreCode = null;
    this.wildfiresOfNoteInd = false;
    this.wildfiresOutInd = false;
    this.selectedRadius = '50Km'
    super.onChangeFilters();
    this.doSearch();
  }


  getViewModel(): WildFiresListComponentModel {
    return <WildFiresListComponentModel>this.viewModel;
  }


  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnchanges(changes: SimpleChanges) {
    super.ngOnChanges(changes)
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss')
    }
  }

  selectIncident(incident: any) {
    //TODO
  }

  onWatchlist (incident: any): boolean {
    return this.watchlistService.getWatchlist().includes(incident.incidentNumberLabel)
  }

  addToWatchlist(incident: any) {
    if (this.onWatchlist(incident)) {
      this.watchlistService.saveToWatchlist(incident.incidentNumberLabel)
    } else {
      this.removeFromWatchlist(incident)
    }
  }

  removeFromWatchlist (incident: any) {
    this.watchlistService.removeFromWatchlist(incident.incidentNumberLabel)
  }

  viewMap(incident: any) {
    //TODO, navigate to map page
  }


  stagesOfControlChange(event: any) {
    // TODO, filter should update
    this.doSearch()
  }

  openStageOfControlLink() {
    let url = "https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/management-strategies/stages-of-control"
    window.open(url, "_blank");
  }

  async useMyCurrentLocation() {
    this.searchText = undefined;

    const location = await this.commonUtilityService.getCurrentLocationPromise()
    const lat = location.coords.latitude;
    const long = location.coords.longitude;
    this.searchText = lat.toString() + ', ' + long.toString()
  }

  onlyOneControlSelected() {
  }
}
