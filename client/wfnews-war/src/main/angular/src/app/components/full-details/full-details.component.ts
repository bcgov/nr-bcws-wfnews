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
  ) {}

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
      if (this.params && this.params['source']) {
        if (
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
          this.params['source'] === 'incidents' &&
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
throw new Error('No previous screen to route too');
}
    } catch (err) {
      console.error(err);
      this.router.navigate([ResourcesRoutes.DASHBOARD]);
    }
  }

  async exit() {
    this.router.navigate([ResourcesRoutes.DASHBOARD]);
  }
}
