import { Component, OnDestroy, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';
import { AreaRestriction } from './area-restrictions-full-details/area-restrictions-full-details.component';
import { AGOLService } from '@app/services/AGOL-service';
import { EvacData } from './evac-alert-full-details/evac-alert-full-details.component';

@Component({
  selector: 'wfnews-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss']
})
export class FullDetailsComponent implements OnInit, OnDestroy {
  public params: ParamMap

  constructor(private router: ActivatedRoute, private route: Router, private agolService: AGOLService) {
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: ParamMap) => {
      this.params = params
    })
    if (document.getElementById('mobile-navigation-bar')) document.getElementById('mobile-navigation-bar').style.display = 'none';
  }

  ngOnDestroy(): void {
    if (document.getElementById('mobile-navigation-bar')) document.getElementById('mobile-navigation-bar').style.display = 'block';
  }

  getTitle() {
    switch (this.params['type']) {
      case 'area-restriction':
        return 'Area Restriction'
      case 'danger-rating':
        return 'Wildfire Danger Rating'
      case 'bans-prohibitions':
        return 'Fire Bans'
      case 'evac-alert': 
      case 'evac-order':
        return 'Evacuation Notice'
    }
  }

  back() {
    if (this.params && this.params['source']) {
      this.route.navigate(this.params['source']);
    }
    else this.route.navigate([ResourcesRoutes.DASHBOARD]);
  }

  async exit() {
    try {
      // if exiting from area restriction full details retrieve the restriction's location to display as centred on the wildfire map
      if ((this.params['type']) === 'area-restriction' && this.params['id']) {
        let restrictionData = null;
        const id = this.params['id']
        const response = await this.agolService.getAreaRestrictionsByID(id, { returnCentroid: true }).toPromise()
        if (response?.features[0]?.attributes) {
          const areaRestriction = response.features[0]

          restrictionData = new AreaRestriction

          restrictionData.centroidLatitude = areaRestriction.centroid.y;
          restrictionData.centroidLongitude = areaRestriction.centroid.x;

        } else {
          console.error('Area Restriction ' + id + ' could not be retrieved')
        }
        if (restrictionData && restrictionData.centroidLongitude && restrictionData.centroidLatitude) {
          setInterval(() => {
            this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { longitude: restrictionData.centroidLongitude, latitude: restrictionData.centroidLatitude, areaRestriction: true } });
          }, 100);

        }
        else this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
      }
      else if (((this.params['type']) === 'evac-alert' || (this.params['type']) === 'evac-order') && this.params['id']) {
        let evacData = null;
        const id = this.params['id']
        const response = await this.agolService.getEvacOrdersByID(id, { returnCentroid: true }).toPromise()
        if (response?.features[0]?.attributes) {
          const areaRestriction = response.features[0]

          evacData = new EvacData

          evacData.centroidLatitude = areaRestriction.centroid.y;
          evacData.centroidLongitude = areaRestriction.centroid.x;

        } else {
          console.error('Area Restriction ' + id + ' could not be retrieved')
        }
        if (evacData && evacData.centroidLongitude && evacData.centroidLatitude) {
          setInterval(() => {
            this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { longitude: evacData.centroidLongitude, latitude: evacData.centroidLatitude } });
          }, 100);

        }
        else this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
      }
    } catch (error) {
      console.error('Exiting full details failed with error: ' + error)
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
    }

  }
}
