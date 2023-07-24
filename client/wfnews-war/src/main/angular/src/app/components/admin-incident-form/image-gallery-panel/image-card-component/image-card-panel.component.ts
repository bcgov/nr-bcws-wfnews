import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';
import { DocumentManagementService } from '../../../../services/document-management.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { DefaultService as IncidentAttachmentService } from '@wf1/incidents-rest-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditImageDialogComponent } from '../edit-image-dialog/edit-image-dialog.component';

@Component({
  selector: 'image-card-panel',
  templateUrl: './image-card-panel.component.html',
  styleUrls: ['./image-card-panel.component.scss']
})
export class ImageCardPanel implements OnInit, OnChanges {
  @Input() public incident
  @Input() public attachment: AttachmentResource
  @Output('loadPage') loadPage: EventEmitter<any> = new EventEmitter();
  @Output('removePrimaryFlags') removePrimaryFlags: EventEmitter<any> = new EventEmitter();


  public imageSrc = null;
  public loaded = false;

  constructor (private documentManagementService: DocumentManagementService,
               protected incidentAttachmentService: IncidentAttachmentService,
               protected snackbarService: MatSnackBar,
               protected dialog: MatDialog,
               private sanitizer: DomSanitizer,
               protected cdr: ChangeDetectorRef) { /* Empty */}

  changePrimary () {
    try {
      (this.attachment as any).primaryInd = !(this.attachment as any).primaryInd;
    } catch (err) {
      (this.attachment as any).primaryInd = true;
    }

    if ((this.attachment as any).primaryInd) {
      this.removeFlags(this.attachment.attachmentGuid);
      // safety catch
      (this.attachment as any).primaryInd = true
    }

    this.updateIncidentAttachment();
  }

  get isPrimary () {
    if (!Object.prototype.hasOwnProperty.call(this.attachment, 'primaryInd')) {
      (this.attachment as any).primaryInd = false
    }

    return (this.attachment as any).primaryInd
  }

  set isPrimary (primary) {
    (this.attachment as any).primaryInd = primary
  }

  get commsSuitable () {
    return this.attachment.commsSuitable
  }

  set commsSuitable (commsSuitable) {
    this.attachment.commsSuitable = commsSuitable
  }

  edit () {
    let dialogRef = this.dialog.open(EditImageDialogComponent, {
      width: '350px',
      data: {
        attachment: this.attachment
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateIncidentAttachment();
      }
      this.cdr.detectChanges();
    });
  }

  includeInGallery () {
    this.attachment.commsSuitable = !this.attachment.commsSuitable;
    this.updateIncidentAttachment();
  }

  removeFlags (guid: string) {
    this.removePrimaryFlags.emit({ event: guid })
  }

  updateIncidentAttachment () {
    this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, this.attachment.attachmentGuid, undefined, this.attachment)
    .toPromise().then(() => {
      this.snackbarService.open('Image Updated Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
      this.loaded = false;
      this.loadPage.emit()
    }).catch(err => {
      this.snackbarService.open('Failed to Update Image: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
      this.loaded = false;
    })
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.loadImage();
  }

  ngOnInit (): void {
    this.loadImage();
  }

  ngDoCheck() {
    this.loadImage();
  }

  convertToDate(value: string | number | Date): string {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss')
    }
  }
  loadImage () {
    if (!this.loaded) {
      this.documentManagementService.downloadDocument(this.attachment.thumbnailIdentifier || this.attachment.fileIdentifier).toPromise().then(response => {
        const blob = (response as any).body
        if (blob) {
          this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
          this.cdr.detectChanges();
          this.loaded = true;
        } else {
          throw Error('File could not be found')
        }
      })
    }
  }
}
