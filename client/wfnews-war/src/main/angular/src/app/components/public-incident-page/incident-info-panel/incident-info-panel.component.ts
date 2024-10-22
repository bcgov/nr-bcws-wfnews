import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CauseOptionDisclaimer } from '@app/components/admin-incident-form/incident-details-panel/incident-details-panel.constants';
import { CapacitorService } from '@app/services/capacitor-service';
import { YouTubeService } from '@app/services/youtube-service';
import { AppConfigService } from '@wf1/core-ui';
import lightGallery from 'lightgallery';
import { toCanvas } from 'qrcode';
import { Observable } from 'rxjs';
import {
  AreaRestrictionsOption,
  EvacOrderOption,
} from '../../../conversion/models';
import { PublishedIncidentService } from '../../../services/published-incident-service';
import {
  ResourcesRoutes,
  convertToDateYear,
  convertToFireCentreDescription,
  convertToYoutubeId,
  findFireCentreByName,
  getResponseTypeDescription,
  getStageOfControlDescription,
  isMobileView
} from '../../../utils';

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentInfoPanelComponent implements AfterViewInit, OnChanges {
  @Input() public incident: any;
  @Input() public evacOrders: EvacOrderOption[] = [];
  @Input() public areaRestrictions: AreaRestrictionsOption[] = [];
  @Output() public tabChangeRequired = new EventEmitter<number>();
  @ViewChild('lightGalleryRef', { static: false }) lightGalleryRef: ElementRef;

  showWarning: boolean;
  public primaryMedia = null;
  public mediaCollection: any[];
  public convertToFireCentreDescription = convertToFireCentreDescription;
  public findFireCentreByName = findFireCentreByName;
  public convertToYoutubeId = convertToYoutubeId;
  public isMobileView = isMobileView;
  getResponseTypeDescription = getResponseTypeDescription;
  convertToDateYear = convertToDateYear;
  getStageOfControlDescription = getStageOfControlDescription;

  public areaRestrictionLink: string;
  desktopEvacOrders = [];
  desktopEvacAlerts = [];

  public constructor(
    private publishedIncidentService: PublishedIncidentService,
    private snackbarService: MatSnackBar,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private http: HttpClient,
    protected route: Router,
    private youtubeService: YouTubeService,
    private capacitorService: CapacitorService
  ) { }

  handleImageFallback(href: string) {
    const imgComponent = document.getElementById('primary-image-container');
    if (imgComponent) {
      (imgComponent as any).src = href;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.evacOrders?.currentValue.length) {
      const evacs = changes.evacOrders.currentValue;
      for (const evac of evacs) {
        if (evac.orderAlertStatus === 'Order') {
          this.desktopEvacOrders.push(evac);
        } else if (evac.orderAlertStatus === 'Alert') {
          this.desktopEvacAlerts.push(evac);
        }
      }
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
      toCanvas(canvas, window.location.href, (error) => {
        if (error) {
          console.error(error);
        }
      });
    }

    this.router.queryParams.subscribe((params: ParamMap) => {
      this.showWarning = params['preview'];
    });

    this.fetchPrimaryImage();
    this.areaRestrictionLink = this.appConfigService.getConfig().externalAppConfig[
      'currentRestrictions'
    ] as unknown as string;
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
    switch (code) {
      case 1:
        return CauseOptionDisclaimer[1];
      case 2:
        return CauseOptionDisclaimer[2];
      case 3:
        return CauseOptionDisclaimer[3];
      default:
        return CauseOptionDisclaimer[0];
    }
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
            .then((attachments) => {
              // Loop through the attachments, for each one, create a ref, and set href to the bytes
              this.mediaCollection = [];
              if (attachments?.collection?.length > 0) {
                for (const attachment of attachments.collection) {

                  // do a mime type check here
                  // Light gallery does not really support direct download on mimetype
                  // image/bmp && image/tiff, which will returns 500 error.
                  if (
                    attachment.mimeType &&
                    [
                      'image/jpg',
                      'image/jpeg',
                      'image/png',
                      'image/gif',
                      'image/bmp',
                      'image/tiff',
                    ].includes(attachment.mimeType.toLowerCase())
                  ) {
                    this.mediaCollection.push({
                      title: attachment.attachmentTitle,
                      uploadedDate: new Date(
                        attachment.createdTimestamp,
                      ).toLocaleDateString(),
                      fileName: attachment.attachmentFileName,
                      type: 'image',
                      href: `${this.appConfigService.getConfig().rest['wfnews']
                        }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
                        }/attachments/${attachment.attachmentGuid}/bytes`,
                      thumbnail: `${this.appConfigService.getConfig().rest['wfnews']
                        }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
                        }/attachments/${attachment.attachmentGuid
                        }/bytes?thumbnail=true`,
                      loaded: false,
                    });
                  }

                  // do a mime type check here
                  if (attachment.primary && !this.primaryMedia) {
                    this.primaryMedia = {
                      title: attachment.attachmentTitle,
                      uploadedDate: new Date(
                        attachment.createdTimestamp,
                      ).toLocaleDateString(),
                      fileName: attachment.attachmentFileName,
                      type: 'image',
                      href: `${this.appConfigService.getConfig().rest['wfnews']
                        }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
                        }/attachments/${attachment.attachmentGuid}/bytes`,
                      thumbnail: `${this.appConfigService.getConfig().rest['wfnews']
                        }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
                        }/attachments/${attachment.attachmentGuid
                        }/bytes?thumbnail=true`,
                    };
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

  navigateToMap() {
    if (this.incident) {
      setTimeout(() => {
        this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude: this.incident.longitude,
            latitude: this.incident.latitude,
            activeWildfires: true
          },
        });
      }, 200);
    }
  }

  navigateToEvac(event) {
    if (event?.externalUri) {
      let uri = event.uri;
      if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
        uri = 'https://' + uri;
      }
      this.capacitorService.redirect(uri);
    } else {
      const url = this.route.serializeUrl(
        this.route.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
          queryParams: {
            eventType: event.orderAlertStatus,
            eventNumber: event.eventNumber,
            id: event.emrgOAAsysID,
            eventName: event.eventName,
            source: [ResourcesRoutes.PUBLIC_INCIDENT],
            fireYear: this.incident.fireYear,
            incidentNumber: this.incident.incidentNumberLabel
          },
        }),
      );
      this.capacitorService.redirect(url, true);
    }
  }

  navigateToAreaRestriction(event) {
    const url = this.route.serializeUrl(
      this.route.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'area-restriction',
          eventNumber: event.protRsSysID,
          eventName: event.name,
          source: [ResourcesRoutes.PUBLIC_INCIDENT],
          fireYear: this.incident.fireYear,
          incidentNumber: this.incident.incidentNumberLabel
        },
      }),
    );
    this.capacitorService.redirect(url, true);
  }

  emailFireCentre(recipientEmail: string) {
    const mailtoUrl = `mailto:${recipientEmail}`;
    window.location.href = mailtoUrl;
  }

  openAllPhotos() {
    const gallery = lightGallery(this.lightGalleryRef.nativeElement, {
      dynamic: true,
      dynamicEl: this.mediaCollection.map(item => ({
        src: item.href,
        thumb: item.thumbnail,
        subHtml: `<h4>${item.title}</h4><p>${item.uploadedDate}</p>`,
      })),
      thumbnail: true, // Ensure thumbnails are enabled in dynamic mode
    });

    gallery.openGallery();
  }

  sendToGalleryTab() {
    this.tabChangeRequired.emit(2);
  }
}
