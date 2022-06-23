import { SelectionChange, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTable } from "@angular/material/table";
import { NavigationEnd, Router } from "@angular/router";
import { select, Store } from '@ngrx/store';
import { AppConfigService, SpatialUtilsService } from '@wf1/core-ui';
import { Subscription } from "rxjs";
import { debounceTime } from 'rxjs/operators';
import { WfimMapService } from '../../../../services/wfim-map.service';
import { Location } from '../../../../services/wfim-map.service/place-data';
import { formatDistance, LonLat } from '../../../../services/wfim-map.service/util';
import { RootState } from '../../../../store';
import { SearchResultsAction } from '../../../../store/place-name/place-name.actions';
import { PlaceData, PlaceNameState, RoadData } from '../../../../store/place-name/place-name.state';

@Component({
    selector: 'wfim-place-name-search-panel',
    templateUrl: './place-name-search.component.html',
    styleUrls: ['./place-name-search.component.scss','../../../../components/marker-layer-base.component.scss']
})
export class PlaceNameSearchComponent implements OnInit, OnDestroy, AfterViewInit {
    public TOOLTIP_DELAY = 500;
    public DEFAULT_DISTANCE = 100;
    public DEFAULT_PLACE_RESULTS = 5;
    public DEFAULT_ROAD_RESULTS = 5;

    @ViewChildren('placeNameTable') placeNameTable: MatTable<PlaceData>;
    @ViewChildren('placeNameElement') placeNameElement: ElementRef;

    placeName = new FormControl('');

    numPlaceResults = new FormControl(this.DEFAULT_PLACE_RESULTS);
    roadName = new FormControl('');
    intersectingRoadName = new FormControl('');
    numRoadResults = new FormControl(this.DEFAULT_ROAD_RESULTS);
    distanceFrom = new FormControl(this.DEFAULT_DISTANCE);
    location: [number, number];

    placeNameResults: PlaceData[] = [];
    fullPlaceNameResults: PlaceData[] = [];
    placeNameColumns: string[] = ['name', 'centreType', 'distance'];

    roadNameResults: RoadData[] = [];
    fullRoadNameResults: RoadData[] = [];
    roadNameColumns: string[] = ['name', 'distance'];

    placeNameSelection: SelectionModel<PlaceData>;
    roadNameSelection: SelectionModel<RoadData>;

    private updatingSelectedList = false;
    private isSingleClick: boolean = true;
    private routeEventsSub: Subscription;

    constructor(
        private config: AppConfigService,
        private store: Store<RootState>,
        protected spatialUtils: SpatialUtilsService,
        private router: Router,
        protected wfimMapService: WfimMapService
    ) {
        this.placeNameSelection = new SelectionModel<PlaceData>(false, []);
        this.placeNameSelection.changed.asObservable().pipe(
            debounceTime(200)
        ).subscribe((selection: SelectionChange<PlaceData>) => {
            if (selection.added.length > 0) {
                const coordinates = selection.added[0].loc;
                this.setAnchor(coordinates);
            }
        });
        this.roadNameSelection = new SelectionModel<RoadData>(false, []);
        this.roadNameSelection.changed.asObservable().pipe(
            debounceTime(200)
        ).subscribe((selection: SelectionChange<RoadData>) => {
            if (selection.added.length > 0) {
                const coordinates = selection.added[0].loc;
                this.setAnchor(coordinates);
            }
        });
    }

    ngAfterViewInit(): void {
        this.focusOnPlaceName();
    }

    focusOnPlaceName() {
        if (this.placeNameElement && this.placeNameElement['first'] && this.placeNameElement['first'].nativeElement) {
            setTimeout(() => {
                this.placeNameElement['first'].nativeElement.focus();
            }, 250);
        }
    }

