import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { fireCentreOption, PagedCollection } from '../../conversion/models';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { initWildfiresListPaging, SEARCH_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { WildFiresListComponentModel } from './wildfires-list.component.model';

@Directive()
export class WildFiresListComponent extends CollectionComponent implements OnChanges, AfterViewInit {

  @Input() collection: PagedCollection;


  public currentYearString;
  public currentDateTimeString;

  displayLabel = 'Simple Wildfires Search';
  selectedFireCentreCode = '';
  fireCentreOptions: fireCentreOption[] = [];
  fireOfNotePublishedInd = true;
  selectedRadius = '';
  radiusOptions = [
    '50km',
    '100km',
    '200km',
  ];

  initModels() {
    this.model = new WildFiresListComponentModel(this.sanitizer);
    this.viewModel = new WildFiresListComponentModel(this.sanitizer);
  }

  loadPage() {
    this.componentId = SEARCH_WILDFIRES_COMPONENT_ID;
    this.getFireCentres();
    this.updateView();
    this.initSortingAndPaging(initWildfiresListPaging);
    this.config = this.getPagingConfig();
    this.baseRoute = this.router.url;
    this.doSearch();
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    console.log(changes);
  }

  doSearch() {
    this.store.dispatch(searchWildfires(this.componentId, {
      pageNumber: this.config.currentPage,
      pageRowCount: this.config.itemsPerPage,
      sortColumn: this.currentSort,
      sortDirection: this.currentSortDirection,
      query: this.searchText
    },
      this.selectedFireCentreCode, this.fireOfNotePublishedInd, this.displayLabel));
  }

  onChangeFilters() {
    super.onChangeFilters();
    this.doSearch();
  }

  clearSearchAndFilters() {
    this.searchText = null;
    this.selectedFireCentreCode = null;
    this.fireOfNotePublishedInd = true;
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
    super.ngOnChanges(changes);
  }


  getFireCentres() {
    const url = this.appConfigService.getConfig().externalAppConfig['AGOLfireCentres'].toString();
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Accept', '*/*');
    this.http.get<any>(url, { headers }).subscribe(response => {
      if (response.features) {
        response.features.forEach(element => {
          this.fireCentreOptions.push({ code: element.attributes.FIRE_CENTRE_CODE, fireCentreName: element.attributes.FIRE_CENTRE });
        });
      }
    });
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss');
    }
  }

  selectIncident(incident: any) {
    //TODO
  }

  addToWatchlist(incident: any) {
    //TODO, add to sessionStorage
  }

  viewMap(incident: any) {
    //TODO, navigate to map page
  }


  stagesOfControlChange(event: any) {
    // TODO, filter should update
    this.doSearch();
  }

  openStageOfControlLink() {
    const url = 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/management-strategies/stages-of-control';
    window.open(url, '_blank');
  }
}
