import { ChangeDetectorRef, Component, OnInit } from "@angular/core"
import { ActivatedRoute, ParamMap } from "@angular/router"
import { EvacOrderOption } from "../../conversion/models"
import { AGOLService } from "../../services/AGOL-service"
import { PublishedIncidentService } from "../../services/published-incident-service"

@Component({
  selector: 'public-incident-page',
  templateUrl: './public-incident-page.component.html',
  styleUrls: ['./public-incident-page.component.scss']
})
export class PublicIncidentPage implements OnInit {
  public isLoading = true
  public loadingFailed = false

  public incidentNumber: string
  public incident: any
  public evacOrders: EvacOrderOption[] = []

  constructor(private router: ActivatedRoute,
              protected cdr: ChangeDetectorRef,
              private agolService: AGOLService,
              private publishedIncidentService: PublishedIncidentService) {

  }

  ngOnInit() {
    this.router.queryParams.subscribe((params: ParamMap) => {
      if (params && params['incidentNumber']) {
        this.incidentNumber = params['incidentNumber']
        // Load the incident from the API
        this.publishedIncidentService.fetchPublishedIncident(this.incidentNumber).toPromise().then(result => {
          console.log(result)
          this.incident = result
          // format dates, booleans
          // date formatting options
          const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          // set date strings
          this.incident.discoveryDate = new Date(this.incident.discoveryDate).toLocaleTimeString("en-US", options)
          this.incident.declaredOutDate = this.incident.declaredOutDate ? new Date(this.incident.declaredOutDate).toLocaleTimeString("en-US", options) : new Date(this.incident.discoveryDate).toLocaleTimeString("en-US", options)
          this.incident.lastUpdatedTimestamp = new Date(this.incident.lastUpdatedTimestamp).toLocaleTimeString("en-US", options)
          this.incident.fireOfNoteInd = this.incident.fireOfNoteInd.trim().toUpperCase() === 'T' || this.incident.fireOfNoteInd.trim().toUpperCase() === '1'
          // set T/1 to True, otherwise False
          this.incident.heavyEquipmentResourcesInd = this.incident.heavyEquipmentResourcesInd.trim().toUpperCase() === 'T' || this.incident.heavyEquipmentResourcesInd.trim().toUpperCase() === '1'
          this.incident.incidentMgmtCrewRsrcInd = this.incident.incidentMgmtCrewRsrcInd.trim().toUpperCase() === 'T' || this.incident.incidentMgmtCrewRsrcInd.trim().toUpperCase() === '1'
          this.incident.structureProtectionRsrcInd = this.incident.structureProtectionRsrcInd.trim().toUpperCase() === 'T' || this.incident.structureProtectionRsrcInd.trim().toUpperCase() === '1'
          this.incident.wildfireAviationResourceInd = this.incident.wildfireAviationResourceInd.trim().toUpperCase() === 'T' || this.incident.wildfireAviationResourceInd.trim().toUpperCase() === '1'
          this.incident.wildfireCrewResourcesInd = this.incident.wildfireCrewResourcesInd.trim().toUpperCase() === 'T' || this.incident.wildfireCrewResourcesInd.trim().toUpperCase() === '1'
          // load evac orders nearby
          this.getEvacOrders()
          // activate page
          this.isLoading = false
          this.cdr.detectChanges()
        }).catch(err => {
          console.error(err)
          this.isLoading = false
          this.loadingFailed = true
        })
      } else {
        this.isLoading = false
        this.loadingFailed = true
      }
    })
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(this.incident.geometry, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.evacOrders.push({
            eventName: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
            issuingAgency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
            centroid: element.centroid
          })
        }
      }
    })
  }
}