    ngOnInit() {
        this.focusOnPlaceName();

        this.wfimMapService.setSearchResultHandler( ( results ) => {
            if (!this.updatingSelectedList) {
                // Only fire an update action when selection is made by the user
                this.store.dispatch(new SearchResultsAction(results));
            }
            else {
                // Reset the updatingSelectedList flag
                // NOTE: This logic is necessary to prevent an unending event loop from selection updates.
                this.updatingSelectedList = false;
            }
        } )

        this.wfimMapService.setMaximumDistance(this.DEFAULT_DISTANCE)

        this.store.pipe(select('placeName')).subscribe(
            (placeState: PlaceNameState) => {
                let selectedPlace: PlaceData;
                if (this.placeNameSelection.hasValue()) {
                    selectedPlace = this.placeNameSelection.selected[0]; // Table is single select, so we only need the first value of the selected array
                    selectedPlace = placeState.places.find(currentPlace => currentPlace.name === selectedPlace.name);
                }
                let selectedRoad: RoadData;
                if (this.roadNameSelection.hasValue()) {
                    selectedRoad = this.roadNameSelection.selected[0]; // Table is single select, so we only need the first value of the selected array
                    selectedRoad = (placeState.intersections && placeState.intersections.length > 0)
                        ? placeState.intersections.find(currentRoad => currentRoad.name === selectedRoad.name)
                        : placeState.roads.find(currentRoad => currentRoad.name === selectedRoad.name);
                }
                this.fullPlaceNameResults = placeState.places;
                this.fullRoadNameResults = (placeState.intersections && placeState.intersections.length > 0) ? placeState.intersections : placeState.roads;
                if (selectedPlace) {
                    this.updatingSelectedList = true;
                    this.placeNameSelection.select(selectedPlace);
                }
                if (selectedRoad) {
                    this.updatingSelectedList = true;
                    this.roadNameSelection.select(selectedRoad);
                }
                if (!selectedPlace && !selectedRoad) {
                    this.shiftResultsToTop();
                }
                this.setMaxNumPlaceResults(this.numPlaceResults.value);
                this.setMaxNumRoadResults(this.numRoadResults.value);
            }
        );

        this.routeEventsSub = this.routeEventsSub ? this.routeEventsSub : this.router.events.subscribe((val) => {
            // see also

            if (val instanceof NavigationEnd) {
                if (val.url == '/placeNameSearch') {
                    this.focusOnPlaceName();
                    setTimeout(() => {
                        this.searchPlaceName(this.placeName.value);
                        this.searchRoadName(this.roadName.value, this.intersectingRoadName.value);
                    }, 100);
                }
            }
        });
    }

    shiftResultsToTop() {
        if (this.fullPlaceNameResults) {
            // City, Town, Village, District Municipality, Community
            let cities = this.fullPlaceNameResults.filter(item => this.checkPlaceIfType('City', item) > -1);
            let towns = this.fullPlaceNameResults.filter(item => this.checkPlaceIfType('Town', item) > -1);
            let villages = this.fullPlaceNameResults.filter(item => this.checkPlaceIfType('Village', item) > -1);
            let districtMunicipalities = this.fullPlaceNameResults.filter(item => this.checkPlaceIfType('District Municipality', item) > -1);
            let communities = this.fullPlaceNameResults.filter(item => this.checkPlaceIfType('Community', item) > -1);

            this.fullPlaceNameResults = this.fullPlaceNameResults.filter(item => {
                return this.checkPlaceIfType('City', item) == -1 && this.checkPlaceIfType('Town', item) == -1
                    && this.checkPlaceIfType('Village', item) == -1 && this.checkPlaceIfType('District Municipality', item) == -1
                    && this.checkPlaceIfType('Community', item) == -1
            });
            this.fullPlaceNameResults.unshift(...cities, ...towns, ...villages, ...districtMunicipalities, ...communities);
        }
    }

    checkPlaceIfType(type: string, item) {
        if (item && item.type) {
            return item.type.indexOf(type);
        }

        return -1;
    }

    ngOnDestroy() {
        this.clearPlaceSearch();
        this.wfimMapService.setSearchResultHandler( null )

        if (this.routeEventsSub) {
            this.routeEventsSub.unsubscribe();
        }
    }

    setMaxNumPlaceResults(maxResults: number) {
        if (this.fullPlaceNameResults && this.fullPlaceNameResults.length > maxResults) {
            this.placeNameResults = this.fullPlaceNameResults.slice(0, maxResults);
        } else {
            this.placeNameResults = this.fullPlaceNameResults;
        }
    }

    setMaxNumRoadResults(maxResults: number) {
        if (this.fullRoadNameResults && this.fullRoadNameResults.length > maxResults) {
            this.roadNameResults = this.fullRoadNameResults.slice(0, maxResults);
        } else {
            this.roadNameResults = this.fullRoadNameResults;
        }
    }

    setMaximumDistance(maxDistance: number) {
        this.wfimMapService.setMaximumDistance(maxDistance)
    }

    searchPlaceName(nameValue) {
        return this.wfimMapService.findPlace(nameValue)
    }

    searchRoadName(nameValue, intersectingRoadNameValue) {
        if (intersectingRoadNameValue && intersectingRoadNameValue.trim().length > 0)
            return this.wfimMapService.findIntersection(nameValue, intersectingRoadNameValue)

        return this.wfimMapService.findRoad(nameValue)
    }

    showCandidate(location: Location) {
        return this.wfimMapService.showCandidate(location)
    }

    clearCandidate() {
        return this.wfimMapService.showCandidate()
    }

    selectPlace(location: PlaceData) {
        this.isSingleClick = true;
        setTimeout(() => {
            if (this.isSingleClick) {
                this.placeNameSelection.toggle(location);
                this.roadNameSelection.clear();
                this.location = location.loc;
            }
        }, 200);

        setTimeout(() => {
            if (this.placeNameTable && this.placeNameTable['first'] && this.placeNameTable['first']['_elementRef'] &&
                this.placeNameTable['first']['_elementRef'].nativeElement && this.placeNameTable['first']['_elementRef'].nativeElement.children &&
                this.placeNameTable['first']['_elementRef'].nativeElement.children.length > 1 && this.placeNameTable['first']['_elementRef'].nativeElement.children[1].children
                && this.placeNameTable['first']['_elementRef'].nativeElement.children[1].children.length >= 1) {
                this.placeNameTable['first']['_elementRef'].nativeElement.children[1].children[0].focus();
            }
        }, 750);
    }

