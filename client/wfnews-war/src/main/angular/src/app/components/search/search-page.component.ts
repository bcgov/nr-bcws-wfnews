import { ChangeDetectorRef, Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { AGOLService } from "@app/services/AGOL-service"
import { CommonUtilityService } from "@app/services/common-utility.service"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { PlaceData } from "@app/services/wfnews-map.service/place-data"
import { haversineDistance } from "@app/services/wfnews-map.service/util"

export class GeocoderAddress {
  civicNumber: string | number | null | undefined
  dir: string | null | undefined
  dist: string | number | null | undefined
  loc: number[] | null | undefined
  localityName: string | null | undefined
  localityType: string | null | undefined
  streetName: string | null | undefined
  streetQualifier: string | null | undefined
  streetType: string | null | undefined
}

export class SearchData {
  // result data for the map page. I expect this will just be
  // the latitude and longitude to jump to, if an address, or a redirect
  // to be implemented in later tickets
}

export class SearchResult {
  public id: any // index or some other id back to source data
  public type: string
  public title: string
  public subtitle: string
  public distance: string
}

@Component({
  selector: 'wfnews-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent {
  public searchData: SearchData
  public searchText: string

  public addressSearchComplete = true
  public evacSearchComplete = true
  public incidentSearchComplete = true

  // list container. If we wind up not using the separate containers, we can toss them
  public allResultData: SearchResult[] = []

  private searchTimeout
  private userLocation
  private userLocationChecked = false

  constructor (private dialogRef: MatDialogRef<SearchPageComponent>, @Inject(MAT_DIALOG_DATA) public data: SearchData, private agolService: AGOLService, private commonUtilityService: CommonUtilityService, private publishedIncidentService: PublishedIncidentService, private cdr: ChangeDetectorRef) {
    this.searchData = data || new SearchData
  }

  search () {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = null
    }

    this.searchTimeout = setTimeout(() => {
      // Using searchText, search for the Incidents, Evacs, etc
      // Can be async, populate lists as they come in
      if (this.searchText.length > 3) {
        this.allResultData = []

        this.searchAddress()
        this.searchIncidents()
        this.searchEvacs()
      }
    }, 1000)
  }

  clearSearch () {
    this.searchText = null
    this.addressSearchComplete = true
    this.evacSearchComplete = true
    this.incidentSearchComplete = true
    this.allResultData = []
  }

  async checkUserLocation () {
    if (!this.userLocationChecked) {
      this.userLocation = await this.commonUtilityService.getCurrentLocationPromise()
      this.userLocationChecked = true
    }
  }

  // Search functions:
  async searchAddress () {
    this.addressSearchComplete = false

    await this.checkUserLocation()

    const geocoder = new PlaceData()
    geocoder.searchAddresses(this.searchText)
    .then((results) => {
      if (results?.length > 0) {
        for (const val of results) {
          const address = (val as GeocoderAddress)

          this.allResultData.push({
            id: address.loc,
            type: 'address',
            title: `${address.streetQualifier} ${address.civicNumber} ${address.streetName} ${address.streetType}`.trim() || address.localityName,
            subtitle: address.localityName,
            distance: this.userLocation ? (Math.round(haversineDistance(address.loc[1], this.userLocation.coords.latitude, address.loc[0], this.userLocation.coords.longitude) / 1000)).toFixed(0) + ' km' : ''
          })
        }

        // sort
        this.allResultData.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0)

        this.addressSearchComplete = true
        this.cdr.detectChanges()
      }
    }).catch(err => {
      console.error('Address search failed: ' + err)
      this.addressSearchComplete = true
    })
  }

  async searchIncidents () {
    this.incidentSearchComplete = false

    await this.checkUserLocation()

    // limited load or keep paging/fetching?
    const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(1, 50, this.userLocation, this.searchText).toPromise()

    if (incidents && incidents.collection) {
      for (const element of incidents.collection) {
        console.log(element)
        const distance = this.userLocation ? (Math.round(haversineDistance(element.latitude, this.userLocation.coords.latitude, element.longitude, this.userLocation.coords.longitude) / 1000)).toFixed(0) + ' km' : ''

        this.allResultData.push({
          id: element.incidentNumberLabel,
          type: 'incident',
          title: element.incidentName === element.incidentNumberLabel ? element.incidentName : `${element.incidentName} (${element.incidentNumberLabel})`,
          subtitle: element.fireCentreName,
          distance: distance
        })
      }
    }

    this.allResultData.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0)

    this.incidentSearchComplete = true
    this.cdr.detectChanges()
  }

  async searchEvacs () {
    this.evacSearchComplete = false

    await this.checkUserLocation()

    const whereString = `(EVENT_NAME LIKE '%${this.searchText}%' OR ORDER_ALERT_STATUS LIKE '%${this.searchText}%' OR ISSUING_AGENCY LIKE '%${this.searchText}%')`

    const evacs = await this.agolService.getEvacOrders(whereString, null, { returnCentroid: this.userLocation !== null, returnGeometry: false}).toPromise()
    if (evacs && evacs.features) {
      for (const element of evacs.features) {
        let distance = null
        if (this.userLocation) {
          const currentLat = Number(this.userLocation.coords.latitude);
          const currentLong = Number(this.userLocation.coords.longitude);

          if (element.centroid) {
            distance = (Math.round(haversineDistance(element.centroid.y, currentLat, element.centroid.x, currentLong) / 1000)).toFixed(0)
          }
        }

        this.allResultData.push({
          id: element.attributes.EMRG_OAA_SYSID,
          type: (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase(),
          title: element.attributes.EVENT_NAME,
          subtitle: '', // Fire Centre would mean loading incident as well... evacs can cross centres
          distance: distance
        })
      }
      // sort
      this.allResultData.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0)

      this.evacSearchComplete = true
      this.cdr.detectChanges()
    }
  }
}
