import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PhotoUploadDialogComponent, UploadResult } from '../photo-upload-dialog/photo-upload-dialog.component';

@Component({
    selector: 'wfim-photo-upload',
    templateUrl: './photo-upload.component.html',
    styleUrls: [ './photo-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PhotoUploadComponent {
    @Input() attachmentCreator: ( fileId: string, uploadPath: string, mimeType: string, description: string, category: string ) => Promise<any>;
    @Output() uploadFiles = new EventEmitter<UploadResult[]>();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected matDialog: MatDialog,
    ) { }

    onSelectFiles( fileInputEl ) {
        fileInputEl.value = null
        this.cdr.detectChanges()
    }

    onUpload(ev) {
        const dialogRef = this.matDialog.open( PhotoUploadDialogComponent, {
            minWidth: 400,
            maxWidth: 500,
            data: {
                files: ev.target.files,
                attachmentCreator: this.attachmentCreator,
            }
        } )

        dialogRef.afterClosed().subscribe( ( results: UploadResult[] ) => {
            // console.log('The dialog was closed',result);

            this.uploadFiles.emit( results )
        } )
    }
}
