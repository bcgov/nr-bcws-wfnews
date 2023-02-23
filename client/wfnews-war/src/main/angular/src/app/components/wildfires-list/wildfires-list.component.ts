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
import { convertFromTimestamp, convertToStageOfControlDescription, FireCentres, convertToFireCentreDescription, ResourcesRoutes, snowPlowHelper, convertFireNumber } from '../../utils';
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
  url;
  displayLabel = "Simple Wildfires Search"
  selectedFireCentreCode = "";
  wildfiresOfNoteInd = false;
  newFires = false;
  activeWildfiresInd = true;
  outWildfiresInd = false;
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
  locationName: string;

  convertFromTimestamp = convertFromTimestamp;
  convertToStageOfControlDescription = convertToStageOfControlDescription
  convertToFireCentreDescription = convertToFireCentreDescription
  snowPlowHelper = snowPlowHelper
  convertFireNumber = convertFireNumber;


  constructor ( router: Router, route: ActivatedRoute, sanitizer: DomSanitizer, store: Store<RootState>, fb: FormBuilder, dialog: MatDialog, applicationStateService: ApplicationStateService, tokenService: TokenService, snackbarService: MatSnackBar, overlay: Overlay, cdr: ChangeDetectorRef, appConfigService: AppConfigService, http: HttpClient, watchlistService: WatchlistService, commonUtilityService: CommonUtilityService)
  {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, watchlistService,commonUtilityService);
    this.placeData = new PlaceData();
    let self = this;
    this.searchByLocationControl.valueChanges.pipe(debounceTime(200)).subscribe((val:string)=>{
      this.locationName = val;

      if(!val) {
          this.filteredOptions = [];
          this.selectedLat = undefined;
          this.selectedLong = undefined;
          this.searchTextUpdated();
          return;
      }

      if(val.length > 2) {
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
    });

    this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(this.url)
  }

  initModels() {
    this.model = new WildFiresListComponentModel(this.sanitizer);
    this.viewModel = new WildFiresListComponentModel(this.sanitizer);
  }

  loadPage() {
    this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
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
    if (!this.activeWildfiresInd && !this.outWildfiresInd && !this.newFires && !this.wildfiresOfNoteInd) {
      this.collectionData = []
      this.collection = null;
      this.summaryString = 'No records to display.'
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    } else {
      // set stages of control to return
      const stageOfControlList = []
      if (this.outWildfiresInd) {
        stageOfControlList.push('OUT')
      }
      if(this.activeWildfiresInd) {
        stageOfControlList.push('OUT_CNTRL')
        stageOfControlList.push('HOLDING')
        stageOfControlList.push('UNDR_CNTRL')
      }
      // We use a boolean in the postgres model so this shouldn't be needed
      //if(this.wildfiresOfNoteInd) {
      //  stageOfControlList.push('FIRE_OF_NOTE')
      //}

      this.store.dispatch(searchWildfires(this.componentId, {
        pageNumber: this.config.currentPage,
        pageRowCount: this.config.itemsPerPage,
        sortColumn: this.currentSort,
        sortDirection: this.currentSortDirection,
        query: this.searchText
      },
        this.selectedFireCentreCode, this.wildfiresOfNoteInd, stageOfControlList, this.newFires, undefined, this.displayLabel,this.selectedLat,this.selectedLong,this.selectedRadius));
    }
  }

  onChangeFilters() {
    super.onChangeFilters();
    this.doSearch();
  }

  clearSearchAndFilters() {
    this.searchText = null;
    this.locationName = null;
    this.selectedFireCentreCode = null;
    this.wildfiresOfNoteInd = false;
    this.newFires = false;
    this.activeWildfiresInd = true;
    this.outWildfiresInd = false;
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
      const url = this.router.serializeUrl(
        this.router.createUrlTree([ResourcesRoutes.PUBLIC_INCIDENT], { queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel } })
      )
      window.open(url, '_blank')
  }

  onWatchlist (incident: any): boolean {
    return this.watchlistService.getWatchlist().includes(incident.fireYear + ':' + incident.incidentNumberLabel)
  }

  addToWatchlist(incident: any) {
    if (this.onWatchlist(incident)) {
      this.removeFromWatchlist(incident)
    } else {
      this.watchlistService.saveToWatchlist(incident.fireYear, incident.incidentNumberLabel)
    }
  }

  removeFromWatchlist (incident: any) {
    this.watchlistService.removeFromWatchlist(incident.fireYear, incident.incidentNumberLabel)
  }

  viewMap(incident: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: {longitude: incident.longitude, latitude: incident.latitude} });
    }, 100);

  }


  stageOfControlChanges(event: any) {
    this.onChangeFilters();
    this.doSearch()
  }

  async useMyCurrentLocation() {
    this.searchText = undefined;

    const location = await this.commonUtilityService.getCurrentLocationPromise()
    const lat = location.coords.latitude;
    const long = location.coords.longitude;
    this.locationName = lat.toString() + ', ' + long.toString()
    this.selectedLat = lat;
    this.selectedLong = long;
    this.doSearch()
  }

  onlyOneControlSelected() {
    // unused
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
    this.searchByLocationControl.setValue(locationControlValue.trim(), { onlySelf: true, emitEvent: false });
    this.selectedLat=selectedOption.loc[1];
    this.selectedLong=selectedOption.loc[0]
    this.doSearch()
  }

  isLocationName() {
    if (this.locationName && this.locationName !== '') {
      return true
    }
  }

  isSearchText() {
    if (this.searchText && this.searchText !== '') {
      return true
    }
  }

}
