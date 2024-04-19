import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  AreaRestrictionsOption,
  EvacOrderOption,
} from '../../../conversion/models';
import { toCanvas } from 'qrcode';
import {
  convertToFireCentreDescription,
  findFireCentreByName,
  convertToYoutubeId,
  isMobileView,
  getResponseTypeDescription
} from '../../../utils';
import { PublishedIncidentService } from '../../../services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { YouTubeService } from '@app/services/youtube-service';

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentInfoPanel implements AfterViewInit {
  @Input() public incident: any;
  @Input() public evacOrders: EvacOrderOption[] = [];
  @Input() public areaRestrictions: AreaRestrictionsOption[] = [];

  showWarning: boolean;
  public primaryMedia = null;
  public convertToFireCentreDescription = convertToFireCentreDescription;
  public findFireCentreByName = findFireCentreByName;
  public convertToYoutubeId = convertToYoutubeId;
  public isMobileView = isMobileView;
  getResponseTypeDescription = getResponseTypeDescription;

  public constructor(
    private publishedIncidentService: PublishedIncidentService,
    private snackbarService: MatSnackBar,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private http: HttpClient,
    protected route: Router,
    private youtubeService: YouTubeService
  ) {}

  handleImageFallback(href: string) {
    const imgComponent = document.getElementById('primary-image-container');
    if (imgComponent) {
      (imgComponent as any).src = href;
    }
  }

  ngAfterViewInit(): void {
    if (
      !this.incident.contactEmailAddress ||
      !this.incident.contactPhoneNumber
    ) {
      this.getFireCentreContacts().subscribe((data) => {
        const fc = findFireCentreByName(
          convertToFireCentreDescription(
            this.incident.fireCentreName ||
              this.incident.fireCentre ||
              this.incident.fireCentreCode,
          ),
        );
        if (!this.incident.contactEmailAddress) {
this.incident.contactEmailAddress = data[+fc.code].url;
}
        if (!this.incident.contactPhoneNumber) {
this.incident.contactPhoneNumber = data[+fc.code].phone;
}
        this.cdr.detectChanges();
      });
    }

    const canvas = document.getElementById('qr-code');
    if (canvas) {
      toCanvas(canvas, window.location.href, function(error) {
        if (error) {
console.error(error);
}
      });
    }

    this.router.queryParams.subscribe((params: ParamMap) => {
      this.showWarning = params['preview'];
    });

    this.fetchPrimaryImage();
  }

  public getStageOfControlLabel(code: string) {
    if (code.toUpperCase().trim() === 'OUT') {
return 'Out';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'Out of Control';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'Being Held';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'Under Control';
} else {
return 'Unknown';
}
  }

  public getStageOfControlDescription(code: string) {
    if (code.toUpperCase().trim() === 'OUT') {
return 'The wildfire has been extinguished or winter conditions are present, and the Wildfire will not spread.';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'A wildfire that is spreading or it is anticipated to spread beyond the current perimeter, or control line.';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'A wildfire that is projected, based on fuel and weather conditions and resource availability, to remain within the current perimeter, control line or boundary.';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'A wildfire that is not projected to spread beyond the current perimeter.';
} else {
return 'Unknown stage of control';
}
  }

  public getCauseLabel(code: number) {
    if (code === 1) {
return 'Human';
} else if (code === 2) {
return 'Lightning';
} else if (code === 3) {
return 'Under Investigation';
} else {
return 'Unknown';
}
  }

  public getCauseDescription(code: number) {
    if (code === 1) {
return 'A wildfire started by humans or human activity.';
} else if (code === 2) {
return 'This fire was caused by a dry lightning strike which means it occurred without rain nearby. The cause of a wildfire is determined by professional investigations in accordance with international standards. Wildfire investigations can be complex and may take weeks or even months to complete.';
} else {
return 'A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.';
}
  }

  public printPage() {
    const printContents =
      document.getElementsByClassName('page-container')[0].innerHTML;

    const appRoot = document.body.removeChild(
      document.getElementById('app-root'),
    );

    document.body.innerHTML = printContents;

    const canvas = document.getElementById('qr-code');
    toCanvas(canvas, window.location.href, function(error) {
      if (error) {
console.error(error);
}
      window.print();
      document.body.innerHTML = '';
      document.body.appendChild(appRoot);
    });
  }

  public copyToClipboard() {
    navigator.clipboard.writeText(window.location.href);
    this.snackbarService.open('URL Copied to Clipboard!', 'OK', {
      duration: 100000,
      panelClass: 'snackbar-success-v2',
    });
  }

  public fetchPrimaryImage() {
    // By default, check if we have a Video as a primary image first
    // if we dont have a video, check images
    // otherwise, dont show the media box.
    // fetch videos
    this.publishedIncidentService
      .fetchExternalUri(this.incident.incidentNumberLabel)
      .toPromise()
      .then((results) => {
        let setMedia = false;
        if (results?.collection?.length > 0) {
          for (const uri of results.collection) {
            if (
              uri.primaryInd &&
              !uri.externalUriCategoryTag.includes('EVAC-ORDER')
            ) {
              this.primaryMedia = {
                title: uri.externalUriDisplayLabel,
                uploadedDate: new Date(
                  uri.createdTimestamp,
                ).toLocaleDateString(),
                fileName: '',
                type: 'video',
                href: this.youtubeService.sanitizeYoutubeUrl(uri.externalUri),
              };
              setMedia = true;
              this.cdr.detectChanges();
              break;
            }
          }
        }

        if (!setMedia) {
          // fetch image attachments
          this.publishedIncidentService
            .fetchPublishedIncidentAttachments(
              this.incident.incidentNumberLabel
                ? this.incident.incidentNumberLabel
                : this.incident.incidentNumberLabelFull,
            )
            .toPromise()
            .then((results) => {
              // Loop through the attachments, for each one, create a ref, and set href to the bytes
              if (results?.collection?.length > 0) {
                for (const attachment of results.collection) {
                  // do a mime type check here
                  if (attachment.primary) {
                    this.primaryMedia = {
                      title: attachment.attachmentTitle,
                      uploadedDate: new Date(
                        attachment.createdTimestamp,
                      ).toLocaleDateString(),
                      fileName: attachment.attachmentFileName,
                      type: 'image',
                      href: `${
                        this.appConfigService.getConfig().rest['wfnews']
                      }/publicPublishedIncidentAttachment/${
                        this.incident.incidentNumberLabel
                      }/attachments/${attachment.attachmentGuid}/bytes`,
                      thumbnail: `${
                        this.appConfigService.getConfig().rest['wfnews']
                      }/publicPublishedIncidentAttachment/${
                        this.incident.incidentNumberLabel
                      }/attachments/${
                        attachment.attachmentGuid
                      }/bytes?thumbnail=true`,
                    };
                    break;
                  }
                }
              }
              this.cdr.detectChanges();
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  public getFireCentreContacts(): Observable<any> {
    return this.http.get(
      '../../../../assets/data/fire-center-contacts-agol.json',
    );
  }
}
