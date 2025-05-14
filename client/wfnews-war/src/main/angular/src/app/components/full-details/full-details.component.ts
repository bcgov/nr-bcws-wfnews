import { Component, OnDestroy, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';
import { AGOLService } from '@app/services/AGOL-service';

@Component({
  selector: 'wfnews-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss'],
})
export class FullDetailsComponent implements OnInit, OnDestroy {
  public params: ParamMap;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private agolService: AGOLService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params;
    });
    if (document.getElementById('mobile-navigation-bar')) {
      document.getElementById('mobile-navigation-bar').style.display = 'none';
    }
  }

  ngOnDestroy(): void {
    if (document.getElementById('mobile-navigation-bar')) {
      document.getElementById('mobile-navigation-bar').style.display = 'block';
    }
  }

  getTitle() {
    switch (this.params['type']) {
      case 'area-restriction':
        return 'Area Restriction';
      case 'danger-rating':
        return 'Wildfire Danger Rating';
      case 'bans-prohibitions':
        return 'Fire Bans';
      case 'evac-alert':
      case 'evac-order':
        return 'Evacuation Notice';
    }
  }

  back() {
    try {
      if (this.params?.['source']) {
        // If the user accessed the full details page from the map, and if the full details page contains one of area restrictions,
        // fire bans, evac orders or evac alerts, use the backToMap function to route back to the map using the same layer and zoom level,
        // along with the appropriate coordinates for that type.
        if (this.navigatedfromMapPage()
            && this.isCurrentlyNavigatedOn(['area-restriction', 'bans-prohibitions', 'evac-order', 'evac-alert', 'danger-rating'])) {
          this.backToMap();
        } else if (
          this.params['source'] === 'saved-location' &&
          this.params['sourceName'] &&
          this.params['sourceLongitude'] &&
          this.params['sourceLatitude']
        ) {
          this.router.navigate([ResourcesRoutes.SAVED_LOCATION], {
            queryParams: {
              type: 'saved-location',
              name: this.params['sourceName'],
              longitude: this.params['sourceLongitude'],
              latitude: this.params['sourceLatitude'],
            },
          });
        } else if (
          (this.params['source'] === 'incidents' || this.params['source'][0] === 'incidents') &&
          this.params['sourceYear'] &&
          this.params['sourceNumber']
        ) {
          this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
            queryParams: {
              fireYear: this.params['sourceYear'],
              incidentNumber: this.params['sourceNumber'],
            },
          });
        } else {
          this.router.navigate(this.params['source']);
        }
      } else {
        throw new Error('No previous screen to route to');
      }
    } catch (err) {
      console.error(err);
      this.router.navigate([ResourcesRoutes.DASHBOARD]);
    }
  }

  exit() {
    // If the user accessed the full details page from the map, and if the full details page contains one of area restrictions,
    // fire bans, evac orders or evac alerts, use the backToMap function to route back to the map using the same layer and zoom level,
    // along with the appropriate coordinates for that type
    if (this.navigatedfromMapPage()
      && this.isCurrentlyNavigatedOn(['area-restriction', 'bans-prohibitions', 'evac-order', 'evac-alert', 'danger-rating'])) {
      this.backToMap();
    } else {
      this.router.navigate([ResourcesRoutes.DASHBOARD]);
    }
  }

  navigatedfromMapPage() {
    if (this.params?.['source'] === 'map' || this.params?.['source']?.[0] === 'map') {
      return true;
    } else {
      return false;
    }
  }

  isCurrentlyNavigatedOn(pageList) {
    if (pageList.includes(this.params?.['type'])) {
      return true;
    } else {
      return false;
    }
  }

  // use query params to determine the layer, coordinates and zoom level for routing back to the map
  backToMap() {
    const navigateToMap = (longitude: number, latitude: number, zoom: string, queryParamKey: string) => {
      setTimeout(() => {
        this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude,
            latitude,
            zoom,
            [queryParamKey]: true
          },
        });
      }, 100);
    };

    if (this.params['type'] && this.params['sourceLongitude'] && this.params['sourceLatitude'] && this.params['sourceZoom']) {
      switch (this.params['type']) {
        case 'area-restriction':
          navigateToMap(this.params['sourceLongitude'], this.params['sourceLatitude'], this.params['sourceZoom'], 'areaRestriction');
          break;
        case 'bans-prohibitions':
          navigateToMap(this.params['sourceLongitude'], this.params['sourceLatitude'], this.params['sourceZoom'], 'bansProhibitions');
          break;
        case 'danger-rating':
          navigateToMap(this.params['sourceLongitude'], this.params['sourceLatitude'], this.params['sourceZoom'], 'dangerRating');
          break;
        case 'evac-alert':
        case 'evac-order':
          navigateToMap(this.params['sourceLongitude'], this.params['sourceLatitude'], this.params['sourceZoom'], 'evacuationAlert');
          break;
      }
    } else {
      throw new Error('Error occurred while routing back to map');
    }
  }
}
