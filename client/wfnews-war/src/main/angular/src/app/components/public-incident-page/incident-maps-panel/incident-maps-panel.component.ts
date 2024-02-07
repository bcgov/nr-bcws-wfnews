import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  HttpClient,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { PublishedIncidentService } from '../../../services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CapacitorHttp } from '@capacitor/core';
import { CapacitorService } from '@app/services/capacitor-service';

export class DownloadableMap {
  name: string;
  link: string;
  date: string;
}

@Component({
  selector: 'incident-maps-panel',
  templateUrl: './incident-maps-panel.component.html',
  styleUrls: ['./incident-maps-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentMapsPanel implements OnInit {
  @Input() public incident;
  @Input() public showMapsWarning;

  maps: DownloadableMap[];
  isPreview: boolean;

  constructor(
    private snackbarService: MatSnackBar,
    private httpClient: HttpClient,
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    protected cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private capacitorService: CapacitorService
  ) { }

  ngOnInit() {
    const self = this;
    this.loadMaps().then((docs) => {
      self.maps = docs.map((doc) => ({
        name: doc.attachmentTitle,
        link: `${this.appConfigService.getConfig().rest['wfnews']
          }/publicPublishedIncidentAttachment/${self.incident.incidentNumberLabel
          }/attachments/${doc.attachmentGuid}/bytes`,
        date: new Date(doc.createdTimestamp).toDateString(),
      }));
      this.cdr.detectChanges();
    });

    this.router.queryParams.subscribe((params: ParamMap) => {
      if (params && params['preview']) {
        this.isPreview = true;
      }
    });
  }

  loadMaps(): Promise<any> {
    return this.publishedIncidentService
      .fetchAttachments(this.incident.incidentNumberLabel)
      .toPromise()
      .then((docs) => {
        // remove any non-image types
        const data = [];
        for (const doc of docs.collection) {
          if (
            doc.mimeType &&
            [
              'image/jpg',
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/bmp',
              'image/tiff',
            ].includes(doc.mimeType.toLowerCase())
          ) {
            // splice is not longer needed here as we return a new object
          } else {
            data.push(doc);
          }
        }
        return data;
      })
      .catch((err) => {
        this.snackbarService.open(
          'Failed to load Map Attachments: ' + err,
          'OK',
          { duration: 10000, panelClass: 'snackbar-error' },
        );
      });
  }

  downloadMap(mapLink, fileName) {
    const request = this.generateMapRequest(mapLink)
    this.fetchMapResponse(request, fileName)
  }

  generateMapRequest(mapLink) {
    const url = mapLink;
    let isMobile = false;

    this.capacitorService.isMobile.then(response => {
      isMobile = response;
    });

    if (isMobile) {
      const options = {
        url,
        params: null   
      };
      const resp = CapacitorHttp.request(options);
      return resp;
    } else {
      const resp = this.httpClient.request(
        new HttpRequest('GET', url, {
          reportProgress: true,
          responseType: 'blob',
        }),
      );
      return resp;
    }
  }

  fetchMapResponse(request, fileName) {
    request.subscribe(
      (ev) => {
        if (ev.type === HttpEventType.Sent) {
          this.snackbarService.open('Generating PDF. Please wait...', 'Close', {
            duration: 10000,
            panelClass: 'snackbar-info',
          });
        } else if (ev instanceof HttpResponse) {
          this.downloadFile(ev as HttpResponse<Blob>, fileName);
          this.snackbarService.open('PDF downloaded successfully.', 'Close', {
            duration: 10000,
            panelClass: 'snackbar-success-v2',
          });
        }
      },
      (err) =>{
        this.snackbarService.open('PDF downloaded failed.', 'Close', {
          duration: 10000,
          panelClass: 'snackbar-error',
        })}
      );
  }

  downloadFile(data: HttpResponse<Blob>, fileName: string) {
    if (!fileName.endsWith('.pdf')) {
      fileName += '.pdf';
    }

    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = fileName;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }
}
