import { Component, ChangeDetectionStrategy, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from "@angular/common/http";

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

  downloadableMaps: DownloadableMap[];

  constructor(private snackbarService: MatSnackBar,
              private httpClient: HttpClient) {
    
  }

  ngOnInit() {
    this.downloadableMaps = [
      {
        name: "Akokli Creek Active Evacuation Areas", link: "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK", date: "June 24, 2022"
      },
      {
        name: "Akokli Creek Active Evacuation Areas", link: "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK", date: "June 24, 2022"
      },
      {
        name: "Akokli Creek Active Evacuation Areas", link: "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK", date: "June 24, 2022"
      },
      {
        name: "Akokli Creek Active Evacuation Areas", link: "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK", date: "June 24, 2022"
      },
      {
        name: "Akokli Creek Active Evacuation Areas", link: "https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK", date: "June 24, 2022"
      }
    ];

    this.loadMaps();
  }

  loadMaps() {
   
  }

  downloadMap(mapLink) {
    // Need to replace this code with real call to API to get valid attachments/maps
    const url = mapLink;
    let request = this.httpClient.request( new HttpRequest( 'GET', url, {
        reportProgress: true,
        responseType: 'blob'
    }));

    request.subscribe(
      ( ev ) => {
          if ( ev.type == HttpEventType.Sent ) {
            this.snackbarService.open('Generating PDF. Please wait...', 'Close', { duration: 2000, panelClass: 'snackbar-warning' });
          }
          else if ( ev instanceof HttpResponse ) {
            this.downloadFile(ev as HttpResponse<Blob>);
            this.snackbarService.open('PDF downloaded successfully.', 'Close', { duration: 500000, panelClass: 'snackbar-success' });
          }
      },
      ( err ) => console.log(err)
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
