import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IncidentAttachmentsService, IncidentAttachmentService, AttachmentResource } from '@wf1/incidents-rest-api';
import {BaseComponent} from "../../base/base.component";
import * as moment from 'moment';
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TokenService, AppConfigService } from '@wf1/core-ui';
import { ApplicationStateService } from '../../../services/application-state.service';
import { RootState } from '../../../store';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { EditMapDialogComponent } from './edit-map-dialog/edit-map-dialog.component';
import { UploadMapDialogComponent } from './upload-map-dialog/upload-map-dialog.component';
import { DocumentManagementService } from '../../../services/document-management.service';

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
              private documentManagementService: DocumentManagementService,) {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http);
  }

  ngOnInit() {
    if (this.incident) {
      this.loadPage();
    }
  }

  loadPage() {
    // this gets all attachments. We'll want a filter for just the PDF maps
    this.incidentAttachmentsService.getIncidentAttachmentList(
      '' + this.incident.wildfireYear,
      '' + this.incident.incidentNumberSequence,
      'false',
      'false',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1000',
      this.searchState.sortParam + ',' + this.searchState.sortDirection,
      undefined,
      'body'
    ).toPromise().then( ( docs ) => {
      docs.collection.sort((a, b) => {
        const dir = this.searchState.sortDirection === 'desc' ? -1 : 1
        if(a[this.searchState.sortParam] < b[this.searchState.sortParam]) return -dir;
        else if(a[this.searchState.sortParam] > b[this.searchState.sortParam]) return dir;
        else return 0;
      })
      this.attachments = docs.collection
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load Map Attachments: ' + err, 'OK', { duration: 0, panelClass: 'snackbar-error' });
    })
  }

  ngOnchanges(changes: SimpleChanges) {
    if (this.incident) {
      this.loadPage();
    }
  }

  ngDoCheck() {
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
        console.log(result);

        setTimeout( () => {

        }, 1000 )

        // upload to WFDM
        //self.documentManagementService.makeDocumentUrl()
        self.uploadFile(result.file, ( percent, loaded, total ) => {
          self.uploadProgress = percent
          self.uploadStatus = `Uploaded ${ Math.floor(loaded / 1048576) }mb of ${ Math.floor(loaded / 1048576) }mb`
          if (!self.statusBar) {
            self.statusBar = this.snackbarService.open(self.uploadStatus, 'OK', { duration: 0, panelClass: 'snackbar-success' });
          } else {
            (self.statusBar as MatSnackBarRef<TextOnlySnackBar>).instance.data.message = self.uploadStatus
          }
        }).then(doc => {
          self.attachmentCreator(doc.fileId, doc.filePath, result.file.mimeType, 'Perimeter Map', 'INFORMATION').then(() => {
            this.snackbarService.open('File Uploaded Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
          }).catch(err => {
            this.snackbarService.open('Failed to Upload Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
          }).finally(() => {
            self.loaded = false;
            this.cdr.detectChanges();
          })
        }).catch(err => {
          this.snackbarService.open('Failed to Upload Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
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

  attachmentCreator (fileId: string, uploadPath: string, mimeType: string, description: string, category: string) {
    const attachment = {
      '@type': 'http://wfim.nrs.gov.bc.ca/v1/attachment',
      type: 'http://wfim.nrs.gov.bc.ca/v1/attachment',

      sourceObjectNameCode: 'INCIDENT',
      fileName: uploadPath,
      attachmentDescription: description,
      attachmentTypeCode: category,
      fileIdentifier: fileId,
      mimeType: mimeType
    } as AttachmentResource;

    return this.incidentAttachmentsService.createIncidentAttachment(
      '' + this.incident.wildfireYear,
      '' + this.incident.incidentNumberSequence,
      attachment, undefined, 'response').toPromise()
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
        this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, item.attachmentGuid, item)
        .toPromise().then(() => {
          this.snackbarService.open('Attachment Updated Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
          this.loaded = false;
        }).catch(err => {
          this.snackbarService.open('Failed to Update Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
          this.loaded = false;
        })
      }
      this.cdr.detectChanges();
    });
  }

  download (item: AttachmentResource) {
    // this is a call to WFDM with the File ID
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
          this.snackbarService.open('Attachment Deleted Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
          this.loaded = false;
          this.cdr.detectChanges();
        }).catch(err => {
          this.snackbarService.open('Failed to Delete Attachment: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
          this.loaded = false;
        })
      }
    });
  }
}
