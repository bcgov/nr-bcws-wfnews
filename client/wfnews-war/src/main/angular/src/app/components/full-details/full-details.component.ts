import { Component, OnDestroy, OnInit } from '@angular/core';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';
import { AreaRestriction } from './area-restrictions-full-details/area-restrictions-full-details.component';
import { AGOLService } from '@app/services/AGOL-service';
import { EvacData } from './evac-alert-full-details/evac-alert-full-details.component';
import { BanProhibition } from './bans-full-details/bans-full-details.component';

@Component({
  selector: 'wfnews-full-details',
  templateUrl: './full-details.component.html',
  styleUrls: ['./full-details.component.scss']
})
export class FullDetailsComponent implements OnInit, OnDestroy {
  public params: ParamMap

  constructor(private router: Router, private route: ActivatedRoute, private agolService: AGOLService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: ParamMap) => {
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
    try {
      if (this.params && this.params['source']) {
        if (this.params['source'] == 'saved-location' && this.params['sourceName']
          && this.params['sourceLongitude'] && this.params['sourceLatitude']) {
          this.router.navigate([ResourcesRoutes.SAVED_LOCATION],
            {
              queryParams: {
                type: 'saved-location', name: this.params['sourceName'],
                longitude: this.params['sourceLongitude'], latitude: this.params['sourceLatitude']
              }
            });
        } else this.router.navigate(this.params['source']);
      } else throw new Error('No previous screen to route too')
    } catch (err) {
      console.error(err);
      this.router.navigate([ResourcesRoutes.DASHBOARD]);
    }
  }

  async exit() {
    this.router.navigate([ResourcesRoutes.DASHBOARD]);
    // decision to make close button go back to dashboard always. Keeping previous code as I expect this might change
    /*try {
      // if exiting from area restriction full details retrieve the restriction's location to display as centred on the wildfire map
      if ((this.params['type']) === 'area-restriction' && this.params['id']) {
        const id = this.params['id']
        const response = await this.agolService.getAreaRestrictionsByID(id, { returnCentroid: true }).toPromise()
        if (response?.features[0]?.attributes) {
          const areaRestriction = response.features[0]

          if (areaRestriction?.centroid?.y && areaRestriction?.centroid?.x) {
            setTimeout(() => this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { areaRestriction: true, identify: true, longitude: areaRestriction.centroid.x, latitude: areaRestriction.centroid.y } }), 100);
          }
        } else {
          console.error('Area Restriction ' + id + ' could not be retrieved')
        }
      } else if (((this.params['type']) === 'evac-alert' || (this.params['type']) === 'evac-order') && this.params['id']) {
        const response = await this.agolService.getEvacOrdersByID(this.params['id'], { returnCentroid: true }).toPromise()
        if (response?.features[0]?.attributes) {
          const evac = response.features[0]
          if (evac?.centroid?.y && evac?.centroid?.x) {
            setTimeout(() => this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { evac: true, identify: true, longitude: evac.centroid?.x, latitude: evac.centroid?.y } }), 100)
          }
        } else {
          console.error('Evac ' + this.params['id'] + ' could not be retrieved')
        }
      } else if ((this.params['type']) === 'bans-prohibitions' && this.params['id']) {
        const response = await this.agolService.getBansAndProhibitionsById(this.params['id'], { returnGeometry: false, returnCentroid: true, returnExtent: false }).toPromise().catch(err => console.error(err))
        // could also do response length === 1
        if (response?.features[0]?.attributes) {
          const ban = response.features[0]
          if (ban?.centroid?.y && ban?.centroid?.x) {
            setTimeout(() => this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { bans: true, identify: true, longitude: ban.centroid.x, latitude: ban.centroid.y } }), 100);
          }
        }
      }
    } catch (error) {
      console.error('Exiting full details failed with error: ' + error)
    }
    this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);*/
  }
}
