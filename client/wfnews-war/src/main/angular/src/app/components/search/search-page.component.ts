import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { AGOLService } from "@app/services/AGOL-service"
import { CommonUtilityService } from "@app/services/common-utility.service"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { PlaceData } from "@app/services/wfnews-map.service/place-data"
import { haversineDistance } from "@app/services/wfnews-map.service/util"

type GeocoderDefaults = string | null | undefined
export class GeocoderAddress {
  civicNumber: GeocoderDefaults | number
  dir: GeocoderDefaults
  dist: GeocoderDefaults | number
  loc: number[] | null | undefined
  localityName: GeocoderDefaults
  localityType: GeocoderDefaults
  streetName: GeocoderDefaults
  streetQualifier: GeocoderDefaults
  streetType: GeocoderDefaults
}

export class SearchResult {
  public id: any // index or some other id back to source data
  public type: string
  public title: string
  public subtitle: string
  public distance: string
  public relevance: number
  public location: number[]
}

@Component({
  selector: 'wfnews-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  public searchData: SearchResult
  public searchText: string

  public addressSearchComplete = true
  public evacSearchComplete = true
  public incidentSearchComplete = true

  // list container. If we wind up not using the separate containers, we can toss them
  public allResultData: SearchResult[] = []
  public recentData: SearchResult[] = []
  public fonData: SearchResult[] = []
  public evacData: SearchResult[] = []

  private searchTimeout
  private userLocation
  private userLocationChecked = false

  constructor (private dialogRef: MatDialogRef<SearchPageComponent>, @Inject(MAT_DIALOG_DATA) public data: SearchResult, private agolService: AGOLService, private commonUtilityService: CommonUtilityService, private publishedIncidentService: PublishedIncidentService, private cdr: ChangeDetectorRef) {
    this.searchData = data || new SearchResult
  }

  async ngOnInit(): Promise<void> {
    await this.checkUserLocation()
    // fetch local storage for recent data
    if (localStorage.getItem('recent-search') != null) {
      try {
        this.recentData = JSON.parse(localStorage.getItem('recent-search')) as SearchResult[]
      } catch (err) {
        console.error(err)
        // carry on with the empty array
      }
    }

    // pre-load fires of note for the province
    this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise().then(incidents => {
      if (incidents && incidents.collection) {
        for (const element of incidents.collection) {
          const distance = this.userLocation ? (Math.round(haversineDistance(element.latitude, this.userLocation.coords.latitude, element.longitude, this.userLocation.coords.longitude) / 1000)).toFixed(0) : ''

          this.fonData.push({
            id: element.incidentNumberLabel,
            type: 'incident',
            title: element.incidentName === element.incidentNumberLabel ? element.incidentName : `${element.incidentName} (${element.incidentNumberLabel})`,
            subtitle: element.fireCentreName,
            distance: distance,
            relevance: 4,
            location: [element.longitude, element.latitude]
          })

          this.fonData.sort((a, b) => Number(a.distance || 0) > Number(b.distance || 0) ? 1 : Number(a.distance || 0) < Number(b.distance || 0) ? -1 : 0 || a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.title.localeCompare(b.title))
        }
      }
    })

    // pre-load evacuations
    this.agolService.getEvacOrders(null, null, { returnCentroid: this.userLocation !== null, returnGeometry: false}).toPromise().then(evacs => {
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

          this.evacData.push({
            id: element.attributes.EMRG_OAA_SYSID,
            type: (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase(),
            title: element.attributes.EVENT_NAME,
            subtitle: '', // Fire Centre would mean loading incident as well... evacs can cross centres
            distance: distance,
            relevance: (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Order' ? 1 : 2,
            location: [element.centroid.y, element.centroid.x]
          })
        }

        this.evacData.sort((a, b) => Number(a.distance || 0) > Number(b.distance || 0) ? 1 : Number(a.distance || 0) < Number(b.distance || 0) ? -1 : 0 || a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.id.localeCompare(b.id))
      }
    })
  }

  search () {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = null
    }

    this.searchTimeout = setTimeout(() => {
      // Using searchText, search for the Incidents, Evacs, etc
      // Can be async, populate lists as they come in
      if (this.searchText.length >= 3) {
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
            distance: this.userLocation ? (Math.round(haversineDistance(address.loc[1], this.userLocation.coords.latitude, address.loc[0], this.userLocation.coords.longitude) / 1000)).toFixed(0) : '',
            relevance: /^\d/.test(this.searchText.trim()) ? 4 : 1,
            location: address.loc
          })
        }

        this.sort()

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
    const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(1, 10, this.userLocation, this.searchText).toPromise()

    if (incidents && incidents.collection) {
      for (const element of incidents.collection) {
        const distance = this.userLocation ? (Math.round(haversineDistance(element.latitude, this.userLocation.coords.latitude, element.longitude, this.userLocation.coords.longitude) / 1000)).toFixed(0) : ''

        this.allResultData.push({
          id: element.incidentNumberLabel,
          type: 'incident',
          title: element.incidentName === element.incidentNumberLabel ? element.incidentName : `${element.incidentName} (${element.incidentNumberLabel})`,
          subtitle: element.fireCentreName,
          distance: distance,
          relevance: /^\d/.test(this.searchText.trim()) ? 3 : 4,
          location: [element.longitude, element.latitude]
        })
      }
    }

    this.sort()

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
          distance: distance,
          relevance: /^\d/.test(this.searchText.trim()) && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Order' ? 2
                   : /^\d/.test(this.searchText.trim()) && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Alert' ? 1
                   : /^\d/.test(this.searchText.trim()) === false && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Order' ? 3
                   : 2,
          location: [element.centroid.y, element.centroid.x]
        })
      }

      this.sort()

      this.evacSearchComplete = true
      this.cdr.detectChanges()
    }
  }

  sort () {
    this.allResultData.sort((a, b) => Number(a.distance || 0) > Number(b.distance || 0) ? 1 : Number(a.distance || 0) < Number(b.distance || 0) ? -1 : 0 || a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.title.localeCompare(b.title))
  }

  removeFromRecent (item: SearchResult, index: number) {
    if (localStorage.getItem('recent-search') != null) {
      try {
        this.recentData = JSON.parse(localStorage.getItem('recent-search')) as SearchResult[]
        // remove the item from the list
        this.recentData.splice(index, 1)
        localStorage.setItem('recent-search', JSON.stringify(this.recentData))
      } catch (err) {
        console.error(err)
        // ignore, clear data
        this.recentData = []
      }
    }
  }
}
