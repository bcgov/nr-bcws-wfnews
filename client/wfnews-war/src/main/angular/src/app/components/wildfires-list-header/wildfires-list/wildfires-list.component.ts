import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';
import { PagedCollection } from '../../../conversion/models';
import { ApplicationStateService } from '../../../services/application-state.service';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { WatchlistService } from '../../../services/watchlist-service';
import { PlaceData } from '../../../services/wfnews-map.service/place-data';
import { RootState } from '../../../store';
import { searchWildfires } from '../../../store/wildfiresList/wildfiresList.action';
import {
  initWildfiresListPaging,
  SEARCH_WILDFIRES_COMPONENT_ID,
} from '../../../store/wildfiresList/wildfiresList.stats';
import {
  convertFromTimestamp,
  convertToStageOfControlDescription,
  FireCentres,
  convertToFireCentreDescription,
  ResourcesRoutes,
  snowPlowHelper,
  convertFireNumber,
} from '../../../utils';
import { CollectionComponent } from '../../common/base-collection/collection.component';
import { WildFiresListComponentModel } from './wildfires-list.component.model';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import {
  FilterByLocationDialogComponent,
  LocationData,
} from '../filter-by-location/filter-by-location-dialog.component';
import { CapacitorService } from '@app/services/capacitor-service';

