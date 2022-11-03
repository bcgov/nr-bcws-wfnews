import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { PagedCollection } from '../../conversion/models';
import { ApplicationStateService } from '../../services/application-state.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { WatchlistService } from '../../services/watchlist-service';
import { PlaceData } from '../../services/wfnews-map.service/place-data';
import { RootState } from '../../store';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { initWildfiresListPaging, SEARCH_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { convertFromTimestamp, convertToStageOfControlDescription, FireCentres, convertToFireCentreDescription } from '../../utils';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { WildFiresListComponentModel } from './wildfires-list.component.model';

@Directive()
export class WildFiresListComponent extends CollectionComponent implements OnChanges, AfterViewInit, OnInit {

  @Input() collection: PagedCollection;


  public currentYearString;
  public currentDateTimeString;
  filteredOptions: any[];
  placeData: PlaceData;
  searchByLocationControl=new FormControl
  selectedLat:number;
  selectedLong:number;



  displayLabel = "Simple Wildfires Search"
  selectedFireCentreCode = "";
  wildfiresOfNoteInd = false;
  wildfiresOutInd = true;
  selectedRadius = 50;
  radiusOptions = [
    50,
    10,
    20,
    30,
    40,
    60,
    70,
    80,
    90,
    100,
  ]
  fireCentreOptions = FireCentres;

  convertFromTimestamp = convertFromTimestamp;
  convertToStageOfControlDescription = convertToStageOfControlDescription
  convertToFireCentreDescription = convertToFireCentreDescription

  constructor ( router: Router, route: ActivatedRoute, sanitizer: DomSanitizer, store: Store<RootState>, fb: FormBuilder, dialog: MatDialog, applicationStateService: ApplicationStateService, tokenService: TokenService, snackbarService: MatSnackBar, overlay: Overlay, cdr: ChangeDetectorRef, appConfigService: AppConfigService, http: HttpClient, watchlistService: WatchlistService, commonUtilityService: CommonUtilityService) 
  {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, watchlistService,commonUtilityService);
    this.placeData = new PlaceData();
    let self = this;
    this.searchByLocationControl.valueChanges.pipe(debounceTime(200)).subscribe((val:string)=>{
      if(!val) {
          this.filteredOptions= [];
          return;
      }

      if(val.length > 4) {
          this.filteredOptions= [];

          this.placeData.searchAddresses(val).then(function(results){
              if(results) {

                  results.forEach((result) => {
                      let address = self.getFullAddress(result);
                      result.address = address.trim();
                  });

                  self.filteredOptions = results;
              }
          });
      }
  });  }


  initModels() {
    this.model = new WildFiresListComponentModel(this.sanitizer);
    this.viewModel = new WildFiresListComponentModel(this.sanitizer);
  }

  loadPage() {
    this.placeData = new PlaceData();
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
      this.selectedFireCentreCode, this.wildfiresOfNoteInd, !this.wildfiresOutInd, undefined, this.displayLabel,this.selectedLat,this.selectedLong,this.selectedRadius));
  }

  onChangeFilters() {
    super.onChangeFilters();
    this.doSearch();
  }

  clearSearchAndFilters() {
    this.searchText = null;
    this.selectedFireCentreCode = null;
    this.wildfiresOfNoteInd = false;
    this.wildfiresOutInd = true;
    this.selectedRadius = 50
    this.selectedLat = null;
    this.selectedLong = null;
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
      this.removeFromWatchlist(incident)
    } else {
      this.watchlistService.saveToWatchlist(incident.incidentNumberLabel)
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

  async useMyCurrentLocation() {
    this.searchText = undefined;

    const location = await this.commonUtilityService.getCurrentLocationPromise()
    const lat = location.coords.latitude;
    const long = location.coords.longitude;
    this.searchText = lat.toString() + ', ' + long.toString()
    this.selectedLat = lat;
    this.selectedLong = long;
    this.doSearch()
  }

  onlyOneControlSelected() {
  }

  getFullAddress(location) {
    let result = "";

    if(location.civicNumber) {
        result += location.civicNumber
    }

    if(location.streetName) {
        result += " " + location.streetName
    }

    if(location.streetQualifier) {
        result += " " + location.streetQualifier
    }

    if(location.streetType) {
        result += " " + location.streetType
    }

    return result;
  }

  onLocationSelected(selectedOption) {
    let locationControlValue = selectedOption.address ? selectedOption.address : selectedOption.localityName;
    this.searchText = locationControlValue
    this.selectedLat=selectedOption.loc[1];
    this.selectedLong=selectedOption.loc[0]
    this.doSearch()
  }

}