    selectFirstPlace() {
        if (this.placeNameResults.length > 0) {
            let selectLocation = this.placeNameResults[0];
            this.selectPlace(selectLocation);
        }
    }

    zoomPlace(location: PlaceData) {
        this.isSingleClick = false;
        this.selectPlace(location);
        return this.wfimMapService.zoomToPoint(location.loc).then( () => {
            this.isSingleClick = true;
        } )
    }


    selectRoad(location: RoadData) {
        this.isSingleClick = true;
        setTimeout(() => {
            if (this.isSingleClick) {
                this.roadNameSelection.toggle(location);
                this.placeNameSelection.clear();
                this.location = location.loc;
            }
        }, 250);
    }

    selectFirstRoad() {
        if (this.roadNameResults.length > 0) {
            let selectRoad = this.roadNameResults[0];
            this.selectRoad(selectRoad);
        }
    }

    zoomRoad(location: RoadData) {
        this.isSingleClick = false;
        this.selectRoad(location);
        return this.wfimMapService.zoomToPoint(location.loc).then( () => {
            this.isSingleClick = true;
        } )
    }

    refreshSearch() {
        this.searchPlaceName(this.placeName.value);
        this.searchRoadName(
            this.roadName.value,
            this.intersectingRoadName.value
        );
    }

    setAnchor(location: LonLat) {
        this.wfimMapService.setAnchor(location)
    }

    clearPlaceSearch() {
        this.placeName.setValue('');
        this.placeNameSelection.clear();
        this.roadName.setValue('');
        this.roadNameSelection.clear();
        this.intersectingRoadName.setValue('');
        this.searchPlaceName(this.placeName.value);
        this.searchRoadName(this.roadName.value, this.intersectingRoadName.value);
        this.wfimMapService.clearSearch()
        this.focusOnPlaceName();
    }

    locationSelected(location?: [number, number]) {
        if (location) {
            this.copyLocationToClipboard(location);
            if (this.placeNameSelection.hasValue()) {
                let selectedPlace = this.placeNameSelection.selected[0]; // Table is single select, so we only need the first value of the selected array
                if (selectedPlace.loc[0] !== location[0] || selectedPlace.loc[1] !== location[1]) {
                    this.placeNameSelection.clear();
                }
            }
            if (this.roadNameSelection.hasValue()) {
                let selectedPlace = this.roadNameSelection.selected[0]; // Table is single select, so we only need the first value of the selected array
                if (selectedPlace.loc[0] !== location[0] || selectedPlace.loc[1] !== location[1]) {
                    this.roadNameSelection.clear();
                }
            }
            this.refreshSearch();
            this.wfimMapService.clearSelectedPoint()
        } else {
            this.clearPlaceSearch();
        }
    }

    copyLocationToClipboard(location?: [number, number]) {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = this.getFormattedLatLong(location).replace(/'/g, "").replace(/\s*,\s*/g, " ");
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    getFormattedLatLong(location) {
        return location ? this.spatialUtils.formatCoordinates(location) : '';
    }

    setLocation(location: [number, number]) {

    }

    formatDistanceDirection(result: PlaceData | RoadData) {
        let dist = '', dir = ''
        if ( result.dist && !result.isAnchor ) {
            dist = `${ formatDistance( result.dist, 'km' ) }`
            if ( result.direction ) dir = `&nbsp;${ result.direction }`
        }

        return dist + dir
    }

    formatDirection(result: PlaceData | RoadData) {
        return (result.direction !== undefined && result.direction !== null) ? `${result.direction}` : '';
    }

    tableKeydown(event: KeyboardEvent, location: PlaceData) {
        let el = event.target as Element

        if (event.key === 'ArrowDown') {
            if (el && el.nextElementSibling) {
                let element: HTMLElement = el.nextElementSibling as HTMLElement;
                element.focus();
            }
        } else if (event.key === 'ArrowUp') {
            if (el && el.previousElementSibling) {
                let element: HTMLElement = el.previousElementSibling as HTMLElement;
                element.focus();
            }
        } else if (event.key === 'Enter') {
            if (this.placeNameSelection && this.placeNameSelection.selected && this.placeNameSelection.selected.length > 0 &&
                this.placeNameSelection.selected[0].name == location.name && this.placeNameSelection.selected[0].type == location.type) {
                // if (this.webMapApi) this.webMapApi.zoomToPoint(location.loc)
            } else {
                this.selectPlace(location);
            }
        }
    }

    onClose() {
        this.router.navigate( [ '/' ] )
    }
}
