import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IncidentAttachmentsService, IncidentAttachmentService, AttachmentResource } from '@wf1/incidents-rest-api';
import {BaseComponent} from "../../base/base.component";
import * as moment from 'moment';
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
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { EditMapDialogComponent } from './edit-map-dialog/edit-map-dialog.component';
import { UploadMapDialogComponent } from './upload-map-dialog/upload-map-dialog.component';

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
              protected incidentAttachmentService: IncidentAttachmentService) {
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
      console.log(this.attachments)
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load Map Attachments: ' + err, 'OK', { duration: 0, panelClass: 'snackbar-error' });
    })
  }

  ngAfterViewInit() {
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
    let dialogRef = this.dialog.open(UploadMapDialogComponent, {
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        // just refresh after attachment create?
      }
      this.cdr.detectChanges();
    });
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
