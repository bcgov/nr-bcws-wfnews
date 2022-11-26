import { ChangeDetectorRef, Component, Input} from '@angular/core';
import * as moment from 'moment';
import { DefaultService as ExternalUriService } from '@wf1/incidents-rest-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditVideoDialogComponent } from '../edit-video-dialog/edit-video-dialog.component';
import { convertToYoutubeId } from '../../../../utils';

@Component({
  selector: 'video-card-panel',
  templateUrl: './video-card-panel.component.html',
  styleUrls: ['./video-card-panel.component.scss']
})
export class VideoCardPanel{
  @Input() public incident
  @Input() public video: any

  public convertToYoutubeId = convertToYoutubeId

  public includeInPublicGallery = false;

  public imageSrc = null;
  public loaded = false;

  constructor (protected externalUriService: ExternalUriService,
               protected snackbarService: MatSnackBar,
               protected dialog: MatDialog,
               protected cdr: ChangeDetectorRef) { /* Empty */}

  edit () {
    let dialogRef = this.dialog.open(EditVideoDialogComponent, {
      width: '600px',
      data: {
        video: this.video
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateExternalUri(result.externalUri, result.externalUriDisplayLabel);
      }
      this.cdr.detectChanges();
    });
  }

  remove() {
      this.externalUriService.deleteExternalUri(this.video.externalUriGuid,'response').toPromise().then(() => {
        this.snackbarService.open('Video Deleted Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
        this.loaded = false
      }).catch(err => {
        this.snackbarService.open('Failed to Delete Video: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
        this.loaded = false;
      })
  }

  updateExternalUri (externalUri: string, externalUriDisplayLabel: string) {
    this.video.externalUri = externalUri
    this.video.externalUriDisplayLabel = externalUriDisplayLabel

      this.externalUriService.updateExternalUri(this.video.externalUriGuid,this.video,'response').toPromise().then(() => {
        this.snackbarService.open('Video Updated Successfully', 'OK', { duration: 0, panelClass: 'snackbar-success' });
        this.loaded = false
      }).catch(err => {
        this.snackbarService.open('Failed to Update Video: ' + JSON.stringify(err.message), 'OK', { duration: 0, panelClass: 'snackbar-error' });
        this.loaded = false;
      })
  }

  convertToDate(value: string | number | Date): string {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss')
    }
  }

  navigateToYoutube (attachment: any) {
    window.open(attachment.videoUrl, "_blank");
  }
}