@Directive()
export class WildFiresListComponent
  extends CollectionComponent
  implements OnChanges, AfterViewInit, OnInit {
  @Input() collection: PagedCollection;

  public currentYearString;
  public currentDateTimeString;
  filteredOptions: any[];
  placeData: PlaceData;
  searchByLocationControl = new UntypedFormControl();
  selectedLat: number;
  selectedLong: number;
  url;
  displayLabel = 'Simple Wildfires Search';
  public sortOptions = [
    { description: 'Fire Centre', code: 'fireCentreName' },
    { description: 'Name', code: 'incidentName' },
    { description: 'Stage of Control', code: 'stageOfControlCode' },
    { description: 'Last Updated', code: 'lastUpdatedTimestamp' },
  ];
  public selectedSortValue = '';
  selectedFireCentreCode = '';
  wildfiresOfNoteInd = false;
  outOfControlFires = true;
  beingHeldFires = true;
  underControlFires = true;
  outWildfiresInd = false;
  selectedRadius = 50;
  radiusOptions = [50, 10, 20, 30, 40, 60, 70, 80, 90, 100];
  fireCentreOptions = FireCentres;
  locationName: string;
  sortedAddressList: string[];

  public locationData: LocationData;

  private isExtraSmall: Observable<BreakpointState> =
    this.breakpointObserver.observe(Breakpoints.XSmall);

  convertFromTimestamp = convertFromTimestamp;
  convertToStageOfControlDescription = convertToStageOfControlDescription;
  convertToFireCentreDescription = convertToFireCentreDescription;
  snowPlowHelper = snowPlowHelper;
  convertFireNumber = convertFireNumber;

  constructor(
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    store: Store<RootState>,
    fb: UntypedFormBuilder,
    dialog: MatDialog,
    applicationStateService: ApplicationStateService,
    tokenService: TokenService,
    snackbarService: MatSnackBar,
    overlay: Overlay,
    cdr: ChangeDetectorRef,
    appConfigService: AppConfigService,
    http: HttpClient,
    watchlistService: WatchlistService,
    commonUtilityService: CommonUtilityService,
    private breakpointObserver: BreakpointObserver,
    private capacitorService: CapacitorService,
  ) {
    super(
      router,
      route,
      sanitizer,
      store,
      fb,
      dialog,
      applicationStateService,
      tokenService,
      snackbarService,
      overlay,
      cdr,
      appConfigService,
      http,
      watchlistService,
      commonUtilityService,
    );
    this.placeData = new PlaceData();
    const self = this;
    this.searchByLocationControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe((val: string) => {
        this.locationName = val;

        if (!val) {
          this.filteredOptions = [];
          this.selectedLat = undefined;
          this.selectedLong = undefined;
          this.searchTextUpdated();
          return;
        }

        if (val.length > 2) {
          this.filteredOptions = [];
          this.placeData.searchAddresses(val).then(function(results) {
            if (results) {
              results.forEach((result) => {
                self.sortedAddressList =
                  self.commonUtilityService.sortAddressList(results, val);
              });
              self.filteredOptions = self.sortedAddressList;
            }
          });
        }
      });

    this.url =
      this.appConfigService.getConfig().application.baseUrl.toString() +
      this.router.url.slice(1);
    this.snowPlowHelper(this.url);
  }

  initModels() {
    this.model = new WildFiresListComponentModel(this.sanitizer);
    this.viewModel = new WildFiresListComponentModel(this.sanitizer);
  }

  loadPage() {
    this.url =
      this.appConfigService.getConfig().application.baseUrl.toString() +
      this.router.url.slice(1);
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
    if (
      !this.wildfiresOfNoteInd &&
      !this.outOfControlFires &&
      !this.beingHeldFires &&
      !this.underControlFires &&
      !this.outWildfiresInd
    ) {
      this.collectionData = [];
      this.collection = null;
      this.summaryString = 'No records to display.';
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    } else {
      // set stages of control to return
      const stageOfControlList = [];
      if (this.outWildfiresInd) {
        stageOfControlList.push('OUT');
      }
      if (this.outOfControlFires) {
        stageOfControlList.push('OUT_CNTRL');
      }
      if (this.beingHeldFires) {
        stageOfControlList.push('HOLDING');
      }
      if (this.underControlFires) {
        stageOfControlList.push('UNDR_CNTRL');
      }

      if (this.selectedSortValue !== '') {
        this.currentSort = this.selectedSortValue;
        this.currentSortDirection =
          this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
        this.selectedSortValue = '';
      }

      this.store.dispatch(
        searchWildfires(
          this.componentId,
          {
            pageNumber: this.config.currentPage,
            pageRowCount: this.config.itemsPerPage,
            sortColumn: this.currentSort,
            sortDirection: this.currentSortDirection,
            query: this.searchText,
          },
          this.selectedFireCentreCode,
          this.wildfiresOfNoteInd,
          stageOfControlList,
          false,
          undefined,
          this.displayLabel,
          this.selectedLat,
          this.selectedLong,
          this.selectedRadius,
        ),
      );
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
    this.outWildfiresInd = false;
    this.selectedRadius = 50;
    this.selectedLat = null;
    this.selectedLong = null;
    super.onChangeFilters();
    this.doSearch();
  }

  getViewModel(): WildFiresListComponentModel {
    return this.viewModel as WildFiresListComponentModel;
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnchanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('MMM Do YYYY h:mm:ss a');
    }
  }

  async selectIncident(incident: any) {
    const device = await this.capacitorService.checkDeviceSystem();
    // IOS standalone app can not open url in blank page.
    if (device.operatingSystem === 'ios') {
      this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
        queryParams: {
          fireYear: incident.fireYear,
          incidentNumber: incident.incidentNumberLabel,
        },
      });
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: {
            fireYear: incident.fireYear,
            incidentNumber: incident.incidentNumberLabel,
          },
        }),
      );
      window.open(url, '_blank');
    }
  }

  onWatchlist(incident: any): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  addToWatchlist(incident: any) {
    if (this.onWatchlist(incident)) {
      this.removeFromWatchlist(incident);
    } else {
      this.watchlistService.saveToWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }

  removeFromWatchlist(incident: any) {
    this.watchlistService.removeFromWatchlist(
      incident.fireYear,
      incident.incidentNumberLabel,
    );
  }

  viewMap(incident: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          wildfires: true,
          identify: true,
          longitude: incident.longitude,
          latitude: incident.latitude,
        },
      });
    }, 100);
  }

  stageOfControlChanges(event: any) {
    this.onChangeFilters();
    this.doSearch();
  }

  isLocationName() {
    return this.locationName && this.locationName !== '';
  }

  isSearchText() {
    return this.searchText && this.searchText !== '';
  }

  openLocationFilter() {
    const dialogRef = this.dialog.open(FilterByLocationDialogComponent, {
      width: '380px',
      height: '453px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data: this.locationData,
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size) => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('380px', '453px');
      }
    });

    dialogRef.afterClosed().subscribe((result: LocationData | boolean) => {
      smallDialogSubscription.unsubscribe();

      if ((result as boolean) === false) {
        this.clearLocation();
      } else {
        this.selectedLat = (result as LocationData).latitude;
        this.selectedLong = (result as LocationData).longitude;
        this.selectedRadius = (result as LocationData).radius;

        this.locationData = result as LocationData;
      }

      this.doSearch();
    });
  }

  clearLocation() {
    this.locationData = null;
    this.selectedLat = null;
    this.selectedLong = null;
    this.selectedRadius = null;
  }

  clearLocationFilter() {
    this.locationData = undefined;
    this.searchTextUpdated();
    this.clearLocation();
    this.doSearch();
  }
}
