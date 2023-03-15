import { Component, ChangeDetectionStrategy, Input, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { AreaRestrictionsOption, EvacOrderOption } from "../../../conversion/models";
import { toCanvas } from 'qrcode'
import { convertToFireCentreDescription, findFireCentreByName, convertToYoutubeId, isMobileView } from '../../../utils'
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { AppConfigService } from "@wf1/core-ui";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentInfoPanel implements AfterViewInit {
  @Input() public incident: any
  @Input() public evacOrders: EvacOrderOption[] = []
  @Input() public areaRestrictions : AreaRestrictionsOption[] = []

  showWarning: boolean;

  public convertToFireCentreDescription = convertToFireCentreDescription
  public findFireCentreByName = findFireCentreByName
  public convertToYoutubeId = convertToYoutubeId
  public isMobileView = isMobileView

  public constructor(private publishedIncidentService: PublishedIncidentService, private snackbarService: MatSnackBar, private appConfigService: AppConfigService,
                     private cdr: ChangeDetectorRef,
                     private router: ActivatedRoute,
                     private http: HttpClient) {}
  public primaryMedia = null

  handleImageFallback (href: string) {
    const imgComponent = document.getElementById('primary-image-container')
    if (imgComponent) {
      (imgComponent as any).src = href
    }
  }

  ngAfterViewInit(): void {
    if (!this.incident.contactEmailAddress || !this. incident.contactPhoneNumber) {
      this.getFireCentreContacts().subscribe(data => {
        const fc = findFireCentreByName(convertToFireCentreDescription(this.incident.fireCentreName || this.incident.fireCentre || this.incident.fireCentreCode))
        if (!this.incident.contactEmailAddress) this.incident.contactEmailAddress = data[+fc.code].url
        if (!this.incident.contactPhoneNumber) this.incident.contactPhoneNumber = data[+fc.code].phone
        this.cdr.detectChanges()
      });
    }

    const canvas = document.getElementById('qr-code')
    toCanvas(canvas, window.location.href, function (error) {
      if (error) console.error(error)
    })

    this.router.queryParams.subscribe((params: ParamMap) => {
      if(params['preview'])
        this.showWarning =  (this.evacOrders.length > 0 || this.areaRestrictions.length > 0);
    });

    this.fetchPrimaryImage()
  }

  public getStageOfControlLabel (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'Out'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'Out of Control'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'Being Held'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'Under Control'
    else return 'Unknown'
  }

  public getStageOfControlDescription (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'A wildfire that is extinguished. Suppression efforts are complete.'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'A wildfire that is continuing to spread and is not responding to suppression efforts.'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'A wildfire that is not likely to spread beyond predetermined boundaries under current conditions.'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'A wildfire that will not spread any further due to suppression efforts.'
    else return 'Unknown stage of control'
  }

  public getCauseLabel (code: number) {
    if (code === 1) return 'Human'
    else if (code === 2) return 'Lightning / Natural'
    else if (code === 3) return 'Under Investigation'
    else return 'Unknown'
  }

  public getCauseDescription (code: number) {
    if (code === 1) return 'A wildfire started by humans or human activity.'
    else if (code === 2) return 'When lightning strikes an object it can release enough heat to ignite a tree or other fuels.'
    else if (code === 3) return 'A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.'
    else return 'A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.'
  }

  public getResponseTypeDescription (code: string) {
    if (code === 'MONITOR') return 'When a fire is being monitored, this means BC Wildfire Service is observing and analyzing the fire but it\'s not immediately suppressed. It may be allowed to burn to achieve ecological or resource management objectives and is used on remote fires that do not threaten values.'
    else if (code === 'MODIFIED') return 'During a modified response, a wildfire is managed using a combination of techniques with the goal to minimize costs and damage while maximizing ecological benefits from the fire. This response method is used when there is no immediate threat to values.'
    else if (code === 'FULL') return 'The BC Wildfire Service uses a full response when there is threat to public safety and/or property and other values, such as infrastructure or timber. Immediate action is taken. During a full response, a wildfire is suppressed and controlled until it is deemed "out".'
  }

  public printPage() {
    const printContents = document.getElementsByClassName('page-container')[0].innerHTML

    const appRoot = document.body.removeChild(document.getElementById("app-root"));

    document.body.innerHTML = printContents

    const canvas = document.getElementById('qr-code')
    toCanvas(canvas, window.location.href, function (error) {
      if (error) console.error(error)
      window.print()
      document.body.innerHTML = "";
      document.body.appendChild(appRoot);
    })
  }

  public copyToClipboard () {
    navigator.clipboard.writeText(window.location.href);
    this.snackbarService.open('URL Copied to Clipboard!', 'OK', { duration: 100000, panelClass: 'snackbar-success-v2' });
  }

  public fetchPrimaryImage () {
    // By default, check if we have a Video as a primary image first
    // if we dont have a video, check images
    // otherwise, dont show the media box.
    // fetch videos
    this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise().then(results => {
      let setMedia = false
      if (results && results.collection && results.collection.length > 0) {
        for (const uri of results.collection) {
          if (uri.primaryInd && !uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
            this.primaryMedia = {
              title: uri.externalUriDisplayLabel,
              uploadedDate: new Date(uri.createdTimestamp).toLocaleDateString(),
              fileName: '',
              type: 'video',
              href: uri.externalUri
            }
            setMedia = true;
            this.cdr.detectChanges()
            break
          }
        }
      }

      if (!setMedia) {
        // fetch image attachments
        this.publishedIncidentService.fetchPublishedIncidentAttachments(this.incident.incidentNumberLabel).toPromise().then(results => {
          // Loop through the attachments, for each one, create a ref, and set href to the bytes
          if (results && results.collection && results.collection.length > 0) {
            for (const attachment of results.collection) {
              // do a mime type check here
              if (attachment.primary) {
                this.primaryMedia = {
                  title: attachment.attachmentTitle,
                  uploadedDate: new Date(attachment.createdTimestamp).toLocaleDateString(),
                  fileName: attachment.attachmentFileName,
                  type: 'image',
                  href: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes`,
                  thumbnail: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes?thumbnail=true`
                }
                break;
              }
            }
          }
          this.cdr.detectChanges()
        })
      }
    }).catch(err => {
      console.error(err)
    })
  }

  public getFireCentreContacts (): Observable<any> {
    return this.http.get('../../../../assets/data/fire-center-contacts-agol.json')
  }
}
