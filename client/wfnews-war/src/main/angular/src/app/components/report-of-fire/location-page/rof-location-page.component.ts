import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Injector } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { AppConfigService } from "@wf1/core-ui";
import { MapConfigService } from '../../../services/map-config.service';
import { CompassHeading } from "../../../services/capacitor-service";
import { CommonUtilityService } from '../../../services/common-utility.service';

@Component({
  selector: 'rof-location-page',
  templateUrl: './rof-location-page.component.html',
  styleUrls: ['./rof-location-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFLocationPage extends RoFPage {
  mapConfig = null;
  SMK: any;
  location?: any;
  distanceEstimateMeter: number = 100;
  heading: CompassHeading;



  public constructor(
    private appConfig: AppConfigService,
    private mapConfigService: MapConfigService,        
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    protected injector: Injector
  ) {
    super()
  }

  async initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    await this.useMyCurrentLocation()
    this.mapConfigService = this.injector.get(MapConfigService)
    super.initialize(data, index, reportOfFire)
    this.appConfig.configEmitter.subscribe((config) => {
      const mapConfig = [];
      this.mapConfigService.getMapConfig()
        .then((mapState) => {
          let turf = window['turf'],
            loc = [ this.location.coords.longitude, this.location.coords.latitude],
            dist = this.distanceEstimateMeter / 1000, //km
            head = this.currentHeading,
            photo = turf.destination( loc, dist, head ),
            poly = turf.circle( photo.geometry.coordinates, dist ),
            exp = turf.transformScale( poly, 1.10 ),
            bbox = turf.bbox( exp ),
            view = { viewer: { location: { extent: bbox } } }

          this.SMK = window['SMK'];
          this.mapConfig = [ mapState, view ]
        })
        .then(() => {
          const deviceConfig = { viewer: { device: 'desktop' } };
          this.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?'];
        });
    });
  }

  get currentHeading() {
    if ( !this.hasHeading ) return 0
    return this.heading.trueHeading || 0
  }
  get hasHeading() {
    if ( !this.heading ) return false
    if ( this.heading.error ) return false
    return true
  }

  setLocation () {
    // the map should trigger this once configured
    this.reportOfFire.estimatedDistance = 0;
    this.reportOfFire.fireLocation = [-112, 50];
  }

  async useMyCurrentLocation() {
    this.location = await this.commonUtilityService.getCurrentLocationPromise()
  }
}
