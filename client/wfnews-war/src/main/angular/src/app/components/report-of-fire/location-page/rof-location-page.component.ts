import { Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, ElementRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { HttpClient } from "@angular/common/http";
import { CompassHeading } from "@app/services/capacitor-service";
import { LatLon, LonLat } from "@app/services/wfnews-map.service/util";
import { SmkApi } from "@app/utils/smk";
import { MapConfigService } from "@app/services/map-config.service";
import { CommonUtilityService } from "@app/services/common-utility.service";


@Component({
  selector: 'rof-location-page',
  templateUrl: './rof-location-page.component.html',
  styleUrls: ['./rof-location-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFLocationPage extends RoFPage implements AfterViewInit {
  mapConfig = null;
  SMK: any;
  location?: any;
  distanceEstimateMeter: number = 1000;
  heading: CompassHeading;
  turf:any;
  fireLocation?: LatLon;
  smkApi: SmkApi;
  http: HttpClient
  fullScreenMode: boolean = false;

  public constructor(
    private mapConfigService: MapConfigService,        
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    private elementRef: ElementRef

  ) {
    super()
  }

  ngAfterViewInit(): void {
    this.loadMapConfig()
  }

  async initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    await this.useMyCurrentLocation()
    super.initialize(data, index, reportOfFire)
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

  toggleFullScreen(): void {
    this.fullScreenMode = !this.fullScreenMode;
    const mapContainer = this.elementRef.nativeElement.querySelector('#mapView');
    if (this.fullScreenMode){
      mapContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  setLocation () {
    // the map should trigger this once configured
    this.reportOfFire.estimatedDistance = 0;
    this.reportOfFire.fireLocation = [-112, 50];
  }

  async useMyCurrentLocation() {
    this.location = await this.commonUtilityService.getCurrentLocationPromise()
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);

    console.log('initMap')
    const L = window[ 'L' ]
    const T = window[ 'turf' ]

    const loc = {
        type: 'Point',
        coordinates: [ this.location.coords.longitude, this.location.coords.latitude ]
    };

    smk.showFeature( 'location', loc, {
        pointToLayer: function ( geojson, latlng ) {
            return L.marker( latlng, {
                icon: L.divIcon( {
                    className:  'rof-location',
                    iconSize:   [ 20, 20 ],
                    iconAnchor: [ 14, 14 ]
                } )
            } )
        }
    } )
    let map = smk.$viewer.map

    map.on( "zoom", () => {
        connector()
    } )
    map.on( "move", () => {
        connector()
    } )

    let connector = () => {
        let photo = map.getCenter(),
            loc = [ this.location.coords.longitude, this.location.coords.latitude ] as LonLat

        this.fireLocation = [ photo.lat, photo.lng ]

        this.arrow( smk, loc, [ photo.lng, photo.lat ] )
    }

    connector()
  }

  confirmLocation() {
    this.reportOfFire[this.updateAttribute] = this.fireLocation;
  }

  // start -----> end
  arrow( smk: any, start: LonLat, end: LonLat ) {
    const L = window[ 'L' ]
    const T = window[ 'turf' ]
    const view = smk.$viewer.getView()
    const lineStartOffsetPx = 15
    const lineEndOffsetPx = 35

    let arrowLine = T.lineString( [ start, end ] )
    let arrowLen = T.length( arrowLine )
    let arrowLenPx = arrowLen * 1000 / view.metersPerPixel

        let startOffset = view.metersPerPixel * lineStartOffsetPx / 1000
        let endOffset = view.metersPerPixel * lineEndOffsetPx / 1000

        let headPt = T.along( T.lineString( [ end, start ] ), endOffset )
        let headRot = T.bearing( headPt.geometry.coordinates, end )
        smk.showFeature( 'arrow-head', headPt, {
            pointToLayer: function ( geojson, latlng ) {
                return L.marker( latlng, {
                    icon: L.divIcon( {
                        className:  'rof-arrow-head',
                        html:       `<i class="material-icons" style="transform:rotateZ(${ headRot }deg);">navigation</i>`,
                        iconSize:   [ 24, 24 ],
                        iconAnchor: [ 12, 12 ]
                    } ),
                    interactive: false
                } )
            }
        } )

        let startPt = T.along( T.lineString( [ start, headPt.geometry.coordinates ] ), startOffset ).geometry.coordinates
        let line = T.lineString( [ startPt, headPt.geometry.coordinates ] )

        smk.showFeature( 'arrow-line', line, {
            style: function () {
                return {
                    color: 'yellow',
                    weight: 5,
                    lineCap: 'butt',
                    interactive: false
                }
            },
            onEachFeature: function ( ft, ly ) {
                ly.bindTooltip( formatDist( arrowLen ) + " km", {
                    permanent: true
                } )
            }
        } )

        smk.showFeature( 'arrow-line-shadow', line, {
            style: function () {
                return {
                    color: 'rgba(0,0,0,36%)',
                    weight: 7,
                    lineCap: 'butt',
                    interactive: false
                }
            }
        } )
  }

  loadMapConfig(){
    this.mapConfigService.getReportOfFireMapConfig().then((cfg) => {
      let turf = window['turf'],
      loc = [ this.location.coords.longitude, this.location.coords.latitude],
      dist = (this.reportOfFire.estimatedDistance && this.reportOfFire.estimatedDistance != 0) ? this.reportOfFire.estimatedDistance / 1000 : this.distanceEstimateMeter / 1000, //km
      head = this.currentHeading,
      photo = turf.destination( loc, dist, head ),
      poly = turf.circle( photo.geometry.coordinates, dist ),
      exp = turf.transformScale( poly, 1.10 ),
      bbox = turf.bbox( exp ),
      view = { viewer: { location: { extent: bbox } } }
      this.mapConfig = [ cfg, view ]
      this.cdr.detectChanges()
    })
  }
}

function formatDist( dist: number ): string {
  if ( dist == null ) return ''

  var rounded = parseFloat( dist.toPrecision( 6 ) )
  var a = Math.abs( rounded ),
      s = Math.sign( rounded ),
      i = Math.floor( a ),
      f = a - i

  return ( s * i ).toLocaleString() + f.toFixed( 3 ).substr( 1 )
}
