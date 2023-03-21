import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DefaultService as ExternalUriService, DefaultService as IncidentAttachmentsService, DefaultService as IncidentAttachmentService, AttachmentResource } from '@wf1/incidents-rest-api';
import { BaseComponent } from "../../base/base.component";
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService,  TokenService} from '@wf1/core-ui';
import { ApplicationStateService } from '../../../services/application-state.service';
import { RootState } from '../../../store';
import { UploadImageDialogComponent } from './upload-image-dialog/upload-image-dialog.component';
import { DocumentManagementService } from '../../../services/document-management.service';
import { WatchlistService } from '../../../services/watchlist-service';

@Component({
  selector: 'image-gallery-panel',
  templateUrl: './image-gallery-panel.component.html',
  styleUrls: ['./image-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageGalleryPanel extends BaseComponent implements OnInit, OnChanges {
  @Input() public incident

  public searchState = {
    sortParam: 'attachmentTitle',
    sortDirection: 'DESC'
  };
  private loaded = false
  public uploadProgress = 0
  public uploadStatus = ''
  public statusBar

  public attachments: AttachmentResource[] = []
  public externalUriList: any[] = []

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
              protected watchlistService: WatchlistService,
              protected incidentAttachmentsService: IncidentAttachmentsService,
              protected incidentAttachmentService: IncidentAttachmentService,
              private externalUriService: ExternalUriService,
              private documentManagementService: DocumentManagementService) {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, watchlistService);
  }

  ngOnInit() {
    if (this.incident) {
      this.loadPage();
    }
  }

  loadPage() {
    // this gets all INFO attachments. Because we dont have a proper
    // filter for PDF maps at the moment, this means no paging as we'll
    // have to manually filter.
    this.incidentAttachmentsService.getIncidentAttachmentList(
      '' + this.incident.wildfireYear,
      '' + this.incident.incidentNumberSequence,
      undefined,
      'false',
      'false',
      undefined,
      ['INFO'],
      undefined,
      undefined,
      undefined,
      undefined,
      '1000',
      this.searchState.sortParam + ',' + this.searchState.sortDirection,
      'body'
    ).toPromise().then( ( docs ) => {
      docs.collection.sort((a, b) => {
        const dir = this.searchState.sortDirection === 'desc' ? -1 : 1
        if(a[this.searchState.sortParam] < b[this.searchState.sortParam]) return -dir;
        else if(a[this.searchState.sortParam] > b[this.searchState.sortParam]) return dir;
        else return 0;
      })
      // remove any non-image types
      for (const doc of docs.collection) {
        const idx = docs.collection.indexOf(doc)
        if (idx && !['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'].includes(doc.mimeType.toLowerCase())) {
          docs.collection.splice(idx, 1)
        }
      }
      this.attachments = docs.collection
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load Image Attachments: ' + err, 'OK', { duration: 10000, panelClass: 'snackbar-error' });
    })

    this.externalUriService.getExternalUriList('' + this.incident.wildfireIncidentGuid, '' + 1, '' + 100, 'response', undefined, undefined)
    .toPromise().then((response) => {
      this.externalUriList = []
      const uris = response.body
      for (const uri of uris.collection) {
        if (uri.externalUriCategoryTag.includes('video') && uri.primaryInd === true) {
          this.externalUriList.push(uri)
        }
      }
      this.cdr.detectChanges()
    }).catch(err => {
      console.error('Failed to sync video URLs')
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
    let dialogRef = this.dialog.open(UploadImageDialogComponent, {
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.file) {
        // upload to WFDM
        //self.documentManagementService.makeDocumentUrl()
        self.uploadFile(result.file, ( percent, loaded, total ) => {
          self.uploadProgress = percent
          self.uploadStatus = `Uploaded ${ Math.floor(loaded / 1048576) }mb of ${ Math.floor(loaded / 1048576) }mb`
          if (!self.statusBar) {
            self.statusBar = this.snackbarService.open(self.uploadStatus, 'OK', { duration: 10000, panelClass: 'snackbar-success' });
          } else {
            (self.statusBar as MatSnackBarRef<TextOnlySnackBar>).instance.data.message = self.uploadStatus
          }
        }).then(doc => {
          self.attachmentCreator(doc.fileId, doc.filePath, result.file.type, 'Incident Photo', 'INFO', result.title).then(() => {
            this.snackbarService.open('File Uploaded Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
            this.loadPage();
          }).catch(err => {
            this.snackbarService.open('Failed to Upload Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
          }).finally(() => {
            self.loaded = false;
            this.cdr.detectChanges();
          })
        }).catch(err => {
          this.snackbarService.open('Failed to Upload Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
        })
      }
    });
  }

  uploadFile( file: File, progressCallback: ( percent: number, loaded: number, total: number ) => void ): Promise<any> {
    return this.documentManagementService.uploadDocument( {
        file: file,
        onProgress: progressCallback
    } )
  }

  attachmentCreator (fileId: string, uploadPath: string, mimeType: string, description: string, category: string, title: string) {
    const attachment = {
      '@type': 'http://wfim.nrs.gov.bc.ca/v1/attachment',
      type: 'http://wfim.nrs.gov.bc.ca/v1/attachment',
      sourceObjectNameCode: 'INCIDENT PHOTO',
      fileName: uploadPath,
      attachmentDescription: description,
      attachmentTypeCode: category,
      fileIdentifier: fileId,
      mimeType: mimeType,
      sourceObjectUniqueId: '' + this.incident.wildfireIncidentGuid,
      archived: false,
      privateIndicator: false,
      commsSuitable: true,
      attachmentTitle: title
    } as AttachmentResource;

    return this.incidentAttachmentsService.createIncidentAttachment(
      '' + this.incident.wildfireYear,
      '' + this.incident.incidentNumberSequence,
      undefined,
      attachment, 'response').toPromise()
  }

  /**
   * This should be moved into the IM API
   */
  async removePrimaryFlags (guid: string) {
    for (const attachment of this.attachments) {
      const isPrimary = (attachment as any).primaryInd as Boolean
      if (isPrimary && attachment.attachmentGuid !== (guid as any).event) {
        (attachment as any).primaryInd = false
        await this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, attachment.attachmentGuid, undefined, attachment)
        .toPromise().catch(err => {
          // Ignore this
          console.error(err)
        })
      }
    }

    for (const videoLink of this.externalUriList) {
      if (videoLink.primaryInd === true) {
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
