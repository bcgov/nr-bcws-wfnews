import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Injector, AfterViewInit, ElementRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MapConfigService } from '../../../services/map-config.service';
import { CompassHeading } from "../../../services/capacitor-service";
import { CommonUtilityService } from '../../../services/common-utility.service';
import { LatLon, LonLat } from "../../../../../src/app/services/wfnews-map.service/util";
import { SmkApi } from "../../../../../src/app/utils/smk";
import { HttpClient } from "@angular/common/http";


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
  distanceEstimateMeter: number = 100;
  heading: CompassHeading;
  turf:any;
  fireLocation?: LatLon;
  smkApi: SmkApi;
  http: HttpClient

  public constructor(
    private mapConfigService: MapConfigService,        
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    private elementRef: ElementRef

  ) {
    super()
  }

  ngAfterViewInit() {
      this.mapConfigService.getReportOfFireMapConfig().then((cfg) => {
          let turf = window['turf'],
          loc = [ this.location.coords.longitude, this.location.coords.latitude],
          dist = this.distanceEstimateMeter / 1000, //km
          head = this.currentHeading,
          photo = turf.destination( loc, dist, head ),
          poly = turf.circle( photo.geometry.coordinates, dist ),
          exp = turf.transformScale( poly, 1.10 ),
          bbox = turf.bbox( exp ),
          view = { viewer: { location: { extent: bbox } } }
          this.mapConfig = [ cfg, view ]
          this.cdr.detectChanges()
        })
        const mapView = this.elementRef.nativeElement.querySelector('#mapView');
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
    const mapContainer = this.elementRef.nativeElement.querySelector('#mapView');
    mapContainer.requestFullscreen();
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

    if ( arrowLenPx >= 2 * ( lineStartOffsetPx + lineEndOffsetPx ) ) {
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
    else {
        smk.showFeature( 'arrow-head' )
        smk.showFeature( 'arrow-line' )
        smk.showFeature( 'arrow-line-shadow' )
    }
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
