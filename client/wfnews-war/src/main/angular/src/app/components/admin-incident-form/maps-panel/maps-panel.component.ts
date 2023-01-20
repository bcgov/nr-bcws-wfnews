import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DefaultService as IncidentAttachmentsService, DefaultService as IncidentAttachmentService, AttachmentResource } from '@wf1/incidents-rest-api';
import { BaseComponent } from "../../base/base.component";
import * as moment from 'moment';
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import { ApplicationStateService } from '../../../services/application-state.service';
import { RootState } from '../../../store';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { EditMapDialogComponent } from './edit-map-dialog/edit-map-dialog.component';
import { UploadMapDialogComponent } from './upload-map-dialog/upload-map-dialog.component';
import { DocumentManagementService } from '../../../services/document-management.service';
import { WatchlistService } from '../../../services/watchlist-service';

@Component({
  selector: 'maps-panel',
  templateUrl: './maps-panel.component.html',
  styleUrls: ['./maps-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsPanel extends BaseComponent implements OnInit, OnChanges {
  @Input() public incident

  public searchState = {
    sortParam: 'attachmentTitle',
    sortDirection: 'DESC'
  };
  private loaded = false
  public uploadProgress = 0
  public uploadStatus = ''
  public statusBar

  public columnsToDisplay = ["fileName", "attachmentTitle", "uploadedTimestamp", "edit", "download", "delete"];
  public attachments: AttachmentResource[] = []

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
              protected incidentAttachmentsService: IncidentAttachmentsService,
              protected incidentAttachmentService: IncidentAttachmentService,
              private documentManagementService: DocumentManagementService,
              protected watchlistService: WatchlistService) {
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
      ['INCID_MAP'],
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
      // remove any non-pdf types
      for (const doc of docs.collection) {
        const idx = docs.collection.indexOf(doc)
        if (idx && !doc.mimeType.toLowerCase().includes('pdf')) {
          docs.collection.splice(idx, 1)
        }
      }
      this.attachments = docs.collection
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load Map Attachments: ' + err, 'OK', { duration: 10000, panelClass: 'snackbar-error' });
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

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss')
    }
  }

  upload () {
    const self = this;
    let dialogRef = this.dialog.open(UploadMapDialogComponent, {
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
          self.attachmentCreator(doc.fileId, doc.filePath, result.file.type, 'Perimeter Map', 'INCID_MAP', result.title).then(() => {
            this.snackbarService.open('File Uploaded Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
            this.loadPage()
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
      sourceObjectNameCode: 'INCIDENT',
      fileName: uploadPath,
      attachmentDescription: description,
      attachmentTypeCode: category,
      fileIdentifier: fileId,
      mimeType: mimeType,
      commsSuitable: true,
      attachmentTitle: title
    } as AttachmentResource;

    return this.incidentAttachmentsService.createIncidentAttachment(
      '' + this.incident.wildfireYear,
      '' + this.incident.incidentNumberSequence,
      undefined,
      attachment, 'response').toPromise()
  }

  edit (item: AttachmentResource) {
    let dialogRef = this.dialog.open(EditMapDialogComponent, {
      width: '350px',
      data: {
        attachment: item
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, item.attachmentGuid,undefined, item)
        .toPromise().then(() => {
          this.snackbarService.open('Attachment Updated Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
          this.loaded = false;
        }).catch(err => {
          this.snackbarService.open('Failed to Update Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
          this.loaded = false;
        })
      }
      this.cdr.detectChanges();
    });
  }

  download (item: AttachmentResource) {
    this.documentManagementService.downloadDocument(item.fileIdentifier).toPromise().then(response => {
      const blob = (response as any).body
      if (blob) {
        let fileName = item.attachmentTitle || item.fileName;
        if (!fileName.endsWith('.pdf')) {
          fileName += '.pdf'
        }

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.download = fileName;
        anchor.href = url;
        anchor.click();
        anchor.remove();
      } else {
        throw Error('File could not be found')
      }
    }).catch(err => {
      this.snackbarService.open('Failed to Download Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
    })
  }

  delete (item: AttachmentResource) {
    let dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '350px',
      data: {
          title: 'Are you sure you want to continue?',
          message: 'This will permenantly delete this attachment. This action cannot be undone.',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.incidentAttachmentService.deleteIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, item.attachmentGuid)
        .toPromise().then(() => {
          this.snackbarService.open('Attachment Deleted Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
          this.loaded = false;
          this.cdr.detectChanges();
        }).catch(err => {
          this.snackbarService.open('Failed to Delete Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
          this.loaded = false;
        })
      }
    });
  }
}
