import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from "@angular/common/http";
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { AppConfigService } from "@wf1/core-ui";

export class DownloadableMap {
  name :string;
  link :string;
  date :string;
}

@Component({
  selector: 'incident-maps-panel',
  templateUrl: './incident-maps-panel.component.html',
  styleUrls: ['./incident-maps-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentMapsPanel implements OnInit {
  @Input() public incident;

  maps: DownloadableMap[];

  constructor(private snackbarService: MatSnackBar,
              private httpClient: HttpClient,
              private publishedIncidentService: PublishedIncidentService,
              private appConfigService: AppConfigService,
              protected cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    const self = this;
    this.loadMaps().then(docs => {
      self.maps = docs.map(doc => {
        return { name: doc.attachmentTitle,
          link: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${self.incident.incidentNumberLabel}/attachments/${doc.attachmentGuid}/bytes`,
          date: new Date(doc.createdTimestamp).toDateString()
        };
      });
      this.cdr.detectChanges();
    });
  }

  loadMaps(): Promise<any> {
    return this.publishedIncidentService.fetchPublishedIncidentAttachments(this.incident.incidentName).toPromise()
      .then( ( docs ) => {
        // remove any non-image types
        const data = []
        for (const doc of docs.collection) {
          const idx = docs.collection.indexOf(doc)
          if (!doc.imageURL.toLowerCase().endsWith('.pdf')) { //|| (doc.mimeType && idx && !['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'].includes(doc.mimeType.toLowerCase()))) {
            docs.collection.splice(idx, 1);
          } else {
            data.push(doc)
          }
        }
        return data;
      }).catch(err => {
        this.snackbarService.open('Failed to load Map Attachments: ' + err, 'OK', { duration: 10000, panelClass: 'snackbar-error' });
    })
  }

  downloadMap(mapLink) {
    const url = mapLink;
    let request = this.httpClient.request( new HttpRequest( 'GET', url, {
        reportProgress: true,
        responseType: 'blob'
    }));

    request.subscribe(
      ( ev ) => {
          if ( ev.type == HttpEventType.Sent ) {
            this.snackbarService.open('Generating PDF. Please wait...', 'Close', { duration: 10000, panelClass: 'snackbar-info' });
          }
          else if ( ev instanceof HttpResponse ) {
            this.downloadFile(ev as HttpResponse<Blob>);
            this.snackbarService.open('PDF downloaded successfully.', 'Close', { duration: 10000, panelClass: 'snackbar-success-v2' });
          }
      },
      ( err ) => this.snackbarService.open('PDF downloaded failed.', 'Close', { duration: 10000, panelClass: 'snackbar-error' })
    )
  }

  downloadFile (data: HttpResponse<Blob>) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = "test.pdf";
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }
}
