import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DefaultService as ExternalUriService, DefaultService as  IncidentAttachmentService, ExternalUriResource } from '@wf1/incidents-rest-api';
import { BaseComponent } from "../../base/base.component";
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TokenService, AppConfigService } from '@wf1/core-ui';
import { ApplicationStateService } from '../../../services/application-state.service';
import { RootState } from '../../../store';
import { UploadVideoDialogComponent } from './upload-video-dialog/upload-video-dialog.component';
import { WatchlistService } from '../../../services/watchlist-service';
import { PagedCollection } from '../../../conversion/models';

@Component({
  selector: 'video-gallery-panel',
  templateUrl: './video-gallery-panel.component.html',
  styleUrls: ['./video-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoGalleryPanel extends BaseComponent implements OnInit, OnChanges {
  @Input() public incident

  public searchState = {
    sortParam: 'attachmentTitle',
    sortDirection: 'DESC'
  };
  private loaded = false
  public uploadProgress = 0
  public uploadStatus = ''
  public statusBar;
  public pageNumber = 1;
  public pageRowCount = 20;


  public attachments: any[] = [];
  public externalUriList: PagedCollection = {
    pageNumber: 1,
    pageRowCount: 20,
    totalRowCount: null,
    totalPageCount: null,
    collection: []
  };

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              protected sanitizer: DomSanitizer,
              protected store: Store<RootState>,
              protected fb: FormBuilder,
              protected dialog: MatDialog,
              protected applicationStateService: ApplicationStateService,
              protected tokenService: TokenService,
              protected snackbarService: MatSnackBar,
              protected overlay: Overlay,
              protected cdr: ChangeDetectorRef,
              protected appConfigService: AppConfigService,
              protected http: HttpClient,
              protected externalUriService: ExternalUriService,
              protected incidentAttachmentService: IncidentAttachmentService,
              private watchListServce: WatchlistService,

              ) {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, watchListServce);
  }

  ngOnInit() {
    if (this.incident) {
      this.loadPage();
    }
  }

  loadPage() {
    this.externalUriService.getExternalUriList(
      '' + this.incident.wildfireIncidentGuid,
      '' + 1,
      '' + 100,
      'response',
      undefined,
      undefined
    ).toPromise().then( (response) => {
      this.externalUriList.collection = []
      const uris = response.body;
      for (const uri of uris.collection) {
        if (uri.externalUriCategoryTag.includes('video')) {
          this.externalUriList.collection.push(uri)
        }
      }
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load videos links: ' + err, 'OK', { duration: 0, panelClass: 'snackbar-error' });
    })

    this.incidentAttachmentService.getIncidentAttachmentList('' + this.incident.wildfireYear, '' + this.incident.incidentNumberSequence, undefined, 'false', 'false', undefined, ['INFO'], undefined, undefined, undefined, undefined, '1000', this.searchState.sortParam + ',' + this.searchState.sortDirection, 'body')
    .toPromise().then((docs) => {
      docs.collection.sort((a, b) => {
        const dir = this.searchState.sortDirection === 'desc' ? -1 : 1
        if(a[this.searchState.sortParam] < b[this.searchState.sortParam]) return -dir;
        else if(a[this.searchState.sortParam] > b[this.searchState.sortParam]) return dir;
        else return 0;
      })
      // remove any non-image types
      for (const doc of docs.collection) {
        const idx = docs.collection.indexOf(doc)
        if (!(doc as any).primaryInd && idx && !['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'].includes(doc.mimeType.toLowerCase())) {
          docs.collection.splice(idx, 1)
        }
      }
      this.attachments = docs.collection
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Failed to sync with Primary Images')
    })
  }

  ngOnchanges(changes: SimpleChanges) {
    this.updateTable();
  }

  ngDoCheck() {
    this.updateTable();
  }

  updateTable () {
    if (!this.loaded && this.incident) {
      this.loadPage();
      this.loaded = true
    }
  }

  sortData(event) {
    this.loaded = false
    this.searchState.sortParam = event.active
    this.searchState.sortDirection = event.direction
    this.loadPage();
  }

  upload () {
    const self = this;
    let dialogRef = this.dialog.open(UploadVideoDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.title && result.url) {
        self.uploadVideoLink (result.title, result.url).then(() => {
          this.snackbarService.open('Video Added Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
          this.loadPage()
        }).catch(err => {
          this.snackbarService.open('Failed to Added Video: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
        }).finally(() => {
          self.loaded = false;
          this.cdr.detectChanges();
        })
      }

    });
  }

  uploadVideoLink( title: string, url: string) {
    if(!this.matchYoutubeUrl(url)){
      this.snackbarService.open('This is not a youtube link', 'OK', { duration: 0, panelClass: 'snackbar-error' });
    }
    else{
      const resource = {
        externalUriDisplayLabel: title,
        externalUri: url,
        publishedInd: false,
        privateInd: false,
        archivedInd: false,
        primaryInd: false,
        externalUriCategoryTag: 'video',
        sourceObjectNameCode: 'INCIDENT',
        sourceObjectUniqueId: '' + this.incident.wildfireIncidentGuid,
        '@type': 'http://wfim.nrs.gov.bc.ca/v1/externalUri',
        type: 'http://wfim.nrs.gov.bc.ca/v1/externalUri'
      } as ExternalUriResource;

      return this.externalUriService.createExternalUri(
        resource,
        'response'
       ).toPromise()
      }
    }

    matchYoutubeUrl(url) {
      const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      if(url.match(p)){
          return url.match(p)[1];
      }
      else{
        return false;
      }
    }

  /**
   * This should be moved into the IM API
   */
    async removePrimaryFlags (guid: string) {
      for (const attachment of this.attachments) {
        const isPrimary = (attachment as any).primaryInd as Boolean
        if (isPrimary) {
          (attachment as any).primaryInd = false
          await this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, attachment.attachmentGuid, undefined, attachment)
          .toPromise().catch(err => {
            // Ignore this
            console.error(err)
          })
        }
      }

      for (const videoLink of this.externalUriList.collection) {
        if (videoLink.primaryInd && videoLink.externalUriGuid !== (guid as any).event) {
          videoLink.primaryInd = false
          await this.externalUriService.updateExternalUri(videoLink.externalUriGuid, videoLink)
          .toPromise().catch(err => {
            // Ignore this
            console.error(err)
          })
        }
      }

      this.loadPage()
    }
}
