import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';
import { DocumentManagementService } from '../../../../services/document-management.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { DefaultService as IncidentAttachmentService } from '@wf1/incidents-rest-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditVideoDialogComponent } from '../edit-video-dialog/edit-video-dialog.component';

@Component({
  selector: 'video-card-panel',
  templateUrl: './video-card-panel.component.html',
  styleUrls: ['./video-card-panel.component.scss']
})
export class VideoCardPanel implements OnInit, OnChanges {
  @Input() public incident
  @Input() public attachment: any
  @Input() public isPrimary: boolean

  public includeInPublicGallery = false;

  public imageSrc = null;
  public loaded = false;

  constructor (private documentManagementService: DocumentManagementService,
               protected incidentAttachmentService: IncidentAttachmentService,
               protected snackbarService: MatSnackBar,
               protected dialog: MatDialog,
               private sanitizer: DomSanitizer,
               protected cdr: ChangeDetectorRef) { /* Empty */}

  changePrimary () {
    // this will have to set this attachment, but call the parent to
    // remove the current primary.
    // Not 100% if this is meta, News specific, or where the value goes yet...
  }

  edit () {
    console.log(this.attachment)
    let dialogRef = this.dialog.open(EditVideoDialogComponent, {
      width: '600px',
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

  remove() {

  }

  includeInGallery () {
    // not privateIndicator, a new one will be added for this.
    this.attachment.privateIndicator = !this.attachment.privateIndicator;
    this.updateIncidentAttachment();
  }

  updateIncidentAttachment () {
    this.incidentAttachmentService.updateIncidentAttachment(this.incident.wildfireYear, this.incident.incidentNumberSequence, this.attachment.attachmentGuid, this.attachment)
    .toPromise().then(() => {
      this.snackbarService.open('Image Updated Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
      this.loaded = false;
    }).catch(err => {
      this.snackbarService.open('Failed to Update Image: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
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
    // if (!this.loaded) {
    //   console.log(this.attachment)
    //   this.documentManagementService.downloadDocument(this.attachment.fileIdentifier).toPromise().then(response => {
    //     const blob = (response as any).body
    //     if (blob) {
    //       this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
    //       this.cdr.detectChanges();
    //       this.loaded = true;
    //     } else {
    //       throw Error('File could not be found')
    //     }
    //   })
    // }
    if (!this.loaded) {

    }
  }

  navigateToYoutube (attachment: any) {
    window.open(attachment.videoUrl, "_blank");
  }
}